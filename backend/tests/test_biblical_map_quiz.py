"""
Test suite for Biblical Map & Quiz Generator feature access and pricing endpoints.
Tests:
- Feature access check API endpoint `/api/feature-access/biblicalMapQuiz`
- Pricing plans API includes `biblicalMapQuiz` feature flag
- Add-ons API endpoint `/api/pricing/add-ons` returns biblical_map_quiz add-on
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('VITE_API_URL', 'https://claude-ai-features.preview.emergentagent.com/api')


class TestPricingPlansAPI:
    """Tests for pricing plans endpoint with biblicalMapQuiz feature flag"""
    
    def test_pricing_plans_endpoint_returns_200(self):
        """Test that pricing plans endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ Pricing plans endpoint returned 200")
        
    def test_pricing_plans_contains_required_structure(self):
        """Test that pricing plans contains plans, addOns, individual, and organization keys"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        assert "plans" in data, "Response missing 'plans' key"
        assert "addOns" in data, "Response missing 'addOns' key"
        assert "individual" in data, "Response missing 'individual' key"
        assert "organization" in data, "Response missing 'organization' key"
        print("✅ Pricing plans contains required structure (plans, addOns, individual, organization)")
        
    def test_unlimited_plan_includes_biblical_map_quiz(self):
        """Test that Unlimited plan has biblicalMapQuiz: true"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        plans = data.get("plans", {})
        unlimited_plan = plans.get("unlimited", {})
        features = unlimited_plan.get("features", {})
        
        assert features.get("biblicalMapQuiz") == True, f"Expected biblicalMapQuiz=True in unlimited plan, got {features.get('biblicalMapQuiz')}"
        print("✅ Unlimited plan has biblicalMapQuiz: true")
        
    def test_unlimited_annual_plan_includes_biblical_map_quiz(self):
        """Test that Unlimited Annual plan has biblicalMapQuiz: true"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        plans = data.get("plans", {})
        unlimited_annual = plans.get("unlimited_annual", {})
        features = unlimited_annual.get("features", {})
        
        assert features.get("biblicalMapQuiz") == True, f"Expected biblicalMapQuiz=True in unlimited_annual plan, got {features.get('biblicalMapQuiz')}"
        print("✅ Unlimited Annual plan has biblicalMapQuiz: true")
        
    def test_starter_plan_excludes_biblical_map_quiz(self):
        """Test that Starter plan has biblicalMapQuiz: false"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        plans = data.get("plans", {})
        starter_plan = plans.get("starter", {})
        features = starter_plan.get("features", {})
        
        assert features.get("biblicalMapQuiz") == False, f"Expected biblicalMapQuiz=False in starter plan, got {features.get('biblicalMapQuiz')}"
        print("✅ Starter plan has biblicalMapQuiz: false")
        
    def test_team_plan_excludes_biblical_map_quiz_but_has_addon(self):
        """Test that Team plan has biblicalMapQuiz: false but can purchase add-on"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        plans = data.get("plans", {})
        team_plan = plans.get("team", {})
        features = team_plan.get("features", {})
        available_addons = team_plan.get("availableAddOns", [])
        
        assert features.get("biblicalMapQuiz") == False, f"Team plan should have biblicalMapQuiz=False"
        assert "biblical_map_quiz" in available_addons, f"Team plan should have biblical_map_quiz in availableAddOns"
        print("✅ Team plan has biblicalMapQuiz: false with add-on available")
        
    def test_ministry_plan_excludes_biblical_map_quiz_but_has_addon(self):
        """Test that Ministry plan has biblicalMapQuiz: false but can purchase add-on"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        plans = data.get("plans", {})
        ministry_plan = plans.get("ministry", {})
        features = ministry_plan.get("features", {})
        available_addons = ministry_plan.get("availableAddOns", [])
        
        assert features.get("biblicalMapQuiz") == False, f"Ministry plan should have biblicalMapQuiz=False"
        assert "biblical_map_quiz" in available_addons, f"Ministry plan should have biblical_map_quiz in availableAddOns"
        print("✅ Ministry plan has biblicalMapQuiz: false with add-on available")
        
    def test_enterprise_plan_includes_biblical_map_quiz(self):
        """Test that Enterprise plan has biblicalMapQuiz: true (included, not as add-on)"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        plans = data.get("plans", {})
        enterprise_plan = plans.get("enterprise", {})
        features = enterprise_plan.get("features", {})
        
        assert features.get("biblicalMapQuiz") == True, f"Expected biblicalMapQuiz=True in enterprise plan"
        print("✅ Enterprise plan has biblicalMapQuiz: true (included)")


class TestAddOnsAPI:
    """Tests for add-ons endpoint with biblical_map_quiz add-on"""
    
    def test_addons_endpoint_returns_200(self):
        """Test that add-ons endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/pricing/add-ons")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ Add-ons endpoint returned 200")
        
    def test_addons_contains_biblical_map_quiz(self):
        """Test that add-ons contains biblical_map_quiz"""
        response = requests.get(f"{BASE_URL}/pricing/add-ons")
        assert response.status_code == 200
        data = response.json()
        
        assert "biblical_map_quiz" in data, f"Response missing 'biblical_map_quiz' add-on"
        print("✅ Add-ons contains biblical_map_quiz")
        
    def test_biblical_map_quiz_addon_structure(self):
        """Test that biblical_map_quiz add-on has correct structure"""
        response = requests.get(f"{BASE_URL}/pricing/add-ons")
        assert response.status_code == 200
        data = response.json()
        
        addon = data.get("biblical_map_quiz", {})
        
        assert addon.get("id") == "biblical_map_quiz", f"Addon ID mismatch"
        assert addon.get("name") == "Biblical Map & Quiz Generator", f"Addon name mismatch: {addon.get('name')}"
        assert addon.get("price") == 1.99, f"Expected price $1.99, got {addon.get('price')}"
        assert addon.get("interval") == "month", f"Expected interval 'month', got {addon.get('interval')}"
        assert "biblicalMapQuiz" in addon.get("features", []), f"Features should include 'biblicalMapQuiz'"
        print("✅ Biblical Map Quiz add-on has correct structure (id, name, price=$1.99/month, features)")


class TestFeatureAccessAPI:
    """Tests for feature access check endpoint"""
    
    def test_feature_access_endpoint_without_auth_returns_not_authenticated(self):
        """Test that feature access without auth returns not_authenticated reason"""
        response = requests.get(f"{BASE_URL}/feature-access/biblicalMapQuiz")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("hasAccess") == False, "Expected hasAccess=False without auth"
        assert data.get("reason") == "not_authenticated", f"Expected reason='not_authenticated', got {data.get('reason')}"
        print("✅ Feature access without auth returns hasAccess=False, reason=not_authenticated")
        
    def test_feature_access_with_invalid_token(self):
        """Test that feature access with invalid token returns invalid_session"""
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BASE_URL}/feature-access/biblicalMapQuiz", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("hasAccess") == False, "Expected hasAccess=False with invalid token"
        assert data.get("reason") == "invalid_session", f"Expected reason='invalid_session', got {data.get('reason')}"
        print("✅ Feature access with invalid token returns hasAccess=False, reason=invalid_session")


class TestSubscriptionEndpoints:
    """Tests for subscription-related endpoints"""
    
    def test_subscription_endpoint_without_auth_returns_null(self):
        """Test that subscription endpoint without auth returns null"""
        response = requests.get(f"{BASE_URL}/subscription")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Should return null/None without auth
        assert data is None, f"Expected None without auth, got {data}"
        print("✅ Subscription endpoint without auth returns null")
        
    def test_subscription_usage_without_auth_returns_defaults(self):
        """Test that subscription usage without auth returns default values"""
        response = requests.get(f"{BASE_URL}/subscription/usage")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("used") == 0, f"Expected used=0, got {data.get('used')}"
        assert data.get("limit") == 3, f"Expected limit=3, got {data.get('limit')}"
        assert data.get("remaining") == 3, f"Expected remaining=3, got {data.get('remaining')}"
        print("✅ Subscription usage without auth returns default values (used=0, limit=3, remaining=3)")


class TestPricingPlansCategories:
    """Tests for plan categories (individual vs organization)"""
    
    def test_individual_plans_list(self):
        """Test that individual plans list is correct"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        individual = data.get("individual", [])
        expected_individual = ["starter", "starter_annual", "unlimited", "unlimited_annual"]
        
        for plan_id in expected_individual:
            assert plan_id in individual, f"Expected {plan_id} in individual plans"
        print(f"✅ Individual plans list correct: {individual}")
        
    def test_organization_plans_list(self):
        """Test that organization plans list is correct"""
        response = requests.get(f"{BASE_URL}/pricing/plans")
        assert response.status_code == 200
        data = response.json()
        
        organization = data.get("organization", [])
        expected_org = ["team", "team_annual", "ministry", "ministry_annual", "enterprise", "enterprise_annual"]
        
        for plan_id in expected_org:
            assert plan_id in organization, f"Expected {plan_id} in organization plans"
        print(f"✅ Organization plans list correct: {organization}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
