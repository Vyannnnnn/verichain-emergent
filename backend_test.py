#!/usr/bin/env python3
"""
VeriChain Academic - Backend API Test Suite
Email Notification System Testing
"""

import requests
import json
import sys
from datetime import datetime

# Backend Base URL
BASE_URL = "https://academic-blockchain-2.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "admin@verichain.ac.id"
ADMIN_PASSWORD = "admin123"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_test(test_name, status, message=""):
    """Log test result with color coding"""
    if status == "PASS":
        print(f"{GREEN}✓ PASS{RESET} - {test_name}")
        if message:
            print(f"  {message}")
    elif status == "FAIL":
        print(f"{RED}✗ FAIL{RESET} - {test_name}")
        if message:
            print(f"  {RED}{message}{RESET}")
    elif status == "INFO":
        print(f"{BLUE}ℹ INFO{RESET} - {test_name}")
        if message:
            print(f"  {message}")
    print()

def test_email_test_endpoint():
    """Test POST /api/email/test endpoint"""
    print(f"\n{YELLOW}=== Testing Email Test Endpoint ==={RESET}\n")
    
    # Test 1: Missing email parameter
    try:
        response = requests.post(f"{BASE_URL}/email/test", json={})
        if response.status_code == 400:
            data = response.json()
            if 'error' in data:
                log_test("POST /api/email/test (no email)", "PASS", 
                        f"Returns 400 with error: {data['error']}")
            else:
                log_test("POST /api/email/test (no email)", "FAIL", 
                        "Expected 'error' field in response")
        else:
            log_test("POST /api/email/test (no email)", "FAIL", 
                    f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("POST /api/email/test (no email)", "FAIL", str(e))
    
    # Test 2: With email but no API key configured
    try:
        response = requests.post(f"{BASE_URL}/email/test", 
                                json={"email": "test@example.com"})
        if response.status_code == 503:
            data = response.json()
            if 'error' in data and 'RESEND_API_KEY' in data['error']:
                log_test("POST /api/email/test (no API key)", "PASS", 
                        f"Returns 503 with message: {data['error']}")
            else:
                log_test("POST /api/email/test (no API key)", "FAIL", 
                        "Expected error message about RESEND_API_KEY")
        else:
            log_test("POST /api/email/test (no API key)", "FAIL", 
                    f"Expected 503, got {response.status_code}")
    except Exception as e:
        log_test("POST /api/email/test (no API key)", "FAIL", str(e))

def test_email_resend_endpoint():
    """Test POST /api/email/resend/:certId endpoint"""
    print(f"\n{YELLOW}=== Testing Email Resend Endpoint ==={RESET}\n")
    
    # Test 1: Resend for valid certificate (should return 503 due to no API key)
    try:
        response = requests.post(f"{BASE_URL}/email/resend/CERT-2026-0001")
        if response.status_code == 503:
            data = response.json()
            if 'message' in data and 'RESEND_API_KEY' in data['message']:
                log_test("POST /api/email/resend/CERT-2026-0001", "PASS", 
                        f"Returns 503: {data['message']}")
            else:
                log_test("POST /api/email/resend/CERT-2026-0001", "FAIL", 
                        "Expected message about RESEND_API_KEY")
        else:
            log_test("POST /api/email/resend/CERT-2026-0001", "FAIL", 
                    f"Expected 503, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /api/email/resend/CERT-2026-0001", "FAIL", str(e))
    
    # Test 2: Resend for non-existent certificate
    try:
        response = requests.post(f"{BASE_URL}/email/resend/NONEXISTENT-CERT-999")
        if response.status_code == 404:
            data = response.json()
            if 'error' in data:
                log_test("POST /api/email/resend/NONEXISTENT", "PASS", 
                        f"Returns 404: {data['error']}")
            else:
                log_test("POST /api/email/resend/NONEXISTENT", "FAIL", 
                        "Expected 'error' field in response")
        else:
            log_test("POST /api/email/resend/NONEXISTENT", "FAIL", 
                    f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("POST /api/email/resend/NONEXISTENT", "FAIL", str(e))

def test_email_logs_endpoint():
    """Test GET /api/email/logs endpoint"""
    print(f"\n{YELLOW}=== Testing Email Logs Endpoint ==={RESET}\n")
    
    try:
        response = requests.get(f"{BASE_URL}/email/logs")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                log_test("GET /api/email/logs", "PASS", 
                        f"Returns array with {len(data)} log entries")
                
                # Verify log entry structure if logs exist
                if len(data) > 0:
                    first_log = data[0]
                    required_fields = ['id', 'certificateNumber', 'recipientEmail', 
                                     'recipientName', 'status', 'createdAt']
                    missing_fields = [f for f in required_fields if f not in first_log]
                    
                    if not missing_fields:
                        log_test("Email log entry structure", "PASS", 
                                f"All required fields present: {', '.join(required_fields)}")
                        log_test("Sample log entry", "INFO", 
                                f"Status: {first_log['status']}, Cert: {first_log['certificateNumber']}")
                    else:
                        log_test("Email log entry structure", "FAIL", 
                                f"Missing fields: {', '.join(missing_fields)}")
                else:
                    log_test("Email logs content", "INFO", 
                            "No email logs found yet (expected if no certificates issued)")
            else:
                log_test("GET /api/email/logs", "FAIL", 
                        f"Expected array, got {type(data)}")
        else:
            log_test("GET /api/email/logs", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/email/logs", "FAIL", str(e))

def test_certificate_issuance_with_email():
    """Test POST /api/certificates with email notification integration"""
    print(f"\n{YELLOW}=== Testing Certificate Issuance with Email Integration ==={RESET}\n")
    
    # Step 1: Login
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login", 
                                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if login_response.status_code != 200:
            log_test("Admin login", "FAIL", 
                    f"Login failed with status {login_response.status_code}")
            return
        
        token = login_response.json().get('token')
        log_test("Admin login", "PASS", "Successfully authenticated")
        
    except Exception as e:
        log_test("Admin login", "FAIL", str(e))
        return
    
    # Step 2: Get students
    try:
        students_response = requests.get(f"{BASE_URL}/students")
        if students_response.status_code != 200:
            log_test("Get students", "FAIL", 
                    f"Failed with status {students_response.status_code}")
            return
        
        students = students_response.json()
        if not students or len(students) == 0:
            log_test("Get students", "FAIL", "No students found")
            return
        
        student = students[0]
        log_test("Get students", "PASS", 
                f"Found {len(students)} students, using: {student['name']}")
        
    except Exception as e:
        log_test("Get students", "FAIL", str(e))
        return
    
    # Step 3: Issue certificate
    try:
        cert_data = {
            "studentId": student['id'],
            "certificateName": f"Test Certificate - Email Integration {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "degree": "Sarjana Komputer (S.Kom)",
            "faculty": student.get('faculty', 'Fakultas Ilmu Komputer'),
            "major": student.get('major', 'Teknik Informatika'),
            "gpa": "3.85",
            "honors": "Cum Laude",
            "issueDate": datetime.now().strftime('%Y-%m-%d')
        }
        
        cert_response = requests.post(f"{BASE_URL}/certificates", 
                                     json=cert_data,
                                     headers={"Authorization": f"Bearer {token}"})
        
        if cert_response.status_code == 201:
            data = cert_response.json()
            
            # Check for emailNotification field
            if 'emailNotification' in data:
                email_notif = data['emailNotification']
                
                # Verify structure
                if 'sent' in email_notif and 'skipped' in email_notif:
                    log_test("Certificate issuance response structure", "PASS", 
                            "emailNotification field present with sent/skipped fields")
                    
                    # Verify email was skipped (no API key)
                    if email_notif['skipped'] == True and email_notif['sent'] == False:
                        log_test("Email notification behavior", "PASS", 
                                "Email gracefully skipped (no API key configured)")
                        
                        if 'error' in email_notif:
                            log_test("Email skip reason", "INFO", 
                                    f"Reason: {email_notif['error']}")
                    else:
                        log_test("Email notification behavior", "FAIL", 
                                f"Expected skipped=true, sent=false, got: {email_notif}")
                else:
                    log_test("Certificate issuance response structure", "FAIL", 
                            "emailNotification missing sent/skipped fields")
                
                # Log certificate details
                if 'certificate' in data:
                    cert = data['certificate']
                    log_test("Certificate created", "INFO", 
                            f"Number: {cert['certificateNumber']}, Student: {cert['studentName']}")
            else:
                log_test("Certificate issuance response structure", "FAIL", 
                        "emailNotification field missing from response")
        else:
            log_test("POST /api/certificates", "FAIL", 
                    f"Expected 201, got {cert_response.status_code}: {cert_response.text}")
    except Exception as e:
        log_test("POST /api/certificates", "FAIL", str(e))

def test_stats_endpoint():
    """Test GET /api/stats includes totalEmailsSent"""
    print(f"\n{YELLOW}=== Testing Stats Endpoint ==={RESET}\n")
    
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            data = response.json()
            
            if 'totalEmailsSent' in data:
                log_test("GET /api/stats (totalEmailsSent field)", "PASS", 
                        f"totalEmailsSent: {data['totalEmailsSent']}")
                
                # Log other stats for context
                log_test("Stats summary", "INFO", 
                        f"Students: {data.get('totalStudents', 'N/A')}, "
                        f"Certificates: {data.get('totalCertificates', 'N/A')}, "
                        f"Emails Sent: {data.get('totalEmailsSent', 'N/A')}")
            else:
                log_test("GET /api/stats (totalEmailsSent field)", "FAIL", 
                        "totalEmailsSent field missing from response")
        else:
            log_test("GET /api/stats", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/stats", "FAIL", str(e))

def test_existing_endpoints_regression():
    """Regression test for existing endpoints"""
    print(f"\n{YELLOW}=== Regression Tests for Existing Endpoints ==={RESET}\n")
    
    # Test 1: Verify valid certificate
    try:
        response = requests.get(f"{BASE_URL}/verify/CERT-2026-0001")
        if response.status_code == 200:
            data = response.json()
            if data.get('valid') == True and 'certificate' in data:
                log_test("GET /api/verify/CERT-2026-0001 (valid)", "PASS", 
                        f"Certificate valid: {data['certificate']['studentName']}")
            else:
                log_test("GET /api/verify/CERT-2026-0001 (valid)", "FAIL", 
                        "Expected valid=true and certificate data")
        else:
            log_test("GET /api/verify/CERT-2026-0001 (valid)", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/verify/CERT-2026-0001 (valid)", "FAIL", str(e))
    
    # Test 2: Verify invalid certificate
    try:
        response = requests.get(f"{BASE_URL}/verify/PALSU-999-XXXX")
        if response.status_code == 404:
            data = response.json()
            if data.get('valid') == False:
                log_test("GET /api/verify/PALSU-999-XXXX (invalid)", "PASS", 
                        "Returns 404 with valid=false")
            else:
                log_test("GET /api/verify/PALSU-999-XXXX (invalid)", "FAIL", 
                        "Expected valid=false")
        else:
            log_test("GET /api/verify/PALSU-999-XXXX (invalid)", "FAIL", 
                    f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/verify/PALSU-999-XXXX (invalid)", "FAIL", str(e))
    
    # Test 3: Get students
    try:
        response = requests.get(f"{BASE_URL}/students")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                log_test("GET /api/students", "PASS", 
                        f"Returns {len(data)} students")
            else:
                log_test("GET /api/students", "FAIL", 
                        "Expected array response")
        else:
            log_test("GET /api/students", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/students", "FAIL", str(e))
    
    # Test 4: Get certificates
    try:
        response = requests.get(f"{BASE_URL}/certificates")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                log_test("GET /api/certificates", "PASS", 
                        f"Returns {len(data)} certificates")
            else:
                log_test("GET /api/certificates", "FAIL", 
                        "Expected array response")
        else:
            log_test("GET /api/certificates", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/certificates", "FAIL", str(e))

def main():
    """Run all tests"""
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}VeriChain Academic - Email Notification System Backend Tests{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    # Run all test suites
    test_email_test_endpoint()
    test_email_resend_endpoint()
    test_email_logs_endpoint()
    test_certificate_issuance_with_email()
    test_stats_endpoint()
    test_existing_endpoints_regression()
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}All tests completed!{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")

if __name__ == "__main__":
    main()
