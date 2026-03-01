"""
Pricing and Subscription API Tests
Tests: Pricing plans, Subscription status, Checkout session creation
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://claude-ai-features.preview.emergentagent.com').rstrip('/') + "/api"
TEST_PASSWORD = "testpassword123"


class TestPricingPlans:
    """Pricing plans endpoint tests"""
    
    def test_get_pricing_plans(self):
        """Test that pricing plans endpoint returns correct structure"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "individual" in data
        assert "organization" in data
        assert isinstance(data["individual"], list)
        assert isinstance(data["organization"], list)
        print("✓ Pricing plans endpoint returns correct structure")
    
    def test_individual_plans_count_and_pricing(self):
        """Test individual plans have correct count and pricing"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        data = response.json()
        
        individual = data["individual"]
        assert len(individual) == 2  # Starter and Unlimited
        
        # Check Starter plan
        starter = next((p for p in individual if p["id"] == "starter"), None)
        assert starter is not None
        assert starter["name"] == "Starter"
        assert starter["price"] == 9.99
        assert starter["interval"] == "month"
        assert starter["lessonsLimit"] == 6
        print("✓ Starter plan: $9.99/month, 6 lessons limit")
        
        # Check Unlimited plan
        unlimited = next((p for p in individual if p["id"] == "unlimited"), None)
        assert unlimited is not None
        assert unlimited["name"] == "Unlimited"
        assert unlimited["price"] == 19.99
        assert unlimited["interval"] == "month"
        print("✓ Unlimited plan: $19.99/month")
    
    def test_organization_plans_count_and_pricing(self):
        """Test organization plans have correct count and pricing"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        data = response.json()
        
        org = data["organization"]
        assert len(org) == 4  # Small, Medium, Large, Enterprise
        
        # Check Small Church plan
        small = next((p for p in org if p["id"] == "small_church"), None)
        assert small is not None
        assert small["name"] == "Small Church"
        assert small["price"] == 29.99
        assert small["features"]["classes"] == "1-3"
        print("✓ Small Church plan: $29.99/month, 1-3 classes")
        
        # Check Medium Church plan
        medium = next((p for p in org if p["id"] == "medium_church"), None)
        assert medium is not None
        assert medium["name"] == "Medium Church"
        assert medium["price"] == 59.99
        assert medium["features"]["classes"] == "4-8"
        print("✓ Medium Church plan: $59.99/month, 4-8 classes")
        
        # Check Large Church plan
        large = next((p for p in org if p["id"] == "large_church"), None)
        assert large is not None
        assert large["name"] == "Large Church"
        assert large["price"] == 99.99
        assert large["features"]["classes"] == "9+"
        print("✓ Large Church plan: $99.99/month, 9+ classes")
        
        # Check Enterprise plan
        enterprise = next((p for p in org if p["id"] == "enterprise"), None)
        assert enterprise is not None
        assert enterprise["name"] == "Enterprise"
        assert enterprise["price"] == 199.99
        assert enterprise["features"]["multiSite"] == True
        assert enterprise["features"]["dedicatedSupport"] == True
        print("✓ Enterprise plan: $199.99/month, multi-site + dedicated support")


class TestSubscription:
    """Subscription status tests"""
    
    def test_subscription_without_auth(self):
        """Test subscription endpoint returns free tier without auth"""
        response = requests.get(f"{BASE_URL}/subscription")
        assert response.status_code == 200
        data = response.json()
        
        assert data["subscription"] is None
        assert data["isFreeTier"] == True
        assert data["plan"]["id"] == "starter"
        print("✓ Unauthenticated user gets free tier")
    
    def test_subscription_with_auth(self):
        """Test subscription endpoint with authenticated user"""
        # Create test user
        email = f"sub_test_{uuid.uuid4().hex[:8]}@example.com"
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        token = signup_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/subscription", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # New user should be on free tier
        assert data["isFreeTier"] == True
        assert "plan" in data
        print("✓ Authenticated user subscription check works")
    
    def test_subscription_usage(self):
        """Test subscription usage endpoint requires auth"""
        # Without auth
        response = requests.get(f"{BASE_URL}/subscription/usage")
        assert response.status_code == 401
        print("✓ Subscription usage requires authentication")
        
        # With auth
        email = f"usage_test_{uuid.uuid4().hex[:8]}@example.com"
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        token = signup_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/subscription/usage", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "lessonsUsed" in data
        assert "lessonsLimit" in data
        assert "periodStart" in data
        assert "periodEnd" in data
        print("✓ Subscription usage returns usage stats")


class TestCheckout:
    """Checkout session tests"""
    
    def test_create_checkout_session_starter(self):
        """Test creating checkout session for Starter plan"""
        response = requests.post(f"{BASE_URL}/checkout/create-session", json={
            "planId": "starter",
            "originUrl": "https://claude-ai-features.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "url" in data
        assert "sessionId" in data
        assert data["url"].startswith("https://checkout.stripe.com")
        print(f"✓ Starter checkout session created: {data['sessionId'][:20]}...")
    
    def test_create_checkout_session_unlimited(self):
        """Test creating checkout session for Unlimited plan"""
        response = requests.post(f"{BASE_URL}/checkout/create-session", json={
            "planId": "unlimited",
            "originUrl": "https://claude-ai-features.preview.emergentagent.com"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "url" in data
        assert "sessionId" in data
        print(f"✓ Unlimited checkout session created: {data['sessionId'][:20]}...")
    
    def test_create_checkout_session_organization_plans(self):
        """Test creating checkout sessions for organization plans"""
        org_plans = ["small_church", "medium_church", "large_church", "enterprise"]
        
        for plan_id in org_plans:
            response = requests.post(f"{BASE_URL}/checkout/create-session", json={
                "planId": plan_id,
                "originUrl": "https://claude-ai-features.preview.emergentagent.com"
            })
            assert response.status_code == 200
            data = response.json()
            assert "url" in data
            assert "sessionId" in data
            print(f"✓ {plan_id} checkout session created")
    
    def test_create_checkout_session_invalid_plan(self):
        """Test creating checkout session with invalid plan fails"""
        response = requests.post(f"{BASE_URL}/checkout/create-session", json={
            "planId": "invalid_plan",
            "originUrl": "https://claude-ai-features.preview.emergentagent.com"
        })
        assert response.status_code == 400
        print("✓ Invalid plan rejected correctly")
    
    def test_checkout_status_endpoint(self):
        """Test checkout status endpoint"""
        # First create a session
        create_response = requests.post(f"{BASE_URL}/checkout/create-session", json={
            "planId": "starter",
            "originUrl": "https://claude-ai-features.preview.emergentagent.com"
        })
        session_id = create_response.json()["sessionId"]
        
        # Check status
        status_response = requests.get(f"{BASE_URL}/checkout/status/{session_id}")
        assert status_response.status_code == 200
        data = status_response.json()
        
        assert "status" in data
        assert "paymentStatus" in data
        assert "amount" in data
        assert "currency" in data
        print(f"✓ Checkout status: {data['status']}, payment: {data['paymentStatus']}")
    
    def test_checkout_with_authenticated_user(self):
        """Test checkout session creation with authenticated user"""
        # Create test user
        email = f"checkout_test_{uuid.uuid4().hex[:8]}@example.com"
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        token = signup_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        response = requests.post(f"{BASE_URL}/checkout/create-session", json={
            "planId": "unlimited",
            "originUrl": "https://claude-ai-features.preview.emergentagent.com"
        }, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "sessionId" in data
        print("✓ Authenticated user checkout session created")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
