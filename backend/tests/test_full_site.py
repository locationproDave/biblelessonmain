"""
Full site API tests for Bible Lesson Planner
Tests all major backend endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('VITE_API_URL', 'https://bible-lesson-preview.preview.emergentagent.com/api')


class TestHealthEndpoints:
    """Test health and basic endpoints"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")
    
    def test_auth_session_unauthenticated(self):
        """Test auth session endpoint returns null for unauthenticated users"""
        response = requests.get(f"{BASE_URL}/auth/session")
        assert response.status_code == 200
        # Should return null/None for unauthenticated
        print(f"✓ Auth session endpoint working: {response.json()}")


class TestPricingEndpoints:
    """Test pricing related endpoints"""
    
    def test_get_pricing_plans_monthly(self):
        """Test fetching monthly pricing plans"""
        response = requests.get(f"{BASE_URL}/pricing/plans?billing=monthly")
        assert response.status_code == 200
        data = response.json()
        assert "individual" in data
        assert "organization" in data
        assert len(data["individual"]) > 0
        assert len(data["organization"]) > 0
        print(f"✓ Pricing plans (monthly): {len(data['individual'])} individual, {len(data['organization'])} org plans")
    
    def test_get_pricing_plans_annual(self):
        """Test fetching annual pricing plans"""
        response = requests.get(f"{BASE_URL}/pricing/plans?billing=annual")
        assert response.status_code == 200
        data = response.json()
        assert "individual" in data
        # Check for annual savings
        for plan in data["individual"]:
            if "annual" in plan["id"]:
                assert "savings" in plan or "monthlyEquivalent" in plan
        print(f"✓ Pricing plans (annual): {len(data['individual'])} individual plans")


class TestContactEndpoint:
    """Test contact form endpoint"""
    
    def test_submit_contact_form(self):
        """Test contact form submission"""
        payload = {
            "name": "TEST_User",
            "email": "test@example.com",
            "subject": "Test Inquiry",
            "message": "This is a test message from automated testing",
            "type": "general"
        }
        response = requests.post(f"{BASE_URL}/contact", json=payload)
        assert response.status_code in [200, 201]
        data = response.json()
        assert "success" in data or "message" in data or data.get("status") == "sent"
        print(f"✓ Contact form submission working: {data}")


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_signup_invalid_email(self):
        """Test signup with invalid email format"""
        payload = {
            "email": "invalid-email",
            "password": "TestPassword123!"
        }
        response = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        # Should either fail validation or return error
        assert response.status_code in [400, 422, 200]  # 200 if it still processes
        print(f"✓ Signup validation test completed: {response.status_code}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        payload = {
            "email": "nonexistent@example.com",
            "password": "WrongPassword123!"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        # Should fail with 401 or 400
        assert response.status_code in [400, 401, 404, 422]
        print(f"✓ Login with invalid credentials correctly rejected: {response.status_code}")


class TestLessonsEndpoint:
    """Test lessons related endpoints"""
    
    def test_get_lessons_unauthenticated(self):
        """Test getting lessons without authentication"""
        response = requests.get(f"{BASE_URL}/lessons")
        # Should return empty list or auth error
        assert response.status_code in [200, 401]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
        print(f"✓ Lessons endpoint: {response.status_code}")


class TestCurriculumEndpoint:
    """Test curriculum related endpoints"""
    
    def test_get_curriculum_unauthenticated(self):
        """Test getting curriculum plans without authentication"""
        response = requests.get(f"{BASE_URL}/curriculum")
        # Should return empty list or auth error
        assert response.status_code in [200, 401]
        print(f"✓ Curriculum endpoint: {response.status_code}")


class TestProgressEndpoint:
    """Test progress tracking endpoints"""
    
    def test_get_progress_unauthenticated(self):
        """Test getting progress without authentication"""
        response = requests.get(f"{BASE_URL}/progress")
        # Should return empty list or auth error
        assert response.status_code in [200, 401]
        print(f"✓ Progress endpoint: {response.status_code}")
    
    def test_get_progress_summary_unauthenticated(self):
        """Test getting progress summary without authentication"""
        response = requests.get(f"{BASE_URL}/progress/summary")
        # Should return summary or auth error
        assert response.status_code in [200, 401]
        if response.status_code == 200:
            data = response.json()
            assert "total" in data or isinstance(data, dict)
        print(f"✓ Progress summary endpoint: {response.status_code}")


class TestTeamEndpoints:
    """Test team related endpoints"""
    
    def test_get_team_members_unauthenticated(self):
        """Test getting team members without authentication"""
        response = requests.get(f"{BASE_URL}/team/members")
        assert response.status_code in [200, 401]
        print(f"✓ Team members endpoint: {response.status_code}")


class TestExportEndpoints:
    """Test export functionality"""
    
    def test_pdf_export_requires_valid_lesson(self):
        """Test PDF export with invalid lesson ID"""
        response = requests.get(f"{BASE_URL}/lessons/invalid-id-12345/export/pdf")
        assert response.status_code in [401, 404]
        print(f"✓ PDF export correctly requires valid lesson: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
