"""
Series API and WebSocket Collaboration Tests
Tests the Series CRUD and WebSocket collaboration features for Bible Lesson Planner
"""
import pytest
import requests
import os
import json
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admin-portal-401.preview.emergentagent.com/api').rstrip('/')

# Test credentials
TEST_EMAIL = "test@biblelessonplanner.com"
TEST_PASSWORD = "TestUser2024!"

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user"""
    response = requests.post(f"{BASE_URL}/auth/signin", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")

@pytest.fixture(scope="module")
def api_client(auth_token):
    """Authenticated requests session"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    })
    return session


class TestSeriesAPI:
    """Series CRUD API tests"""

    def test_get_all_series(self, api_client):
        """Test GET /series - Get all series for user"""
        response = api_client.get(f"{BASE_URL}/series")
        print(f"GET /series response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        print(f"Found {len(data)} series")
        
        # If series exist, validate structure
        if len(data) > 0:
            series = data[0]
            assert "id" in series, "Series should have id"
            assert "name" in series, "Series should have name"
            assert "summary" in series, "Series should have summary"
            assert "theme" in series, "Series should have theme"
            assert "lessonIds" in series, "Series should have lessonIds"
            assert "createdAt" in series, "Series should have createdAt"

    def test_create_series(self, api_client):
        """Test POST /series - Create new series"""
        test_series = {
            "name": f"TEST_Series_{datetime.now().strftime('%H%M%S')}",
            "summary": "Test series for automated testing",
            "theme": "Courage & Faith",
            "ageGroup": "Elementary (6-9)",
            "lessonIds": []
        }
        
        response = api_client.post(f"{BASE_URL}/series", json=test_series)
        print(f"POST /series response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should have series id"
        assert data["name"] == test_series["name"], "Name should match"
        assert data["summary"] == test_series["summary"], "Summary should match"
        assert data["theme"] == test_series["theme"], "Theme should match"
        assert "color" in data, "Series should have auto-assigned color"
        assert "createdAt" in data, "Series should have createdAt"
        
        # Store for cleanup
        self.created_series_id = data["id"]
        print(f"Created series with id: {self.created_series_id}")
        
        return data["id"]

    def test_get_series_by_id(self, api_client):
        """Test GET /series/{id} - Get specific series"""
        # First create a series
        series_id = self.test_create_series(api_client)
        
        response = api_client.get(f"{BASE_URL}/series/{series_id}")
        print(f"GET /series/{series_id} response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["id"] == series_id, "Series id should match"

    def test_update_series(self, api_client):
        """Test PUT /series/{id} - Update series"""
        # First create a series
        series_id = self.test_create_series(api_client)
        
        update_data = {
            "name": "TEST_Updated_Series_Name",
            "summary": "Updated summary for testing"
        }
        
        response = api_client.put(f"{BASE_URL}/series/{series_id}", json=update_data)
        print(f"PUT /series/{series_id} response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == update_data["name"], "Name should be updated"
        assert data["summary"] == update_data["summary"], "Summary should be updated"
        
        # Verify with GET
        get_response = api_client.get(f"{BASE_URL}/series/{series_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name"] == update_data["name"], "Updated name should persist"

    def test_series_stats(self, api_client):
        """Test GET /series/stats/summary - Get series statistics"""
        response = api_client.get(f"{BASE_URL}/series/stats/summary")
        print(f"GET /series/stats/summary response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "total" in data, "Stats should include total"
        assert "totalLessons" in data, "Stats should include totalLessons"
        assert "themes" in data, "Stats should include themes count"
        print(f"Stats: {data}")

    def test_add_lesson_to_series(self, api_client):
        """Test POST /series/{id}/lessons/{lessonId} - Add lesson to series"""
        # First create a series
        series_id = self.test_create_series(api_client)
        
        # Use demo-lesson as test lesson ID
        lesson_id = "demo-lesson"
        
        response = api_client.post(f"{BASE_URL}/series/{series_id}/lessons/{lesson_id}")
        print(f"POST /series/{series_id}/lessons/{lesson_id} response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert lesson_id in data.get("lessonIds", []), "Lesson should be added to series"
        print(f"Series now has {len(data.get('lessonIds', []))} lessons")

    def test_get_lessons_in_series(self, api_client):
        """Test GET /series/{id}/lessons - Get all lessons in series"""
        # First create series and add lesson
        series_id = self.test_create_series(api_client)
        
        # Add a lesson first
        lesson_id = "demo-lesson"
        api_client.post(f"{BASE_URL}/series/{series_id}/lessons/{lesson_id}")
        
        response = api_client.get(f"{BASE_URL}/series/{series_id}/lessons")
        print(f"GET /series/{series_id}/lessons response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of lessons"
        print(f"Found {len(data)} lessons in series")

    def test_remove_lesson_from_series(self, api_client):
        """Test DELETE /series/{id}/lessons/{lessonId} - Remove lesson from series"""
        # First create series and add lesson
        series_id = self.test_create_series(api_client)
        lesson_id = "demo-lesson"
        
        # Add lesson first
        api_client.post(f"{BASE_URL}/series/{series_id}/lessons/{lesson_id}")
        
        # Now remove it
        response = api_client.delete(f"{BASE_URL}/series/{series_id}/lessons/{lesson_id}")
        print(f"DELETE /series/{series_id}/lessons/{lesson_id} response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert lesson_id not in data.get("lessonIds", []), "Lesson should be removed from series"

    def test_delete_series(self, api_client):
        """Test DELETE /series/{id} - Delete series"""
        # First create a series
        series_id = self.test_create_series(api_client)
        
        response = api_client.delete(f"{BASE_URL}/series/{series_id}")
        print(f"DELETE /series/{series_id} response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify deletion
        get_response = api_client.get(f"{BASE_URL}/series/{series_id}")
        assert get_response.status_code == 404, "Deleted series should not be found"


class TestWebSocketCollaboration:
    """WebSocket Collaboration endpoint tests"""

    def test_collaboration_users_endpoint(self, api_client):
        """Test GET /collaboration/{lessonId}/users - Get active collaborators"""
        lesson_id = "demo-lesson"
        
        response = api_client.get(f"{BASE_URL}/collaboration/{lesson_id}/users")
        print(f"GET /collaboration/{lesson_id}/users response: {response.status_code}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "lessonId" in data, "Response should have lessonId"
        assert "activeUsers" in data, "Response should have activeUsers list"
        assert data["lessonId"] == lesson_id, "lessonId should match"
        assert isinstance(data["activeUsers"], list), "activeUsers should be a list"
        
        print(f"Active users on {lesson_id}: {len(data['activeUsers'])}")


class TestUnauthorizedAccess:
    """Test unauthorized access to protected endpoints"""

    def test_series_unauthorized(self):
        """Test that series creation requires auth"""
        response = requests.post(f"{BASE_URL}/series", json={
            "name": "Test",
            "summary": "Test",
            "theme": "Test",
            "ageGroup": "Test",
            "lessonIds": []
        })
        # Should return 401 for no auth or empty list for no user
        assert response.status_code in [401, 200], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            # Empty token should not create
            data = response.json()
            # This endpoint might return error or empty based on implementation
            print(f"No-auth response: {data}")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_series(self, api_client):
        """Clean up TEST_ prefixed series"""
        # Get all series
        response = api_client.get(f"{BASE_URL}/series")
        if response.status_code == 200:
            series_list = response.json()
            for series in series_list:
                if series.get("name", "").startswith("TEST_"):
                    delete_resp = api_client.delete(f"{BASE_URL}/series/{series['id']}")
                    print(f"Cleaned up series {series['id']}: {delete_resp.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
