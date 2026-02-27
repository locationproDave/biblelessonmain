# Admin Routes
from fastapi import APIRouter, HTTPException, Header, Depends
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging

from services.database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])

async def get_current_admin_user(authorization: str = Header(None)) -> dict:
    """Verify the user is authenticated and has admin role"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user = await db.users.find_one({"id": session["userId"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return user

@router.get("/analytics")
async def get_analytics(
    period: str = "7d",
    admin: dict = Depends(get_current_admin_user)
):
    """Get site analytics for admin dashboard"""
    
    # Calculate date range based on period
    now = datetime.now(timezone.utc)
    if period == "24h":
        start_date = now - timedelta(hours=24)
    elif period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=7)
    
    start_date_iso = start_date.isoformat()
    
    # Get new signups in period
    new_signups_cursor = db.users.find({
        "createdAt": {"$gte": start_date_iso}
    }, {"_id": 0, "id": 1, "name": 1, "email": 1, "createdAt": 1})
    new_signups = await new_signups_cursor.to_list(1000)
    
    # Get total users
    total_users = await db.users.count_documents({})
    
    # Get lessons created in period
    lessons_created_cursor = db.lessons.find({
        "createdAt": {"$gte": start_date_iso}
    }, {"_id": 0, "id": 1, "title": 1, "ageGroup": 1, "createdAt": 1})
    lessons_created = await lessons_created_cursor.to_list(1000)
    
    # Get total lessons
    total_lessons = await db.lessons.count_documents({})
    
    # Get active sessions in period (unique users)
    active_sessions_cursor = db.sessions.find({
        "createdAt": {"$gte": start_date_iso}
    }, {"_id": 0, "userId": 1})
    active_sessions = await active_sessions_cursor.to_list(10000)
    unique_active_users = len(set(s.get("userId") for s in active_sessions if s.get("userId")))
    
    # Calculate daily signups for chart
    daily_signups = {}
    for signup in new_signups:
        date_str = signup.get("createdAt", "")[:10]  # Get YYYY-MM-DD
        if date_str:
            daily_signups[date_str] = daily_signups.get(date_str, 0) + 1
    
    # Calculate daily lessons for chart
    daily_lessons = {}
    for lesson in lessons_created:
        date_str = lesson.get("createdAt", "")[:10]
        if date_str:
            daily_lessons[date_str] = daily_lessons.get(date_str, 0) + 1
    
    # Get age group distribution
    age_group_cursor = db.lessons.aggregate([
        {"$group": {"_id": "$ageGroup", "count": {"$sum": 1}}}
    ])
    age_groups = await age_group_cursor.to_list(100)
    age_group_distribution = {ag["_id"]: ag["count"] for ag in age_groups if ag["_id"]}
    
    return {
        "period": period,
        "startDate": start_date_iso,
        "metrics": {
            "newSignups": len(new_signups),
            "totalUsers": total_users,
            "lessonsCreated": len(lessons_created),
            "totalLessons": total_lessons,
            "activeUsers": unique_active_users,
        },
        "charts": {
            "dailySignups": daily_signups,
            "dailyLessons": daily_lessons,
            "ageGroupDistribution": age_group_distribution,
        },
        "recentSignups": new_signups[:10],
        "recentLessons": lessons_created[:10],
    }

@router.get("/users")
async def get_users(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    admin: dict = Depends(get_current_admin_user)
):
    """Get paginated list of users"""
    
    skip = (page - 1) * limit
    query = {}
    
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await db.users.count_documents(query)
    
    # Get users
    users_cursor = db.users.find(
        query, 
        {"_id": 0, "passwordHash": 0}
    ).sort("createdAt", -1).skip(skip).limit(limit)
    users = await users_cursor.to_list(limit)
    
    # Get lesson counts for each user
    for user in users:
        lesson_count = await db.lessons.count_documents({"userId": user["id"]})
        user["lessonCount"] = lesson_count
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

@router.get("/spending")
async def get_spending(
    period: str = "30d",
    admin: dict = Depends(get_current_admin_user)
):
    """Get site spending/revenue metrics"""
    
    # Calculate date range
    now = datetime.now(timezone.utc)
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    else:
        start_date = now - timedelta(days=30)
    
    start_date_iso = start_date.isoformat()
    
    # Get subscriptions/payments in period
    subscriptions_cursor = db.subscriptions.find({
        "createdAt": {"$gte": start_date_iso}
    }, {"_id": 0})
    subscriptions = await subscriptions_cursor.to_list(1000)
    
    # Calculate revenue by plan
    revenue_by_plan = {}
    total_revenue = 0
    
    plan_prices = {
        "starter": 0,
        "pro": 9.99,
        "team": 24.99
    }
    
    for sub in subscriptions:
        plan = sub.get("planId", "starter")
        price = plan_prices.get(plan, 0)
        revenue_by_plan[plan] = revenue_by_plan.get(plan, 0) + price
        total_revenue += price
    
    # Get subscription counts
    subscription_counts = {}
    all_subs_cursor = db.subscriptions.aggregate([
        {"$group": {"_id": "$planId", "count": {"$sum": 1}}}
    ])
    all_subs = await all_subs_cursor.to_list(100)
    subscription_counts = {s["_id"]: s["count"] for s in all_subs if s["_id"]}
    
    # Daily revenue calculation
    daily_revenue = {}
    for sub in subscriptions:
        date_str = sub.get("createdAt", "")[:10]
        plan = sub.get("planId", "starter")
        price = plan_prices.get(plan, 0)
        if date_str:
            daily_revenue[date_str] = daily_revenue.get(date_str, 0) + price
    
    return {
        "period": period,
        "metrics": {
            "totalRevenue": round(total_revenue, 2),
            "newSubscriptions": len(subscriptions),
            "subscriptionCounts": subscription_counts,
        },
        "revenueByPlan": revenue_by_plan,
        "dailyRevenue": daily_revenue,
    }

@router.get("/lessons-stats")
async def get_lessons_stats(
    period: str = "30d",
    admin: dict = Depends(get_current_admin_user)
):
    """Get detailed lesson statistics"""
    
    now = datetime.now(timezone.utc)
    if period == "7d":
        start_date = now - timedelta(days=7)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=30)
    
    start_date_iso = start_date.isoformat()
    
    # Get lessons created in period
    lessons_cursor = db.lessons.find({
        "createdAt": {"$gte": start_date_iso}
    }, {"_id": 0, "id": 1, "title": 1, "ageGroup": 1, "theme": 1, "duration": 1, "createdAt": 1})
    lessons = await lessons_cursor.to_list(1000)
    
    # Theme distribution
    theme_distribution = {}
    for lesson in lessons:
        theme = lesson.get("theme", "Unknown")
        theme_distribution[theme] = theme_distribution.get(theme, 0) + 1
    
    # Duration distribution
    duration_distribution = {}
    for lesson in lessons:
        duration = lesson.get("duration", "Unknown")
        duration_distribution[duration] = duration_distribution.get(duration, 0) + 1
    
    # Get total lessons by age group
    age_group_cursor = db.lessons.aggregate([
        {"$group": {"_id": "$ageGroup", "count": {"$sum": 1}}}
    ])
    age_groups = await age_group_cursor.to_list(100)
    age_group_distribution = {ag["_id"]: ag["count"] for ag in age_groups if ag["_id"]}
    
    return {
        "period": period,
        "totalCreated": len(lessons),
        "themeDistribution": theme_distribution,
        "durationDistribution": duration_distribution,
        "ageGroupDistribution": age_group_distribution,
        "recentLessons": lessons[:20],
    }

@router.get("/plan-breakdown")
async def get_plan_breakdown(
    admin: dict = Depends(get_current_admin_user)
):
    """Get breakdown of users by subscription plan"""
    
    # Define plan tiers
    plan_info = {
        "free": {"name": "Free", "price": 0, "color": "stone"},
        "starter": {"name": "Starter", "price": 0, "color": "stone"},
        "pro": {"name": "Pro", "price": 9.99, "color": "amber"},
        "team": {"name": "Team", "price": 24.99, "color": "blue"},
        "enterprise": {"name": "Enterprise", "price": 99.99, "color": "purple"},
    }
    
    # Get all users with their subscription status
    users_cursor = db.users.find({}, {"_id": 0, "id": 1, "name": 1, "email": 1, "createdAt": 1})
    users = await users_cursor.to_list(10000)
    
    # Get all subscriptions
    subs_cursor = db.subscriptions.find({"status": {"$in": ["active", "trialing"]}}, {"_id": 0})
    subscriptions = await subs_cursor.to_list(10000)
    
    # Build user -> plan mapping
    user_plans = {}
    for sub in subscriptions:
        user_id = sub.get("userId")
        plan_id = sub.get("planId", "free")
        if user_id:
            user_plans[user_id] = plan_id
    
    # Count users by plan
    plan_counts = {"free": 0, "starter": 0, "pro": 0, "team": 0, "enterprise": 0}
    plan_users = {"free": [], "starter": [], "pro": [], "team": [], "enterprise": []}
    
    for user in users:
        user_id = user.get("id")
        plan = user_plans.get(user_id, "free")
        if plan not in plan_counts:
            plan = "free"
        plan_counts[plan] += 1
        # Store user details for the plan (limit to 10 per plan for UI)
        if len(plan_users[plan]) < 10:
            plan_users[plan].append({
                "id": user.get("id"),
                "name": user.get("name", "Unknown"),
                "email": user.get("email"),
                "createdAt": user.get("createdAt"),
            })
    
    # Calculate totals and percentages
    total_users = len(users)
    plan_breakdown = []
    
    for plan_id, count in plan_counts.items():
        info = plan_info.get(plan_id, plan_info["free"])
        percentage = round((count / total_users * 100), 1) if total_users > 0 else 0
        plan_breakdown.append({
            "planId": plan_id,
            "planName": info["name"],
            "price": info["price"],
            "color": info["color"],
            "userCount": count,
            "percentage": percentage,
            "monthlyRevenue": round(count * info["price"], 2),
            "recentUsers": plan_users[plan_id],
        })
    
    # Sort by price (free first, then ascending)
    plan_breakdown.sort(key=lambda x: (x["price"] == 0, x["price"]))
    
    # Calculate MRR (Monthly Recurring Revenue)
    total_mrr = sum(p["monthlyRevenue"] for p in plan_breakdown)
    
    return {
        "totalUsers": total_users,
        "totalMRR": round(total_mrr, 2),
        "breakdown": plan_breakdown,
    }


@router.post("/set-admin/{user_id}")
async def set_user_admin(
    user_id: str,
    admin: dict = Depends(get_current_admin_user)
):
    """Set a user as admin (only existing admins can do this)"""
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": "admin"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": f"User {user_id} is now an admin"}

@router.post("/remove-admin/{user_id}")
async def remove_user_admin(
    user_id: str,
    admin: dict = Depends(get_current_admin_user)
):
    """Remove admin role from a user"""
    
    # Prevent removing own admin role
    if admin["id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot remove your own admin role")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": "user"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": f"Admin role removed from user {user_id}"}
