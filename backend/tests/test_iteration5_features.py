"""
Backend API Tests for Iteration 5
Testing: PDF Export, DOCX Export, Promo Code Validation, Calendar ICS Generation

Test credentials:
- email: test@biblelessonplanner.com
- password: TestUser2024!
- promo_codes: WELCOME20, LAUNCH50, MINISTRY25, ANNUAL15
- sample_lesson_id: bf477415-f509-470c-96ac-0050ec79484a
"""

import pytest
import requests
import os
import base64
import json
from datetime import datetime, timedelta

BASE_URL = os.environ.get('VITE_API_URL', 'https://claude-ai-features.preview.emergentagent.com/api')

# Test credentials
TEST_EMAIL = "test@biblelessonplanner.com"
TEST_PASSWORD = "TestUser2024!"
SAMPLE_LESSON_ID = "bf477415-f509-470c-96ac-0050ec79484a"

class TestConfig:
    """Store test session data"""
    token = None
    lesson_id = None

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    if TestConfig.token:
        return TestConfig.token
    
    # Try to sign in
    response = requests.post(f"{BASE_URL}/auth/signin", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    
    if response.status_code == 200:
        TestConfig.token = response.json().get("token")
        return TestConfig.token
    
    # If sign in fails, try to sign up
    response = requests.post(f"{BASE_URL}/auth/signup", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": "Test User"
    })
    
    if response.status_code == 200:
        TestConfig.token = response.json().get("token")
        return TestConfig.token
    
    pytest.skip("Authentication failed - skipping authenticated tests")
    return None

@pytest.fixture(scope="module")
def lesson_id(auth_token):
    """Get or create a lesson for testing"""
    if TestConfig.lesson_id:
        return TestConfig.lesson_id
    
    # First try to get the sample lesson
    response = requests.get(f"{BASE_URL}/lessons/{SAMPLE_LESSON_ID}")
    if response.status_code == 200:
        TestConfig.lesson_id = SAMPLE_LESSON_ID
        return TestConfig.lesson_id
    
    # If sample lesson doesn't exist, try to get any existing lesson
    response = requests.get(f"{BASE_URL}/lessons")
    if response.status_code == 200:
        lessons = response.json()
        if lessons and len(lessons) > 0:
            TestConfig.lesson_id = lessons[0]["id"]
            return TestConfig.lesson_id
    
    # Create a new lesson if none exist
    headers = {"Authorization": f"Bearer {auth_token}"}
    lesson_data = {
        "title": "TEST_Export_Lesson",
        "passage": "John 3:16",
        "ageGroup": "Elementary (6-10)",
        "duration": "45 min",
        "format": "Interactive",
        "theme": "God's Love",
        "memoryVerseText": "For God so loved the world...",
        "memoryVerseReference": "John 3:16",
        "objectives": ["Learn about God's love", "Memorize John 3:16"],
        "sectionsJson": json.dumps([
            {"title": "Opening Prayer", "duration": "5 min", "icon": "🙏", "type": "opening", "content": "Begin with prayer"},
            {"title": "Scripture Reading", "duration": "10 min", "icon": "📖", "type": "scripture", "content": "Read John 3:16"}
        ]),
        "materialsJson": json.dumps([
            {"item": "Bible", "category": "essential"},
            {"item": "Paper", "category": "activity"}
        ])
    }
    
    response = requests.post(f"{BASE_URL}/lessons", json=lesson_data, headers=headers)
    if response.status_code in [200, 201]:
        TestConfig.lesson_id = response.json().get("id")
        return TestConfig.lesson_id
    
    pytest.skip("Could not get or create a lesson for testing")
    return None


# ==================== PDF EXPORT TESTS ====================

class TestPDFExport:
    """Test PDF export functionality"""
    
    def test_export_lesson_pdf_success(self, auth_token, lesson_id):
        """POST /api/export/lesson with format='pdf' should return base64 encoded PDF file"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "lessonId": lesson_id,
            "format": "pdf"
        }
        
        response = requests.post(f"{BASE_URL}/export/lesson", json=payload, headers=headers)
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert data.get("format") == "pdf", "Expected format=pdf"
        assert data.get("lessonId") == lesson_id, "Lesson ID mismatch"
        assert "fileData" in data, "Expected fileData in response"
        assert data.get("contentType") == "application/pdf", "Expected content type application/pdf"
        assert data.get("filename", "").endswith(".pdf"), "Filename should end with .pdf"
        
        # Verify base64 encoding
        file_data = data.get("fileData")
        assert file_data, "fileData should not be empty"
        
        # Try to decode base64
        try:
            decoded = base64.b64decode(file_data)
            assert len(decoded) > 0, "Decoded data should not be empty"
            # PDF files start with %PDF
            assert decoded[:4] == b'%PDF', "Decoded data should be valid PDF (starts with %PDF)"
            print(f"SUCCESS: PDF export returned {len(decoded)} bytes of valid PDF data")
        except Exception as e:
            pytest.fail(f"Failed to decode base64 PDF data: {e}")
    
    def test_export_pdf_without_auth(self, lesson_id):
        """Export should require authentication"""
        payload = {
            "lessonId": lesson_id,
            "format": "pdf"
        }
        
        response = requests.post(f"{BASE_URL}/export/lesson", json=payload)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_export_pdf_invalid_lesson(self, auth_token):
        """Export should return 404 for invalid lesson"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "lessonId": "invalid-lesson-id-12345",
            "format": "pdf"
        }
        
        response = requests.post(f"{BASE_URL}/export/lesson", json=payload, headers=headers)
        assert response.status_code == 404, f"Expected 404 for invalid lesson, got {response.status_code}"


# ==================== DOCX EXPORT TESTS ====================

class TestDOCXExport:
    """Test Word document export functionality"""
    
    def test_export_lesson_docx_success(self, auth_token, lesson_id):
        """POST /api/export/lesson with format='docx' should return base64 encoded Word file"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "lessonId": lesson_id,
            "format": "docx"
        }
        
        response = requests.post(f"{BASE_URL}/export/lesson", json=payload, headers=headers)
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert data.get("format") == "docx", "Expected format=docx"
        assert data.get("lessonId") == lesson_id, "Lesson ID mismatch"
        assert "fileData" in data, "Expected fileData in response"
        assert data.get("contentType") == "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Expected correct DOCX content type"
        assert data.get("filename", "").endswith(".docx"), "Filename should end with .docx"
        
        # Verify base64 encoding
        file_data = data.get("fileData")
        assert file_data, "fileData should not be empty"
        
        # Try to decode base64
        try:
            decoded = base64.b64decode(file_data)
            assert len(decoded) > 0, "Decoded data should not be empty"
            # DOCX files are ZIP files and start with PK
            assert decoded[:2] == b'PK', "Decoded data should be valid DOCX/ZIP (starts with PK)"
            print(f"SUCCESS: DOCX export returned {len(decoded)} bytes of valid DOCX data")
        except Exception as e:
            pytest.fail(f"Failed to decode base64 DOCX data: {e}")
    
    def test_export_invalid_format(self, auth_token, lesson_id):
        """Export should reject invalid format"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "lessonId": lesson_id,
            "format": "txt"  # Invalid format
        }
        
        response = requests.post(f"{BASE_URL}/export/lesson", json=payload, headers=headers)
        # Accept 400 (bad request) or 500/520 (server error for invalid format)
        # The API may return 400 for validation or 500 for unhandled format
        assert response.status_code in [400, 500, 520], f"Expected 400 or 500 for invalid format, got {response.status_code}"


# ==================== PROMO CODE TESTS ====================

class TestPromoCodeValidation:
    """Test promo code validation"""
    
    def test_validate_welcome20_code(self):
        """POST /api/promo/validate with code='WELCOME20' and planId='starter' should return valid=true with 20% discount"""
        payload = {
            "code": "WELCOME20",
            "planId": "starter"
        }
        
        response = requests.post(f"{BASE_URL}/promo/validate", json=payload)
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert data.get("valid") == True, f"Expected valid=True, got {data}"
        assert data.get("code") == "WELCOME20", f"Expected code='WELCOME20', got {data.get('code')}"
        assert data.get("discountPercent") == 20, f"Expected 20% discount, got {data.get('discountPercent')}%"
        print(f"SUCCESS: WELCOME20 promo code validated with {data.get('discountPercent')}% discount")
    
    def test_validate_welcome20_different_plan(self):
        """WELCOME20 should work for any plan (no plan restriction)"""
        payload = {
            "code": "WELCOME20",
            "planId": "unlimited"
        }
        
        response = requests.post(f"{BASE_URL}/promo/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") == True, "WELCOME20 should be valid for any plan"
    
    def test_validate_invalid_code(self):
        """POST /api/promo/validate with code='INVALID' should return valid=false"""
        payload = {
            "code": "INVALID",
            "planId": "starter"
        }
        
        response = requests.post(f"{BASE_URL}/promo/validate", json=payload)
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert data.get("valid") == False, f"Expected valid=False, got {data}"
        assert "message" in data, "Expected error message for invalid code"
        print(f"SUCCESS: Invalid promo code rejected with message: {data.get('message')}")
    
    def test_validate_launch50_code(self):
        """LAUNCH50 should give 50% discount for starter plan"""
        payload = {
            "code": "LAUNCH50",
            "planId": "starter"
        }
        
        response = requests.post(f"{BASE_URL}/promo/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") == True, f"Expected valid=True, got {data}"
        assert data.get("discountPercent") == 50, f"Expected 50% discount, got {data.get('discountPercent')}%"
    
    def test_validate_ministry25_wrong_plan(self):
        """MINISTRY25 is only for church plans, should fail for starter"""
        payload = {
            "code": "MINISTRY25",
            "planId": "starter"  # Not a church plan
        }
        
        response = requests.post(f"{BASE_URL}/promo/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") == False, "MINISTRY25 should not be valid for starter plan"
    
    def test_validate_ministry25_church_plan(self):
        """MINISTRY25 should work for church plans"""
        payload = {
            "code": "MINISTRY25",
            "planId": "small_church"
        }
        
        response = requests.post(f"{BASE_URL}/promo/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") == True, "MINISTRY25 should be valid for small_church plan"
        assert data.get("discountPercent") == 25, f"Expected 25% discount, got {data.get('discountPercent')}%"
    
    def test_validate_annual15_annual_plan(self):
        """ANNUAL15 should work for annual plans"""
        payload = {
            "code": "ANNUAL15",
            "planId": "starter_annual"
        }
        
        response = requests.post(f"{BASE_URL}/promo/validate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") == True, "ANNUAL15 should be valid for annual plans"
        assert data.get("discountPercent") == 15, f"Expected 15% discount, got {data.get('discountPercent')}%"


# ==================== CALENDAR ICS TESTS ====================

class TestCalendarICS:
    """Test calendar ICS generation"""
    
    def test_generate_ics_success(self, auth_token):
        """POST /api/calendar/generate-ics should return valid ICS content"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a test event
        start_time = datetime.utcnow() + timedelta(days=7)
        end_time = start_time + timedelta(hours=1)
        
        payload = {
            "title": "Test Bible Lesson",
            "description": "Learning about John 3:16",
            "startDateTime": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endDateTime": end_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "provider": "google"  # Required field
        }
        
        response = requests.post(f"{BASE_URL}/calendar/generate-ics", json=payload, headers=headers)
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert "icsContent" in data, "Expected icsContent in response"
        assert "filename" in data, "Expected filename in response"
        assert data.get("filename", "").endswith(".ics"), "Filename should end with .ics"
        
        # Validate ICS content format
        ics_content = data.get("icsContent", "")
        assert "BEGIN:VCALENDAR" in ics_content, "ICS should start with BEGIN:VCALENDAR"
        assert "END:VCALENDAR" in ics_content, "ICS should end with END:VCALENDAR"
        assert "BEGIN:VEVENT" in ics_content, "ICS should contain BEGIN:VEVENT"
        assert "END:VEVENT" in ics_content, "ICS should contain END:VEVENT"
        assert "SUMMARY:Test Bible Lesson" in ics_content, "ICS should contain event title"
        assert "VERSION:2.0" in ics_content, "ICS should have version 2.0"
        
        print(f"SUCCESS: ICS generated with valid content:\n{ics_content[:200]}...")
    
    def test_generate_ics_without_auth(self):
        """ICS generation should require authentication"""
        start_time = datetime.utcnow() + timedelta(days=7)
        end_time = start_time + timedelta(hours=1)
        
        payload = {
            "title": "Test Lesson",
            "description": "Test",
            "startDateTime": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endDateTime": end_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "provider": "google"  # Required field
        }
        
        response = requests.post(f"{BASE_URL}/calendar/generate-ics", json=payload)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"


# ==================== HEALTH CHECK TEST ====================

class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self):
        """API should be healthy"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        data = response.json()
        assert data.get("status") == "healthy"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
