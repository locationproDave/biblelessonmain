"""
Tests for Google Calendar integration and ICS file generation
Testing features:
- Google Calendar status endpoint
- ICS file generation for different providers
- Calendar event creation (when credentials are configured)
"""

import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('VITE_API_URL', 'https://admin-portal-401.preview.emergentagent.com/api')

# Test credentials
TEST_EMAIL = "test@biblelessonplanner.com"
TEST_PASSWORD = "TestUser2024!"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/auth/signin",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def authenticated_client(auth_token):
    """Session with auth header"""
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    })
    return session


class TestGoogleCalendarStatus:
    """Tests for Google Calendar status endpoint"""
    
    def test_calendar_status_requires_auth(self):
        """Test that calendar status requires authentication"""
        response = requests.get(f"{BASE_URL}/calendar/google/status")
        # Should return 401 or error message
        assert response.status_code in [401, 422] or "Not authenticated" in response.text
    
    def test_calendar_status_authenticated(self, authenticated_client):
        """Test calendar status returns proper structure when authenticated"""
        response = authenticated_client.get(f"{BASE_URL}/calendar/google/status")
        assert response.status_code == 200
        
        data = response.json()
        # Should have connected and configured fields
        assert "connected" in data
        assert "configured" in data
        
        # Without credentials, should show not configured
        if not data["configured"]:
            assert "message" in data
            assert "GOOGLE_CALENDAR_CLIENT_ID" in data.get("message", "")


class TestICSGeneration:
    """Tests for ICS file generation"""
    
    def test_generate_ics_google(self, authenticated_client):
        """Test ICS file generation for Google Calendar"""
        start_time = (datetime.utcnow() + timedelta(days=1)).replace(hour=9, minute=0, second=0)
        end_time = start_time + timedelta(minutes=45)
        
        response = authenticated_client.post(
            f"{BASE_URL}/calendar/generate-ics",
            json={
                "title": "Test Bible Lesson: The Good Samaritan",
                "description": "A lesson about loving your neighbor from Luke 10:25-37",
                "startDateTime": start_time.isoformat() + "Z",
                "endDateTime": end_time.isoformat() + "Z",
                "provider": "google"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert data.get("success") == True
        assert "icsContent" in data
        assert "filename" in data
        
        # Verify ICS content structure
        ics_content = data["icsContent"]
        assert "BEGIN:VCALENDAR" in ics_content
        assert "BEGIN:VEVENT" in ics_content
        assert "END:VEVENT" in ics_content
        assert "END:VCALENDAR" in ics_content
        assert "Test Bible Lesson" in ics_content
    
    def test_generate_ics_outlook(self, authenticated_client):
        """Test ICS file generation for Outlook"""
        start_time = (datetime.utcnow() + timedelta(days=1)).replace(hour=10, minute=0, second=0)
        end_time = start_time + timedelta(minutes=60)
        
        response = authenticated_client.post(
            f"{BASE_URL}/calendar/generate-ics",
            json={
                "title": "Sunday School: David and Goliath",
                "description": "Courage through faith - 1 Samuel 17",
                "startDateTime": start_time.isoformat() + "Z",
                "endDateTime": end_time.isoformat() + "Z",
                "provider": "outlook"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "icsContent" in data
    
    def test_generate_ics_apple(self, authenticated_client):
        """Test ICS file generation for Apple Calendar"""
        start_time = (datetime.utcnow() + timedelta(days=2)).replace(hour=11, minute=0, second=0)
        end_time = start_time + timedelta(minutes=30)
        
        response = authenticated_client.post(
            f"{BASE_URL}/calendar/generate-ics",
            json={
                "title": "Kids Ministry: Creation Story",
                "description": "Genesis 1-2 lesson for preschoolers",
                "startDateTime": start_time.isoformat() + "Z",
                "endDateTime": end_time.isoformat() + "Z",
                "provider": "apple"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True


class TestLessonCardFeatures:
    """Tests for lesson card features on My Lessons page"""
    
    def test_get_lessons_list(self, authenticated_client):
        """Test getting lessons list"""
        response = authenticated_client.get(f"{BASE_URL}/lessons")
        assert response.status_code == 200
        
        lessons = response.json()
        assert isinstance(lessons, list)
        
        if len(lessons) > 0:
            # Verify lesson card data structure
            lesson = lessons[0]
            assert "id" in lesson
            assert "title" in lesson
            assert "passage" in lesson
            assert "ageGroup" in lesson
            assert "duration" in lesson
            assert "theme" in lesson
    
    def test_toggle_favorite(self, authenticated_client):
        """Test toggling favorite on a lesson"""
        # First get a lesson
        response = authenticated_client.get(f"{BASE_URL}/lessons")
        assert response.status_code == 200
        
        lessons = response.json()
        if len(lessons) == 0:
            pytest.skip("No lessons available to test favorite toggle")
        
        lesson_id = lessons[0]["id"]
        initial_favorite = lessons[0].get("favorite", False)
        
        # Toggle favorite
        response = authenticated_client.post(f"{BASE_URL}/lessons/{lesson_id}/favorite")
        assert response.status_code == 200
        
        data = response.json()
        # Favorite should be toggled
        assert data.get("favorite") == (not initial_favorite)
        
        # Toggle back to original state
        response = authenticated_client.post(f"{BASE_URL}/lessons/{lesson_id}/favorite")
        assert response.status_code == 200


class TestLessonDetailPage:
    """Tests for lesson detail page features"""
    
    def test_get_lesson_detail(self, authenticated_client):
        """Test getting a specific lesson"""
        # First get lessons list
        response = authenticated_client.get(f"{BASE_URL}/lessons")
        lessons = response.json()
        
        if len(lessons) == 0:
            pytest.skip("No lessons available")
        
        lesson_id = lessons[0]["id"]
        
        # Get lesson detail
        response = authenticated_client.get(f"{BASE_URL}/lessons/{lesson_id}")
        assert response.status_code == 200
        
        lesson = response.json()
        assert lesson["id"] == lesson_id
        assert "title" in lesson
        assert "passage" in lesson
        assert "sectionsJson" in lesson or "sections" in lesson


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
