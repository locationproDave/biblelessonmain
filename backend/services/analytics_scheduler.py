# Daily Analytics Email Scheduler
# Sends daily site analytics at 6:00 AM UTC
import os
import asyncio
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import requests
import logging

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
ADMIN_EMAIL = "hello@biblelessonplanner.com"

# Initialize scheduler
scheduler = AsyncIOScheduler()

async def gather_daily_analytics():
    """Gather analytics for the previous day"""
    from services.database import db
    
    # Calculate yesterday's date range (UTC)
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today - timedelta(days=1)
    yesterday_end = today
    
    yesterday_start_iso = yesterday_start.isoformat()
    yesterday_end_iso = yesterday_end.isoformat()
    
    # Get new users from yesterday
    new_users_cursor = db.users.find({
        "createdAt": {"$gte": yesterday_start_iso, "$lt": yesterday_end_iso}
    }, {"_id": 0, "name": 1, "email": 1, "createdAt": 1})
    new_users = await new_users_cursor.to_list(1000)
    new_user_count = len(new_users)
    
    # Get total users
    total_users = await db.users.count_documents({})
    
    # Get lessons created yesterday
    lessons_created_cursor = db.lessons.find({
        "createdAt": {"$gte": yesterday_start_iso, "$lt": yesterday_end_iso}
    }, {"_id": 0, "title": 1, "ageGroup": 1})
    lessons_created = await lessons_created_cursor.to_list(1000)
    lessons_created_count = len(lessons_created)
    
    # Get total lessons
    total_lessons = await db.lessons.count_documents({})
    
    # Get lessons edited yesterday (looking at updatedAt)
    lessons_edited_cursor = db.lessons.find({
        "updatedAt": {"$gte": yesterday_start_iso, "$lt": yesterday_end_iso}
    }, {"_id": 0})
    lessons_edited = await lessons_edited_cursor.to_list(1000)
    lessons_edited_count = len(lessons_edited)
    
    # Get active sessions from yesterday (approximation of active users)
    active_sessions_cursor = db.sessions.find({
        "createdAt": {"$gte": yesterday_start_iso, "$lt": yesterday_end_iso}
    }, {"_id": 0, "userId": 1})
    active_sessions = await active_sessions_cursor.to_list(1000)
    unique_active_users = len(set(s.get("userId") for s in active_sessions if s.get("userId")))
    
    return {
        "date": yesterday_start.strftime("%B %d, %Y"),
        "new_users": new_user_count,
        "new_users_list": new_users[:10],  # Top 10 for email
        "total_users": total_users,
        "lessons_created": lessons_created_count,
        "lessons_created_list": lessons_created[:10],  # Top 10 for email
        "total_lessons": total_lessons,
        "lessons_edited": lessons_edited_count,
        "active_users": unique_active_users,
    }

def send_analytics_email(analytics: dict):
    """Send daily analytics email"""
    if not RESEND_API_KEY:
        logger.warning("[Analytics] Email skipped - RESEND_API_KEY not configured")
        return False
    
    try:
        # Build new users list HTML
        new_users_html = ""
        if analytics.get("new_users_list"):
            new_users_html = "<ul style='margin: 8px 0; padding-left: 20px;'>"
            for user in analytics["new_users_list"]:
                new_users_html += f"<li>{user.get('name', 'Unknown')} ({user.get('email', 'N/A')})</li>"
            new_users_html += "</ul>"
        else:
            new_users_html = "<p style='color: #6b7280; font-style: italic;'>No new signups yesterday</p>"
        
        # Build lessons created list HTML
        lessons_html = ""
        if analytics.get("lessons_created_list"):
            lessons_html = "<ul style='margin: 8px 0; padding-left: 20px;'>"
            for lesson in analytics["lessons_created_list"]:
                lessons_html += f"<li>{lesson.get('title', 'Untitled')} ({lesson.get('ageGroup', 'N/A')})</li>"
            lessons_html += "</ul>"
        else:
            lessons_html = "<p style='color: #6b7280; font-style: italic;'>No new lessons yesterday</p>"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 24px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 24px; }}
                .header p {{ color: rgba(255,255,255,0.9); margin: 8px 0 0 0; }}
                .content {{ padding: 32px; }}
                .stats-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }}
                .stat-card {{ background: #fef3c7; border-radius: 12px; padding: 20px; text-align: center; }}
                .stat-value {{ font-size: 32px; font-weight: bold; color: #d97706; }}
                .stat-label {{ color: #6b7280; font-size: 14px; margin-top: 4px; }}
                .section {{ margin: 24px 0; padding: 16px; background: #f9fafb; border-radius: 12px; }}
                .section-title {{ font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }}
                .footer {{ padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Daily Analytics Report</h1>
                    <p>{analytics['date']}</p>
                </div>
                <div class="content">
                    <h2 style="color: #1f2937; margin-top: 0;">Your site performance yesterday</h2>
                    
                    <table width="100%" cellpadding="10" style="margin: 24px 0;">
                        <tr>
                            <td style="background: #fef3c7; border-radius: 12px; text-align: center; padding: 20px;">
                                <div style="font-size: 32px; font-weight: bold; color: #d97706;">{analytics['new_users']}</div>
                                <div style="color: #6b7280; font-size: 14px;">New Signups</div>
                            </td>
                            <td style="background: #fef3c7; border-radius: 12px; text-align: center; padding: 20px;">
                                <div style="font-size: 32px; font-weight: bold; color: #d97706;">{analytics['lessons_created']}</div>
                                <div style="color: #6b7280; font-size: 14px;">Lessons Created</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="background: #fef3c7; border-radius: 12px; text-align: center; padding: 20px;">
                                <div style="font-size: 32px; font-weight: bold; color: #d97706;">{analytics['lessons_edited']}</div>
                                <div style="color: #6b7280; font-size: 14px;">Lessons Edited</div>
                            </td>
                            <td style="background: #fef3c7; border-radius: 12px; text-align: center; padding: 20px;">
                                <div style="font-size: 32px; font-weight: bold; color: #d97706;">{analytics['active_users']}</div>
                                <div style="color: #6b7280; font-size: 14px;">Active Users</div>
                            </td>
                        </tr>
                    </table>
                    
                    <div style="background: #ecfdf5; padding: 16px; border-radius: 12px; margin: 24px 0;">
                        <p style="margin: 0; color: #065f46;"><strong>Total Users:</strong> {analytics['total_users']} | <strong>Total Lessons:</strong> {analytics['total_lessons']}</p>
                    </div>
                    
                    <div style="margin: 24px 0; padding: 16px; background: #f9fafb; border-radius: 12px;">
                        <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">New Users</div>
                        {new_users_html}
                    </div>
                    
                    <div style="margin: 24px 0; padding: 16px; background: #f9fafb; border-radius: 12px;">
                        <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">Lessons Created</div>
                        {lessons_html}
                    </div>
                </div>
                <div class="footer">
                    <p>Bible Lesson Planner - Daily Analytics Report</p>
                    <p>Sent at 6:00 AM UTC</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {RESEND_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'from': 'Bible Lesson Planner <onboarding@resend.dev>',
                'to': [ADMIN_EMAIL],
                'subject': f"Daily Analytics Report - {analytics['date']}",
                'html': html_content
            }
        )
        
        if response.status_code in [200, 201]:
            logger.info(f"[Analytics] Daily report sent to {ADMIN_EMAIL}")
            return True
        else:
            logger.error(f"[Analytics] Email failed: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"[Analytics] Email error: {e}")
        return False

async def send_daily_analytics():
    """Job that runs daily to gather and send analytics"""
    logger.info("[Analytics] Running daily analytics job...")
    try:
        analytics = await gather_daily_analytics()
        send_analytics_email(analytics)
        logger.info("[Analytics] Daily analytics job completed")
    except Exception as e:
        logger.error(f"[Analytics] Job failed: {e}")

def start_scheduler():
    """Start the analytics scheduler"""
    # Schedule to run at 6:00 AM UTC every day
    scheduler.add_job(
        send_daily_analytics,
        CronTrigger(hour=6, minute=0, timezone='UTC'),
        id='daily_analytics',
        name='Daily Analytics Email',
        replace_existing=True
    )
    scheduler.start()
    logger.info("[Analytics] Scheduler started - Daily analytics email scheduled for 6:00 AM UTC")

def stop_scheduler():
    """Stop the analytics scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("[Analytics] Scheduler stopped")
