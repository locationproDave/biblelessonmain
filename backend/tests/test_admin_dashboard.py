"""
Admin Dashboard API Tests
Tests for admin authentication, analytics, users, spending, and lesson statistics endpoints.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admin-portal-401.preview.emergentagent.com').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "hello@biblelessonplanner.com"
ADMIN_PASSWORD = "Truman310"

# Test user for non-admin access tests
TEST_USER_EMAIL = "admin_test_regular_user@example.com"
TEST_USER_PASSWORD = "TestPass123"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/auth/signin",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    data = response.json()
    assert data.get("user", {}).get("role") == "admin", "Expected admin role in response"
    return data["token"]


@pytest.fixture(scope="module")
def regular_user_token():
    """Get a regular (non-admin) user token"""
    # Try to sign up first
    signup_response = requests.post(
        f"{BASE_URL}/api/auth/signup",
        json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD, "name": "Test Regular User"}
    )
    if signup_response.status_code == 200:
        data = signup_response.json()
        return data["token"]
    # If user exists, sign in
    signin_response = requests.post(
        f"{BASE_URL}/api/auth/signin",
        json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    )
    if signin_response.status_code == 200:
        return signin_response.json()["token"]
    pytest.skip("Could not get regular user token")


class TestAdminAuthentication:
    """Test admin login and role verification"""
    
    def test_admin_login_returns_admin_role(self):
        """Admin login should return role=admin in user data"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signin",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify token exists
        assert "token" in data
        assert len(data["token"]) > 0
        
        # Verify user data with admin role
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert data["user"]["name"] == "Admin"
    
    def test_admin_session_returns_role(self, admin_token):
        """Session endpoint should return admin role"""
        response = requests.get(
            f"{BASE_URL}/api/auth/session",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "user" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL


class TestAdminEndpointSecurity:
    """Test admin endpoint authorization"""
    
    def test_analytics_requires_auth(self):
        """Analytics endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics")
        assert response.status_code == 401
        assert "Not authenticated" in response.json().get("detail", "")
    
    def test_users_requires_auth(self):
        """Users endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 401
    
    def test_spending_requires_auth(self):
        """Spending endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/spending")
        assert response.status_code == 401
    
    def test_lessons_stats_requires_auth(self):
        """Lessons stats endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/lessons-stats")
        assert response.status_code == 401
    
    def test_analytics_rejects_non_admin(self, regular_user_token):
        """Analytics endpoint should reject non-admin users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/analytics",
            headers={"Authorization": f"Bearer {regular_user_token}"}
        )
        assert response.status_code == 403
        assert "Admin access required" in response.json().get("detail", "")
    
    def test_users_rejects_non_admin(self, regular_user_token):
        """Users endpoint should reject non-admin users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {regular_user_token}"}
        )
        assert response.status_code == 403


class TestAnalyticsEndpoint:
    """Test /api/admin/analytics endpoint"""
    
    def test_analytics_default_period(self, admin_token):
        """Analytics should return data with default 7d period"""
        response = requests.get(
            f"{BASE_URL}/api/admin/analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert data["period"] == "7d"
        assert "startDate" in data
        assert "metrics" in data
        assert "charts" in data
        assert "recentSignups" in data
        assert "recentLessons" in data
        
        # Verify metrics structure
        metrics = data["metrics"]
        assert "newSignups" in metrics
        assert "totalUsers" in metrics
        assert "lessonsCreated" in metrics
        assert "totalLessons" in metrics
        assert "activeUsers" in metrics
        assert isinstance(metrics["totalUsers"], int)
        assert isinstance(metrics["totalLessons"], int)
        
        # Verify charts structure
        charts = data["charts"]
        assert "dailySignups" in charts
        assert "dailyLessons" in charts
        assert "ageGroupDistribution" in charts
        assert isinstance(charts["dailySignups"], dict)
    
    def test_analytics_different_periods(self, admin_token):
        """Analytics should accept different period parameters"""
        periods = ["24h", "7d", "30d", "90d"]
        for period in periods:
            response = requests.get(
                f"{BASE_URL}/api/admin/analytics?period={period}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["period"] == period


class TestUsersEndpoint:
    """Test /api/admin/users endpoint"""
    
    def test_users_pagination(self, admin_token):
        """Users endpoint should return paginated data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users?page=1&limit=10",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check pagination fields
        assert "users" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert "totalPages" in data
        
        assert data["page"] == 1
        assert data["limit"] == 10
        assert isinstance(data["users"], list)
        assert len(data["users"]) <= 10
        
        # Verify user data structure (if users exist)
        if data["users"]:
            user = data["users"][0]
            assert "id" in user
            assert "email" in user
            assert "createdAt" in user
            # Password hash should NOT be included
            assert "passwordHash" not in user
    
    def test_users_search(self, admin_token):
        """Users endpoint should filter by search query"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users?search=admin",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Admin user should be in results
        assert len(data["users"]) > 0
        admin_found = any(u["email"] == ADMIN_EMAIL for u in data["users"])
        assert admin_found, "Admin user should be in search results for 'admin'"
    
    def test_users_include_lesson_count(self, admin_token):
        """Users should include lesson count"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users?limit=5",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        if data["users"]:
            user = data["users"][0]
            assert "lessonCount" in user
            assert isinstance(user["lessonCount"], int)


class TestSpendingEndpoint:
    """Test /api/admin/spending endpoint"""
    
    def test_spending_returns_structure(self, admin_token):
        """Spending endpoint should return proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/admin/spending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "period" in data
        assert "metrics" in data
        
        metrics = data["metrics"]
        assert "totalRevenue" in metrics
        assert "newSubscriptions" in metrics
        assert "subscriptionCounts" in metrics
        
        assert "revenueByPlan" in data
        assert "dailyRevenue" in data
    
    def test_spending_different_periods(self, admin_token):
        """Spending should accept different period parameters"""
        for period in ["7d", "30d", "90d"]:
            response = requests.get(
                f"{BASE_URL}/api/admin/spending?period={period}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert response.status_code == 200
            assert response.json()["period"] == period


class TestLessonsStatsEndpoint:
    """Test /api/admin/lessons-stats endpoint"""
    
    def test_lessons_stats_structure(self, admin_token):
        """Lessons stats should return proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/admin/lessons-stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "period" in data
        assert "totalCreated" in data
        assert "themeDistribution" in data
        assert "durationDistribution" in data
        assert "ageGroupDistribution" in data
        assert "recentLessons" in data
        
        assert isinstance(data["totalCreated"], int)
        assert isinstance(data["themeDistribution"], dict)
        assert isinstance(data["ageGroupDistribution"], dict)
        assert isinstance(data["recentLessons"], list)
    
    def test_lessons_stats_different_periods(self, admin_token):
        """Lessons stats should accept different periods"""
        for period in ["7d", "30d"]:
            response = requests.get(
                f"{BASE_URL}/api/admin/lessons-stats?period={period}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert response.status_code == 200
            assert response.json()["period"] == period


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
