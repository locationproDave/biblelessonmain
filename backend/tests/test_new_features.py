"""
Backend Tests for New Features - Iteration 14
Tests: Backend refactoring, Search, Print View, User Profile
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://claude-ai-features.preview.emergentagent.com')
if BASE_URL.endswith('/api'):
    BASE_URL = BASE_URL[:-4]  # Remove /api suffix if present

# Test credentials
TEST_EMAIL = "test@biblelessonplanner.com"
TEST_PASSWORD = "TestUser2024!"
TEST_LESSON_ID = "bf477415-f509-470c-96ac-0050ec79484a"


class TestBackendRefactoring:
    """Test that backend refactoring is working - health check returns v2.0.0"""
    
    def test_health_check_returns_v2(self):
        """Verify health endpoint returns version 2.0.0"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        data = response.json()
        assert data.get("status") == "healthy"
        assert data.get("version") == "2.0.0", f"Expected version 2.0.0, got {data.get('version')}"
        print("✓ Health check returns version 2.0.0")
    
    def test_api_docs_endpoint(self):
        """Verify API docs endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/docs")
        assert response.status_code == 200
        print("✓ API docs endpoint is accessible")


class TestLessonSearch:
    """Test lesson search functionality"""
    
    def test_search_with_valid_query(self):
        """Search with a valid query returns results"""
        response = requests.get(f"{BASE_URL}/api/lessons/search?q=test")
        assert response.status_code == 200, f"Search failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Search should return a list"
        print(f"✓ Search returned {len(data)} results")
    
    def test_search_with_short_query(self):
        """Search with query less than 2 chars returns empty"""
        response = requests.get(f"{BASE_URL}/api/lessons/search?q=a")
        assert response.status_code == 200
        data = response.json()
        assert data == [], "Search with single char should return empty list"
        print("✓ Short query returns empty list")
    
    def test_search_by_passage(self):
        """Search by passage name returns matching lessons"""
        response = requests.get(f"{BASE_URL}/api/lessons/search?q=john")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            # Check that result contains john in title or passage
            first_result = data[0]
            assert "john" in first_result.get("title", "").lower() or \
                   "john" in first_result.get("passage", "").lower() or \
                   "john" in first_result.get("theme", "").lower()
        print(f"✓ Passage search returned {len(data)} results")
    
    def test_search_result_structure(self):
        """Search results have required fields"""
        response = requests.get(f"{BASE_URL}/api/lessons/search?q=test")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            result = data[0]
            required_fields = ["id", "title", "passage", "ageGroup"]
            for field in required_fields:
                assert field in result, f"Missing required field: {field}"
        print("✓ Search results have correct structure")


class TestPrintView:
    """Test print-friendly lesson view"""
    
    def test_print_endpoint_returns_lesson_data(self):
        """Print endpoint returns formatted lesson data"""
        response = requests.get(f"{BASE_URL}/api/export/print/{TEST_LESSON_ID}")
        assert response.status_code == 200, f"Print endpoint failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "lessonId" in data
        assert "title" in data
        assert "passage" in data
        assert "ageGroup" in data
        assert "duration" in data
        print(f"✓ Print view returned data for lesson: {data.get('title')}")
    
    def test_print_endpoint_returns_memory_verse(self):
        """Print endpoint includes memory verse"""
        response = requests.get(f"{BASE_URL}/api/export/print/{TEST_LESSON_ID}")
        assert response.status_code == 200
        data = response.json()
        
        assert "memoryVerse" in data
        memory_verse = data.get("memoryVerse", {})
        assert "text" in memory_verse
        assert "reference" in memory_verse
        print("✓ Print view includes memory verse")
    
    def test_print_endpoint_returns_sections(self):
        """Print endpoint includes lesson sections"""
        response = requests.get(f"{BASE_URL}/api/export/print/{TEST_LESSON_ID}")
        assert response.status_code == 200
        data = response.json()
        
        assert "sections" in data
        assert isinstance(data["sections"], list)
        print(f"✓ Print view includes {len(data['sections'])} sections")
    
    def test_print_endpoint_returns_materials(self):
        """Print endpoint includes materials list"""
        response = requests.get(f"{BASE_URL}/api/export/print/{TEST_LESSON_ID}")
        assert response.status_code == 200
        data = response.json()
        
        assert "materials" in data
        assert isinstance(data["materials"], list)
        print(f"✓ Print view includes {len(data['materials'])} materials")
    
    def test_print_endpoint_404_for_invalid_id(self):
        """Print endpoint returns 404 for invalid lesson ID"""
        response = requests.get(f"{BASE_URL}/api/export/print/invalid-lesson-id")
        assert response.status_code == 404
        print("✓ Print view returns 404 for invalid ID")


class TestUserProfile:
    """Test user profile functionality"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signin",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json().get("token")
    
    def test_profile_requires_auth(self):
        """Profile endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/profile")
        assert response.status_code == 401
        print("✓ Profile endpoint requires authentication")
    
    def test_get_user_profile(self, auth_token):
        """Get user profile returns user data"""
        response = requests.get(
            f"{BASE_URL}/api/user/profile",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Profile fetch failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "id" in data
        assert "email" in data
        assert data["email"] == TEST_EMAIL
        assert "stats" in data
        print(f"✓ Got profile for user: {data.get('name')}")
    
    def test_profile_includes_stats(self, auth_token):
        """Profile includes user stats"""
        response = requests.get(
            f"{BASE_URL}/api/user/profile",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        stats = data.get("stats", {})
        assert "totalLessons" in stats
        assert "completedLessons" in stats
        assert "memberSince" in stats
        print(f"✓ Profile includes stats: {stats.get('totalLessons')} total lessons")
    
    def test_profile_includes_preferences(self, auth_token):
        """Profile includes user preferences"""
        response = requests.get(
            f"{BASE_URL}/api/user/profile",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Preferences may or may not exist
        if "preferences" in data and data["preferences"]:
            prefs = data["preferences"]
            assert "bibleVersion" in prefs
        print("✓ Profile includes preferences")


class TestUserActivity:
    """Test user activity endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signin",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code != 200:
            pytest.skip("Authentication failed")
        return response.json().get("token")
    
    def test_activity_requires_auth(self):
        """Activity endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/activity")
        assert response.status_code == 401
        print("✓ Activity endpoint requires authentication")
    
    def test_get_user_activity(self, auth_token):
        """Get user activity returns list"""
        response = requests.get(
            f"{BASE_URL}/api/user/activity?limit=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Activity fetch failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Activity should return a list"
        print(f"✓ Got {len(data)} activity items")
    
    def test_activity_item_structure(self, auth_token):
        """Activity items have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/user/activity?limit=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            required_fields = ["type", "title", "timestamp"]
            for field in required_fields:
                assert field in item, f"Missing field: {field}"
        print("✓ Activity items have correct structure")


class TestExistingFeaturesStillWork:
    """Verify existing features still work after refactoring"""
    
    def test_lessons_list_endpoint(self):
        """Lessons list endpoint still works"""
        response = requests.get(f"{BASE_URL}/api/lessons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Lessons list returns {len(data)} lessons")
    
    def test_single_lesson_endpoint(self):
        """Single lesson endpoint still works"""
        response = requests.get(f"{BASE_URL}/api/lessons/{TEST_LESSON_ID}")
        assert response.status_code == 200
        data = response.json()
        assert data.get("id") == TEST_LESSON_ID
        print(f"✓ Single lesson endpoint works: {data.get('title')}")
    
    def test_coupon_validation(self):
        """Coupon validation still works"""
        response = requests.post(
            f"{BASE_URL}/api/coupons/validate",
            json={"code": "BIBLE2026"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") == True
        print("✓ Coupon validation works")
    
    def test_auth_signin(self):
        """Auth signin still works"""
        response = requests.post(
            f"{BASE_URL}/api/auth/signin",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"✓ Auth signin works for: {data['user'].get('email')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
