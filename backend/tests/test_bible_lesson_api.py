"""
Bible Lesson Planner API Tests
Tests: Authentication, Lessons CRUD, Curriculum Planner, Progress Tracker, AI Features, Email
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bible-lesson-preview.preview.emergentagent.com').rstrip('/') + "/api"

# Test user credentials
TEST_EMAIL = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "testpassword123"
TEST_NAME = "Test User"

class TestHealth:
    """Health check tests - run first"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "Bible Lesson Planner" in data["message"]
        print("✓ API root is healthy")
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print("✓ Health endpoint working")


class TestAuth:
    """Authentication endpoint tests"""
    
    def test_signup_new_user(self):
        """Test signup creates new user and returns token"""
        response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME
        })
        assert response.status_code == 200
        data = response.json()
        
        # Data assertions
        assert "token" in data
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 0
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL.lower()
        print(f"✓ Signup successful for {TEST_EMAIL}")
        return data["token"]
    
    def test_signup_duplicate_user_fails(self):
        """Test that duplicate signup returns 400"""
        # First signup
        requests.post(f"{BASE_URL}/auth/signup", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME
        })
        # Second signup should fail
        response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME
        })
        assert response.status_code == 400
        print("✓ Duplicate signup rejected correctly")
    
    def test_signin_existing_user(self):
        """Test signin with existing user"""
        # First create user
        email = f"signin_test_{uuid.uuid4().hex[:8]}@example.com"
        requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        
        # Then signin
        response = requests.post(f"{BASE_URL}/auth/signin", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == email.lower()
        print(f"✓ Signin successful for {email}")
    
    def test_signin_invalid_credentials(self):
        """Test signin with wrong password"""
        response = requests.post(f"{BASE_URL}/auth/signin", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")
    
    def test_session_with_valid_token(self):
        """Test session endpoint with valid token"""
        # Create user and get token
        email = f"session_test_{uuid.uuid4().hex[:8]}@example.com"
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        token = signup_response.json()["token"]
        
        # Test session
        response = requests.get(f"{BASE_URL}/auth/session", 
            headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == email.lower()
        print("✓ Session endpoint returns user with valid token")


class TestLessons:
    """Lesson CRUD tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session"""
        email = f"lessons_test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_get_all_lessons(self):
        """Test get all lessons"""
        response = requests.get(f"{BASE_URL}/lessons")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ Get all lessons returns list")
    
    def test_create_lesson_and_verify_persistence(self):
        """Test create lesson and verify it persists"""
        lesson_data = {
            "title": "TEST_John 3:16 Lesson",
            "passage": "John 3:16",
            "ageGroup": "Elementary (6-10)",
            "duration": "45 min",
            "format": "Interactive",
            "theme": "God's Love",
            "memoryVerseText": "For God so loved the world",
            "memoryVerseReference": "John 3:16",
            "objectives": ["Learn about God's love", "Memorize verse"],
            "sectionsJson": '[{"title":"Opening","duration":"5 min","content":"Prayer"}]',
            "materialsJson": '[{"item":"Bible","category":"essential"}]'
        }
        
        # Create
        create_response = requests.post(f"{BASE_URL}/lessons", json=lesson_data, headers=self.headers)
        assert create_response.status_code == 200
        created = create_response.json()
        assert created["title"] == lesson_data["title"]
        assert "id" in created
        lesson_id = created["id"]
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/lessons/{lesson_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["title"] == lesson_data["title"]
        assert fetched["passage"] == lesson_data["passage"]
        print(f"✓ Lesson created and persisted: {lesson_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/lessons/{lesson_id}")
    
    def test_update_lesson_and_verify(self):
        """Test update lesson and verify changes persist"""
        # Create first
        create_response = requests.post(f"{BASE_URL}/lessons", json={
            "title": "TEST_Original Title",
            "passage": "Genesis 1:1",
            "ageGroup": "Elementary (6-10)",
            "duration": "30 min",
            "format": "Traditional",
            "theme": "Creation",
            "memoryVerseText": "In the beginning",
            "memoryVerseReference": "Genesis 1:1",
            "objectives": ["Learn about creation"],
            "sectionsJson": "[]",
            "materialsJson": "[]"
        }, headers=self.headers)
        lesson_id = create_response.json()["id"]
        
        # Update
        update_response = requests.put(f"{BASE_URL}/lessons/{lesson_id}", 
            json={"title": "TEST_Updated Title", "theme": "Updated Theme"})
        assert update_response.status_code == 200
        assert update_response.json()["title"] == "TEST_Updated Title"
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/lessons/{lesson_id}")
        assert get_response.json()["title"] == "TEST_Updated Title"
        assert get_response.json()["theme"] == "Updated Theme"
        print("✓ Lesson updated and verified")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/lessons/{lesson_id}")
    
    def test_delete_lesson_and_verify(self):
        """Test delete lesson and verify removal"""
        # Create
        create_response = requests.post(f"{BASE_URL}/lessons", json={
            "title": "TEST_To Delete",
            "passage": "Psalm 23:1",
            "ageGroup": "Adult",
            "duration": "60 min",
            "format": "Discussion",
            "theme": "Trust",
            "memoryVerseText": "The Lord is my shepherd",
            "memoryVerseReference": "Psalm 23:1",
            "objectives": [],
            "sectionsJson": "[]",
            "materialsJson": "[]"
        }, headers=self.headers)
        lesson_id = create_response.json()["id"]
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/lessons/{lesson_id}")
        assert delete_response.status_code == 200
        
        # Verify removal
        get_response = requests.get(f"{BASE_URL}/lessons/{lesson_id}")
        assert get_response.status_code == 404
        print("✓ Lesson deleted and removal verified")
    
    def test_toggle_favorite(self):
        """Test toggle favorite on lesson"""
        # Create
        create_response = requests.post(f"{BASE_URL}/lessons", json={
            "title": "TEST_Favorite Test",
            "passage": "Proverbs 3:5",
            "ageGroup": "Teen (14-17)",
            "duration": "45 min",
            "format": "Interactive",
            "theme": "Trust",
            "memoryVerseText": "Trust in the Lord",
            "memoryVerseReference": "Proverbs 3:5",
            "objectives": [],
            "sectionsJson": "[]",
            "materialsJson": "[]"
        }, headers=self.headers)
        lesson_id = create_response.json()["id"]
        assert create_response.json()["favorite"] == False
        
        # Toggle favorite
        toggle_response = requests.post(f"{BASE_URL}/lessons/{lesson_id}/favorite")
        assert toggle_response.status_code == 200
        assert toggle_response.json()["favorite"] == True
        
        # Toggle back
        toggle_response2 = requests.post(f"{BASE_URL}/lessons/{lesson_id}/favorite")
        assert toggle_response2.json()["favorite"] == False
        print("✓ Favorite toggle works correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/lessons/{lesson_id}")


class TestCurriculum:
    """Curriculum planner tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session"""
        email = f"curriculum_test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_create_curriculum_plan(self):
        """Test create curriculum plan and verify persistence"""
        plan_data = {
            "title": "TEST_Spring Curriculum 2026",
            "description": "Spring lessons for Elementary",
            "startDate": "2026-03-01",
            "endDate": "2026-05-31",
            "ageGroup": "Elementary (6-10)",
            "lessonIds": []
        }
        
        # Create
        response = requests.post(f"{BASE_URL}/curriculum", json=plan_data, headers=self.headers)
        assert response.status_code == 200
        created = response.json()
        assert created["title"] == plan_data["title"]
        assert "id" in created
        plan_id = created["id"]
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/curriculum/{plan_id}")
        assert get_response.status_code == 200
        assert get_response.json()["title"] == plan_data["title"]
        print(f"✓ Curriculum plan created: {plan_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/curriculum/{plan_id}", headers=self.headers)
    
    def test_update_curriculum_plan(self):
        """Test update curriculum plan"""
        # Create
        create_response = requests.post(f"{BASE_URL}/curriculum", json={
            "title": "TEST_Original Curriculum",
            "startDate": "2026-01-01",
            "endDate": "2026-03-31",
            "ageGroup": "Preschool (3-5)"
        }, headers=self.headers)
        plan_id = create_response.json()["id"]
        
        # Update
        update_response = requests.put(f"{BASE_URL}/curriculum/{plan_id}", 
            json={"title": "TEST_Updated Curriculum", "description": "New description"},
            headers=self.headers)
        assert update_response.status_code == 200
        assert update_response.json()["title"] == "TEST_Updated Curriculum"
        print("✓ Curriculum plan updated")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/curriculum/{plan_id}", headers=self.headers)
    
    def test_get_user_curriculum_plans(self):
        """Test get all curriculum plans for user"""
        response = requests.get(f"{BASE_URL}/curriculum", headers=self.headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ Get curriculum plans returns list")


class TestProgress:
    """Progress tracker tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session and test lesson"""
        email = f"progress_test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        
        # Create a test lesson
        lesson_response = requests.post(f"{BASE_URL}/lessons", json={
            "title": "TEST_Progress Test Lesson",
            "passage": "Matthew 5:1",
            "ageGroup": "Adult",
            "duration": "60 min",
            "format": "Discussion",
            "theme": "Beatitudes",
            "memoryVerseText": "Blessed are the poor in spirit",
            "memoryVerseReference": "Matthew 5:3",
            "objectives": [],
            "sectionsJson": "[]",
            "materialsJson": "[]"
        }, headers=self.headers)
        self.lesson_id = lesson_response.json()["id"]
    
    def teardown_method(self):
        """Cleanup test lesson"""
        requests.delete(f"{BASE_URL}/lessons/{self.lesson_id}")
    
    def test_create_progress(self):
        """Test create progress for a lesson"""
        progress_data = {
            "lessonId": self.lesson_id,
            "status": "in_progress",
            "completedSections": ["Opening", "Scripture"],
            "notes": "Good progress so far"
        }
        
        response = requests.post(f"{BASE_URL}/progress", json=progress_data, headers=self.headers)
        assert response.status_code == 200
        created = response.json()
        assert created["lessonId"] == self.lesson_id
        assert created["status"] == "in_progress"
        assert "Opening" in created["completedSections"]
        print("✓ Progress created successfully")
    
    def test_update_progress(self):
        """Test update existing progress"""
        # Create initial progress
        requests.post(f"{BASE_URL}/progress", json={
            "lessonId": self.lesson_id,
            "status": "in_progress",
            "completedSections": ["Opening"]
        }, headers=self.headers)
        
        # Update progress
        update_response = requests.post(f"{BASE_URL}/progress", json={
            "lessonId": self.lesson_id,
            "status": "completed",
            "completedSections": ["Opening", "Scripture", "Discussion", "Closing"],
            "notes": "Lesson completed successfully"
        }, headers=self.headers)
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "completed"
        print("✓ Progress updated successfully")
    
    def test_get_progress_for_lesson(self):
        """Test get progress for specific lesson"""
        # Create progress
        requests.post(f"{BASE_URL}/progress", json={
            "lessonId": self.lesson_id,
            "status": "completed",
            "completedSections": ["All"]
        }, headers=self.headers)
        
        response = requests.get(f"{BASE_URL}/progress/{self.lesson_id}", headers=self.headers)
        assert response.status_code == 200
        assert response.json()["status"] == "completed"
        print("✓ Get progress for lesson works")
    
    def test_get_progress_summary(self):
        """Test get progress summary statistics"""
        response = requests.get(f"{BASE_URL}/progress/stats/summary", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "completed" in data
        assert "inProgress" in data
        assert "completionRate" in data
        print("✓ Progress summary returns statistics")


class TestAIFeatures:
    """AI-powered features tests - these may take longer"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session"""
        email = f"ai_test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        
        # Create test lesson
        lesson_response = requests.post(f"{BASE_URL}/lessons", json={
            "title": "TEST_AI Test Lesson",
            "passage": "John 3:16",
            "ageGroup": "Elementary (6-10)",
            "duration": "45 min",
            "format": "Interactive",
            "theme": "God's Love",
            "memoryVerseText": "For God so loved the world",
            "memoryVerseReference": "John 3:16",
            "objectives": ["Learn about God's love"],
            "sectionsJson": '[{"title":"Opening","duration":"5 min","content":"Prayer"}]',
            "materialsJson": '[{"item":"Bible","category":"essential"}]'
        }, headers=self.headers)
        self.lesson_id = lesson_response.json()["id"]
    
    def teardown_method(self):
        """Cleanup test lesson"""
        requests.delete(f"{BASE_URL}/lessons/{self.lesson_id}")
    
    def test_generate_lesson(self):
        """Test AI lesson generation"""
        response = requests.post(f"{BASE_URL}/ai/generate-lesson", json={
            "book": "John",
            "chapter": "3",
            "verse": "16",
            "ageGroup": "Elementary (6-10)",
            "duration": "30 min",
            "format": "Interactive",
            "includeActivities": True,
            "includeMemoryVerse": True
        }, timeout=90)
        
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "passage" in data
        assert "sections" in data or "memoryVerse" in data
        print("✓ AI lesson generation works")
    
    def test_generate_quiz_requires_auth(self):
        """Test quiz generation requires authentication"""
        response = requests.post(f"{BASE_URL}/ai/generate-quiz", json={
            "lessonId": self.lesson_id,
            "questionCount": 3
        })  # No auth header
        assert response.status_code == 401
        print("✓ Quiz generation requires authentication")
    
    def test_generate_quiz(self):
        """Test AI quiz generation"""
        response = requests.post(f"{BASE_URL}/ai/generate-quiz", json={
            "lessonId": self.lesson_id,
            "questionCount": 3,
            "questionTypes": ["multiple_choice", "true_false"],
            "difficulty": "easy"
        }, headers=self.headers, timeout=90)
        
        assert response.status_code == 200
        data = response.json()
        assert "quizTitle" in data or "questions" in data
        assert "lessonId" in data
        print("✓ AI quiz generation works")
    
    def test_extract_supplies_requires_auth(self):
        """Test supply extraction requires authentication"""
        response = requests.post(f"{BASE_URL}/ai/extract-supplies", json={
            "lessonId": self.lesson_id
        })  # No auth header
        assert response.status_code == 401
        print("✓ Supply extraction requires authentication")
    
    def test_extract_supplies(self):
        """Test AI supply list extraction"""
        response = requests.post(f"{BASE_URL}/ai/extract-supplies", json={
            "lessonId": self.lesson_id
        }, headers=self.headers, timeout=90)
        
        assert response.status_code == 200
        data = response.json()
        assert "supplies" in data
        assert "lessonId" in data
        print("✓ AI supply extraction works")


class TestPreferences:
    """User preferences tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session"""
        email = f"prefs_test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_get_bible_version(self):
        """Test get bible version preference"""
        response = requests.get(f"{BASE_URL}/preferences/bible-version", headers=self.headers)
        assert response.status_code == 200
        assert "bibleVersion" in response.json()
        print("✓ Get bible version works")
    
    def test_set_bible_version(self):
        """Test set bible version preference"""
        response = requests.put(f"{BASE_URL}/preferences/bible-version", 
            json={"bibleVersion": "NIV"}, headers=self.headers)
        assert response.status_code == 200
        
        # Verify
        get_response = requests.get(f"{BASE_URL}/preferences/bible-version", headers=self.headers)
        assert get_response.json()["bibleVersion"] == "NIV"
        print("✓ Set bible version works")
    
    def test_complete_onboarding(self):
        """Test complete onboarding"""
        response = requests.post(f"{BASE_URL}/preferences/complete-onboarding", json={
            "bibleVersion": "ESV",
            "ministryRole": "Teacher",
            "preferredAgeGroup": "Elementary"
        }, headers=self.headers)
        assert response.status_code == 200
        
        # Verify onboarding status
        status_response = requests.get(f"{BASE_URL}/preferences/onboarding-status", headers=self.headers)
        assert status_response.json()["completed"] == True
        print("✓ Complete onboarding works")


class TestTeam:
    """Team management tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup authenticated session"""
        email = f"team_test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/auth/signup", json={
            "email": email,
            "password": TEST_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_get_team_members(self):
        """Test get team members"""
        response = requests.get(f"{BASE_URL}/team/members", headers=self.headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ Get team members works")
    
    def test_invite_member(self):
        """Test invite team member"""
        response = requests.post(f"{BASE_URL}/team/invite", json={
            "email": f"invited_{uuid.uuid4().hex[:8]}@example.com",
            "role": "viewer"
        }, headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "pending"
        print("✓ Invite team member works")
    
    def test_get_invitations(self):
        """Test get team invitations"""
        response = requests.get(f"{BASE_URL}/team/invitations", headers=self.headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ Get team invitations works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
