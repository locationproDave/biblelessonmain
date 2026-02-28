# Payments & Subscription Routes
from fastapi import APIRouter, HTTPException, Header, Request
from datetime import datetime, timezone, timedelta
import uuid
import os
import logging
from typing import Dict, Any

from models.schemas import CheckoutRequest
from services.database import db

router = APIRouter(prefix="", tags=["Payments & Subscriptions"])
logger = logging.getLogger(__name__)

# Stripe API setup
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Pricing Plans Configuration
PRICING_PLANS = {
    "starter": {
        "id": "starter",
        "name": "Starter",
        "price": 9.99,
        "interval": "month",
        "lessonsLimit": 6,
        "features": {
            "lessons": 6,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": False,
            "teamMembers": 1,
            "priority": False
        },
        "description": "Perfect for individual teachers"
    },
    "starter_annual": {
        "id": "starter_annual",
        "name": "Starter",
        "price": 99.99,
        "monthlyEquivalent": 8.33,
        "interval": "year",
        "lessonsLimit": 6,
        "savings": "Save $20/year",
        "features": {
            "lessons": 6,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": False,
            "teamMembers": 1,
            "priority": False
        },
        "description": "Perfect for individual teachers"
    },
    "unlimited": {
        "id": "unlimited",
        "name": "Unlimited",
        "price": 19.99,
        "interval": "month",
        "lessonsLimit": 100,
        "features": {
            "lessons": "Unlimited",
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 3,
            "priority": True
        },
        "description": "Best for active teachers"
    },
    "unlimited_annual": {
        "id": "unlimited_annual",
        "name": "Unlimited",
        "price": 199.99,
        "monthlyEquivalent": 16.67,
        "interval": "year",
        "lessonsLimit": 100,
        "savings": "Save $40/year",
        "features": {
            "lessons": "Unlimited",
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 3,
            "priority": True
        },
        "description": "Best for active teachers"
    },
    "small_church": {
        "id": "small_church",
        "name": "Small Church",
        "price": 29.99,
        "interval": "month",
        "lessonsLimit": 20,
        "features": {
            "lessons": 20,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 3,
            "priority": True,
            "classes": "1-3"
        },
        "description": "For churches with 1-3 classes"
    },
    "small_church_annual": {
        "id": "small_church_annual",
        "name": "Small Church",
        "price": 299.99,
        "monthlyEquivalent": 25.00,
        "interval": "year",
        "lessonsLimit": 20,
        "savings": "Save $60/year",
        "features": {
            "lessons": 20,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 3,
            "priority": True,
            "classes": "1-3"
        },
        "description": "For churches with 1-3 classes"
    },
    "medium_church": {
        "id": "medium_church",
        "name": "Medium Church",
        "price": 59.99,
        "interval": "month",
        "lessonsLimit": 50,
        "features": {
            "lessons": 50,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 10,
            "priority": True,
            "classes": "4-8"
        },
        "description": "For churches with 4-8 classes"
    },
    "medium_church_annual": {
        "id": "medium_church_annual",
        "name": "Medium Church",
        "price": 599.99,
        "monthlyEquivalent": 50.00,
        "interval": "year",
        "lessonsLimit": 50,
        "savings": "Save $120/year",
        "features": {
            "lessons": 50,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 10,
            "priority": True,
            "classes": "4-8"
        },
        "description": "For churches with 4-8 classes"
    },
    "large_church": {
        "id": "large_church",
        "name": "Large Church",
        "price": 99.99,
        "interval": "month",
        "lessonsLimit": 150,
        "features": {
            "lessons": 150,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 25,
            "priority": True,
            "classes": "9+"
        },
        "description": "For churches with 9+ classes"
    },
    "large_church_annual": {
        "id": "large_church_annual",
        "name": "Large Church",
        "price": 999.99,
        "monthlyEquivalent": 83.33,
        "interval": "year",
        "lessonsLimit": 150,
        "savings": "Save $200/year",
        "features": {
            "lessons": 150,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 25,
            "priority": True,
            "classes": "9+"
        },
        "description": "For churches with 9+ classes"
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "price": 199.99,
        "interval": "month",
        "lessonsLimit": 500,
        "features": {
            "lessons": "Unlimited",
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 100,
            "priority": True,
            "classes": "Unlimited",
            "multiSite": True,
            "dedicatedSupport": True
        },
        "description": "For multi-site churches & organizations"
    },
    "enterprise_annual": {
        "id": "enterprise_annual",
        "name": "Enterprise",
        "price": 1999.99,
        "monthlyEquivalent": 166.67,
        "interval": "year",
        "lessonsLimit": 500,
        "savings": "Save $400/year",
        "features": {
            "lessons": "Unlimited",
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 100,
            "priority": True,
            "classes": "Unlimited",
            "multiSite": True,
            "dedicatedSupport": True
        },
        "description": "For multi-site churches & organizations"
    }
}

def serialize_doc(doc: dict) -> dict:
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != '_id'}
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result

async def get_current_user(token: str = None) -> dict:
    if not token:
        return None
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    user = await db.users.find_one({"id": session["userId"]})
    return serialize_doc(user)

@router.get("/pricing/plans")
async def get_pricing_plans():
    """Get all available pricing plans"""
    return {
        "plans": PRICING_PLANS,
        "individual": ["starter", "starter_annual", "unlimited", "unlimited_annual"],
        "organization": ["small_church", "small_church_annual", "medium_church", "medium_church_annual", 
                        "large_church", "large_church_annual", "enterprise", "enterprise_annual"]
    }

@router.get("/subscription")
async def get_subscription(authorization: str = Header(None)):
    """Get current user's subscription"""
    if not authorization:
        return None
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    
    subscription = await db.subscriptions.find_one({"userId": session["userId"]}, {"_id": 0})
    
    if not subscription:
        return {
            "id": None,
            "userId": session["userId"],
            "planId": "free",
            "planName": "Free Trial",
            "status": "active",
            "lessonsUsed": 0,
            "lessonsLimit": 3,
            "currentPeriodEnd": None,
            "features": {
                "lessons": 3,
                "quizzes": True,
                "supplyLists": True,
                "emailDelivery": False,
                "curriculumPlanner": False,
                "teamMembers": 1,
                "priority": False
            }
        }
    
    plan = PRICING_PLANS.get(subscription.get("planId", "free"), {})
    subscription["planName"] = plan.get("name", "Free Trial")
    subscription["features"] = plan.get("features", {})
    subscription["lessonsLimit"] = plan.get("lessonsLimit", 3)
    
    return subscription

@router.get("/subscription/usage")
async def get_subscription_usage(authorization: str = Header(None)):
    """Get current subscription usage"""
    if not authorization:
        return {"used": 0, "limit": 3, "remaining": 3}
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return {"used": 0, "limit": 3, "remaining": 3}
    
    subscription = await db.subscriptions.find_one({"userId": session["userId"]})
    plan = PRICING_PLANS.get(subscription.get("planId", "free") if subscription else "free", {})
    limit = plan.get("lessonsLimit", 3)
    
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    used = await db.lessons.count_documents({
        "userId": session["userId"],
        "createdAt": {"$gte": month_start.isoformat()}
    })
    
    return {
        "used": used,
        "limit": limit,
        "remaining": max(0, limit - used),
        "planId": subscription.get("planId", "free") if subscription else "free"
    }

@router.get("/subscription/check-limit")
async def check_subscription_limit_route(authorization: str = Header(None)):
    """Check if user can create more lessons"""
    if not authorization:
        return {"allowed": True, "used": 0, "limit": 3, "remaining": 3}
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return {"allowed": True, "used": 0, "limit": 3, "remaining": 3}
    
    subscription = await db.subscriptions.find_one({"userId": session["userId"]})
    plan = PRICING_PLANS.get(subscription.get("planId", "free") if subscription else "free", {})
    limit = plan.get("lessonsLimit", 3)
    
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    used = await db.lessons.count_documents({
        "userId": session["userId"],
        "createdAt": {"$gte": month_start.isoformat()}
    })
    
    return {
        "allowed": used < limit,
        "used": used,
        "limit": limit,
        "remaining": max(0, limit - used),
        "planId": subscription.get("planId", "free") if subscription else "free"
    }

@router.post("/checkout/create-session")
async def create_checkout_session(data: CheckoutRequest, authorization: str = Header(None)):
    """Create a Stripe checkout session"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if data.planId not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = PRICING_PLANS[data.planId]
    
    if not STRIPE_API_KEY:
        logger.warning("Stripe API key not configured")
        session_id = f"demo_{uuid.uuid4()}"
        return {
            "sessionId": session_id,
            "url": f"{data.originUrl}/checkout/success?session_id={session_id}&plan={data.planId}",
            "demo": True
        }
    
    try:
        import stripe
        stripe.api_key = STRIPE_API_KEY
        
        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"{plan['name']} Plan - Bible Lesson Planner",
                        "description": plan.get("description", ""),
                    },
                    "unit_amount": int(plan["price"] * 100),
                    "recurring": {
                        "interval": plan["interval"]
                    }
                },
                "quantity": 1
            }],
            mode="subscription",
            success_url=f"{data.originUrl}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{data.originUrl}/pricing?canceled=true",
            metadata={
                "userId": user["id"],
                "planId": data.planId
            }
        )
        
        return {
            "sessionId": checkout_session.id,
            "url": checkout_session.url
        }
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail="Payment processing error")

@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, authorization: str = Header(None)):
    """Get checkout session status"""
    if session_id.startswith("demo_"):
        return {
            "status": "complete",
            "paymentStatus": "paid",
            "demo": True,
            "message": "Demo checkout completed"
        }
    
    if not STRIPE_API_KEY:
        return {"status": "unknown", "message": "Stripe not configured"}
    
    try:
        import stripe
        stripe.api_key = STRIPE_API_KEY
        
        session = stripe.checkout.Session.retrieve(session_id)
        
        return {
            "status": session.status,
            "paymentStatus": session.payment_status,
            "customerEmail": session.customer_details.email if session.customer_details else None
        }
    except Exception as e:
        logger.error(f"Error fetching checkout status: {e}")
        raise HTTPException(status_code=500, detail="Error fetching checkout status")

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    
    try:
        import json
        event = json.loads(payload)
        event_type = event.get("type", "")
        
        if event_type == "checkout.session.completed":
            session = event.get("data", {}).get("object", {})
            metadata = session.get("metadata", {})
            user_id = metadata.get("userId")
            plan_id = metadata.get("planId")
            
            if user_id and plan_id:
                plan = PRICING_PLANS.get(plan_id, {})
                
                subscription_data = {
                    "id": str(uuid.uuid4()),
                    "userId": user_id,
                    "planId": plan_id,
                    "status": "active",
                    "stripeSessionId": session.get("id"),
                    "stripeSubscriptionId": session.get("subscription"),
                    "lessonsUsed": 0,
                    "lessonsLimit": plan.get("lessonsLimit", 3),
                    "currentPeriodStart": datetime.now(timezone.utc).isoformat(),
                    "currentPeriodEnd": (datetime.now(timezone.utc) + timedelta(days=30 if plan.get("interval") == "month" else 365)).isoformat(),
                    "createdAt": datetime.now(timezone.utc).isoformat()
                }
                
                await db.subscriptions.update_one(
                    {"userId": user_id},
                    {"$set": subscription_data},
                    upsert=True
                )
                
                logger.info(f"Subscription created/updated for user {user_id}: {plan_id}")
        
        elif event_type == "customer.subscription.updated":
            subscription = event.get("data", {}).get("object", {})
            stripe_sub_id = subscription.get("id")
            status = subscription.get("status")
            
            await db.subscriptions.update_one(
                {"stripeSubscriptionId": stripe_sub_id},
                {"$set": {"status": status, "updatedAt": datetime.now(timezone.utc).isoformat()}}
            )
        
        elif event_type == "customer.subscription.deleted":
            subscription = event.get("data", {}).get("object", {})
            stripe_sub_id = subscription.get("id")
            
            await db.subscriptions.update_one(
                {"stripeSubscriptionId": stripe_sub_id},
                {"$set": {"status": "canceled", "canceledAt": datetime.now(timezone.utc).isoformat()}}
            )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook error")
