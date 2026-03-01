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

# Add-ons Configuration (for organization plans)
ADD_ONS = {
    "biblical_map_quiz": {
        "id": "biblical_map_quiz",
        "name": "Biblical Map & Quiz Generator",
        "price": 1.99,
        "interval": "month",
        "description": "Unlock AI-powered Biblical Map Generator and Quiz Generator features",
        "features": ["biblicalMapQuiz"]
    }
}

# Pricing Plans Configuration
PRICING_PLANS = {
    # Individual Plans
    "starter": {
        "id": "starter",
        "name": "Starter",
        "price": 5.99,
        "interval": "month",
        "lessonsLimit": 4,
        "features": {
            "lessons": 4,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": False,
            "teamMembers": 1,
            "priority": False,
            "biblicalMapQuiz": False
        },
        "description": "Perfect for individual teachers getting started"
    },
    "starter_annual": {
        "id": "starter_annual",
        "name": "Starter",
        "price": 65,
        "monthlyEquivalent": 5.42,
        "interval": "year",
        "lessonsLimit": 4,
        "savings": "Save 10%",
        "features": {
            "lessons": 4,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": False,
            "teamMembers": 1,
            "priority": False,
            "biblicalMapQuiz": False
        },
        "description": "Perfect for individual teachers getting started"
    },
    "unlimited": {
        "id": "unlimited",
        "name": "Unlimited",
        "price": 9.99,
        "interval": "month",
        "lessonsLimit": 999,
        "features": {
            "lessons": "Unlimited",
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 1,
            "priority": True,
            "biblicalMapQuiz": True
        },
        "description": "For dedicated teachers who need unlimited access"
    },
    "unlimited_annual": {
        "id": "unlimited_annual",
        "name": "Unlimited",
        "price": 99,
        "monthlyEquivalent": 8.25,
        "interval": "year",
        "lessonsLimit": 999,
        "savings": "Save 10%",
        "features": {
            "lessons": "Unlimited",
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 1,
            "priority": True,
            "biblicalMapQuiz": True
        },
        "description": "For dedicated teachers who need unlimited access"
    },
    # Organization Plans
    "team": {
        "id": "team",
        "name": "Team",
        "price": 14.99,
        "interval": "month",
        "lessonsLimit": 12,
        "features": {
            "lessons": 12,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 3,
            "priority": True,
            "biblicalMapQuiz": False
        },
        "availableAddOns": ["biblical_map_quiz"],
        "description": "Small groups and teaching teams"
    },
    "team_annual": {
        "id": "team_annual",
        "name": "Team",
        "price": 162,
        "monthlyEquivalent": 13.50,
        "interval": "year",
        "lessonsLimit": 12,
        "savings": "Save 10%",
        "features": {
            "lessons": 12,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 3,
            "priority": True,
            "biblicalMapQuiz": False
        },
        "availableAddOns": ["biblical_map_quiz"],
        "description": "Small groups and teaching teams"
    },
    "ministry": {
        "id": "ministry",
        "name": "Ministry",
        "price": 29.99,
        "interval": "month",
        "lessonsLimit": 24,
        "features": {
            "lessons": 24,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 6,
            "priority": True,
            "biblicalMapQuiz": False
        },
        "availableAddOns": ["biblical_map_quiz"],
        "description": "Growing ministries and churches"
    },
    "ministry_annual": {
        "id": "ministry_annual",
        "name": "Ministry",
        "price": 324,
        "monthlyEquivalent": 27.00,
        "interval": "year",
        "lessonsLimit": 24,
        "savings": "Save 10%",
        "features": {
            "lessons": 24,
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": 6,
            "priority": True,
            "biblicalMapQuiz": False
        },
        "availableAddOns": ["biblical_map_quiz"],
        "description": "Growing ministries and churches"
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "price": "contact",
        "interval": "month",
        "lessonsLimit": 9999,
        "features": {
            "lessons": "Unlimited",
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": "Unlimited",
            "priority": True,
            "dedicatedSupport": True,
            "biblicalMapQuiz": True
        },
        "description": "Schools, school districts, and large church organizations"
    },
    "enterprise_annual": {
        "id": "enterprise_annual",
        "name": "Enterprise",
        "price": "contact",
        "interval": "year",
        "lessonsLimit": 9999,
        "features": {
            "lessons": "Unlimited",
            "quizzes": True,
            "supplyLists": True,
            "emailDelivery": True,
            "curriculumPlanner": True,
            "teamMembers": "Unlimited",
            "priority": True,
            "dedicatedSupport": True,
            "biblicalMapQuiz": True
        },
        "description": "Schools, school districts, and large church organizations"
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
        "addOns": ADD_ONS,
        "individual": ["starter", "starter_annual", "unlimited", "unlimited_annual"],
        "organization": ["team", "team_annual", "ministry", "ministry_annual", 
                        "enterprise", "enterprise_annual"]
    }

@router.get("/pricing/add-ons")
async def get_add_ons():
    """Get available add-ons"""
    return ADD_ONS

@router.get("/feature-access/{feature_name}")
async def check_feature_access(feature_name: str, authorization: str = Header(None)):
    """Check if user has access to a specific feature"""
    if not authorization:
        return {"hasAccess": False, "reason": "not_authenticated"}
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        return {"hasAccess": False, "reason": "invalid_session"}
    
    # Get subscription
    subscription = await db.subscriptions.find_one({"userId": session["userId"]})
    if not subscription:
        return {"hasAccess": False, "reason": "no_subscription", "upgradeRequired": True}
    
    plan_id = subscription.get("planId", "free")
    plan = PRICING_PLANS.get(plan_id, {})
    features = plan.get("features", {})
    
    # Check if feature is included in plan
    if features.get(feature_name, False):
        return {"hasAccess": True, "includedInPlan": True}
    
    # Check if user has purchased this feature as an add-on
    user_add_ons = subscription.get("addOns", [])
    for add_on_id in user_add_ons:
        add_on = ADD_ONS.get(add_on_id, {})
        if feature_name in add_on.get("features", []):
            return {"hasAccess": True, "addOn": add_on_id}
    
    # Feature not available - check if it can be purchased as add-on
    available_add_ons = plan.get("availableAddOns", [])
    purchasable_add_on = None
    for add_on_id in available_add_ons:
        add_on = ADD_ONS.get(add_on_id, {})
        if feature_name in add_on.get("features", []):
            purchasable_add_on = add_on
            break
    
    if purchasable_add_on:
        return {
            "hasAccess": False,
            "reason": "add_on_required",
            "addOn": purchasable_add_on,
            "canPurchase": True
        }
    
    # Feature requires plan upgrade
    is_individual_plan = plan_id in ["starter", "starter_annual", "free"]
    return {
        "hasAccess": False,
        "reason": "upgrade_required",
        "upgradeRequired": True,
        "suggestedPlan": "unlimited" if is_individual_plan else "enterprise"
    }

@router.post("/add-on/purchase/{add_on_id}")
async def purchase_add_on(add_on_id: str, authorization: str = Header(None)):
    """Purchase an add-on for the current subscription"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Validate add-on exists
    add_on = ADD_ONS.get(add_on_id)
    if not add_on:
        raise HTTPException(status_code=404, detail="Add-on not found")
    
    # Get subscription
    subscription = await db.subscriptions.find_one({"userId": session["userId"]})
    if not subscription:
        raise HTTPException(status_code=400, detail="No active subscription found")
    
    plan_id = subscription.get("planId", "free")
    plan = PRICING_PLANS.get(plan_id, {})
    available_add_ons = plan.get("availableAddOns", [])
    
    if add_on_id not in available_add_ons:
        raise HTTPException(status_code=400, detail="This add-on is not available for your plan")
    
    # Check if already purchased
    user_add_ons = subscription.get("addOns", [])
    if add_on_id in user_add_ons:
        return {"success": True, "message": "Add-on already active", "addOn": add_on}
    
    # Add the add-on to subscription (in production, integrate with Stripe)
    await db.subscriptions.update_one(
        {"userId": session["userId"]},
        {
            "$addToSet": {"addOns": add_on_id},
            "$set": {"updatedAt": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    logger.info(f"Add-on {add_on_id} purchased for user {session['userId']}")
    return {"success": True, "message": "Add-on activated", "addOn": add_on}

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
