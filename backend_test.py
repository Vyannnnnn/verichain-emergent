#!/usr/bin/env python3
"""
VeriChain Academic - Backend API Test Suite
Testing QR Code Verification, Email Notification with Real API Key, and Certificate Issuance
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

# Test email (owner email for Resend free tier)
TEST_EMAIL = "fian88518@gmail.com"

# Student with owner email
STUDENT_ID_WITH_OWNER_EMAIL = "std-81aa9d96"

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

def test_verify_api_regression():
    """Test GET /api/verify/:certificateNumber for multiple certificates"""
    print(f"\n{YELLOW}=== Testing Verify API (Regression Check) ==={RESET}\n")
    
    # Test 1: Valid certificate CERT-2026-0001
    try:
        response = requests.get(f"{BASE_URL}/verify/CERT-2026-0001")
        if response.status_code == 200:
            data = response.json()
            if (data.get('valid') == True and 
                'certificate' in data and 
                'databaseCheck' in data and 
                'blockchainCheck' in data):
                cert = data['certificate']
                log_test("GET /api/verify/CERT-2026-0001", "PASS", 
                        f"Valid certificate: {cert.get('studentName', 'N/A')}, "
                        f"NIM: {cert.get('studentNim', 'N/A')}")
                log_test("Dual verification structure", "INFO", 
                        f"Database: {data['databaseCheck'].get('status', 'N/A')}, "
                        f"Blockchain: {data['blockchainCheck'].get('status', 'N/A')}")
            else:
                log_test("GET /api/verify/CERT-2026-0001", "FAIL", 
                        f"Missing required fields. Response: {json.dumps(data, indent=2)}")
        else:
            log_test("GET /api/verify/CERT-2026-0001", "FAIL", 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET /api/verify/CERT-2026-0001", "FAIL", str(e))
    
    # Test 2: Valid certificate CERT-2026-0002
    try:
        response = requests.get(f"{BASE_URL}/verify/CERT-2026-0002")
        if response.status_code == 200:
            data = response.json()
            if data.get('valid') == True:
                log_test("GET /api/verify/CERT-2026-0002", "PASS", 
                        f"Valid certificate: {data['certificate'].get('studentName', 'N/A')}")
            else:
                log_test("GET /api/verify/CERT-2026-0002", "FAIL", 
                        "Expected valid=true")
        else:
            log_test("GET /api/verify/CERT-2026-0002", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/verify/CERT-2026-0002", "FAIL", str(e))
    
    # Test 3: Invalid certificate
    try:
        response = requests.get(f"{BASE_URL}/verify/PALSU-999-XXXX")
        if response.status_code == 404:
            data = response.json()
            if data.get('valid') == False:
                log_test("GET /api/verify/PALSU-999-XXXX (invalid)", "PASS", 
                        "Returns 404 with valid=false as expected")
            else:
                log_test("GET /api/verify/PALSU-999-XXXX (invalid)", "FAIL", 
                        "Expected valid=false")
        else:
            log_test("GET /api/verify/PALSU-999-XXXX (invalid)", "FAIL", 
                    f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/verify/PALSU-999-XXXX (invalid)", "FAIL", str(e))
    
    # Test 4: Check if CERT-2026-0006 exists (newly issued)
    try:
        response = requests.get(f"{BASE_URL}/verify/CERT-2026-0006")
        if response.status_code == 200:
            data = response.json()
            if data.get('valid') == True:
                log_test("GET /api/verify/CERT-2026-0006", "PASS", 
                        f"Newly issued certificate verified: {data['certificate'].get('studentName', 'N/A')}")
            else:
                log_test("GET /api/verify/CERT-2026-0006", "FAIL", 
                        "Expected valid=true")
        elif response.status_code == 404:
            log_test("GET /api/verify/CERT-2026-0006", "INFO", 
                    "Certificate not found (may not be issued yet)")
        else:
            log_test("GET /api/verify/CERT-2026-0006", "FAIL", 
                    f"Unexpected status {response.status_code}")
    except Exception as e:
        log_test("GET /api/verify/CERT-2026-0006", "FAIL", str(e))

def test_email_with_real_api_key():
    """Test email endpoints with real RESEND_API_KEY configured"""
    print(f"\n{YELLOW}=== Testing Email Notification with Real API Key ==={RESET}\n")
    
    # Test 1: Send test email to owner email
    try:
        response = requests.post(f"{BASE_URL}/email/test", 
                                json={"email": TEST_EMAIL})
        if response.status_code == 200:
            data = response.json()
            if data.get('success') == True and 'emailId' in data:
                log_test("POST /api/email/test (real API key)", "PASS", 
                        f"Test email sent successfully to {TEST_EMAIL}, emailId: {data['emailId']}")
            else:
                log_test("POST /api/email/test (real API key)", "FAIL", 
                        f"Expected success=true and emailId. Response: {json.dumps(data, indent=2)}")
        else:
            log_test("POST /api/email/test (real API key)", "FAIL", 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /api/email/test (real API key)", "FAIL", str(e))
    
    # Test 2: Resend email for CERT-2026-0001
    try:
        response = requests.post(f"{BASE_URL}/email/resend/CERT-2026-0001")
        if response.status_code == 200:
            data = response.json()
            if data.get('success') == True and 'emailId' in data:
                log_test("POST /api/email/resend/CERT-2026-0001", "PASS", 
                        f"Email resent successfully, emailId: {data['emailId']}")
            else:
                log_test("POST /api/email/resend/CERT-2026-0001", "FAIL", 
                        f"Expected success=true and emailId. Response: {json.dumps(data, indent=2)}")
        elif response.status_code == 503:
            # This might happen if the student email is not the owner email
            data = response.json()
            log_test("POST /api/email/resend/CERT-2026-0001", "INFO", 
                    f"Email service unavailable (student email may not be verified): {data.get('message', 'N/A')}")
        else:
            log_test("POST /api/email/resend/CERT-2026-0001", "FAIL", 
                    f"Expected 200, got {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST /api/email/resend/CERT-2026-0001", "FAIL", str(e))
    
    # Test 3: Get email logs
    try:
        response = requests.get(f"{BASE_URL}/email/logs")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                sent_count = sum(1 for log in data if log.get('status') == 'sent')
                log_test("GET /api/email/logs", "PASS", 
                        f"Returns {len(data)} log entries, {sent_count} sent successfully")
                
                # Show sample log entry
                if len(data) > 0:
                    sample = data[0]
                    log_test("Sample email log", "INFO", 
                            f"Cert: {sample.get('certificateNumber', 'N/A')}, "
                            f"Status: {sample.get('status', 'N/A')}, "
                            f"Recipient: {sample.get('recipientEmail', 'N/A')}")
            else:
                log_test("GET /api/email/logs", "FAIL", 
                        f"Expected array, got {type(data)}")
        else:
            log_test("GET /api/email/logs", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/email/logs", "FAIL", str(e))
    
    # Test 4: Check stats for totalEmailsSent
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            data = response.json()
            if 'totalEmailsSent' in data:
                emails_sent = data['totalEmailsSent']
                if emails_sent > 0:
                    log_test("GET /api/stats (totalEmailsSent)", "PASS", 
                            f"totalEmailsSent: {emails_sent} (emails are being sent)")
                else:
                    log_test("GET /api/stats (totalEmailsSent)", "INFO", 
                            f"totalEmailsSent: {emails_sent} (no emails sent yet or all failed)")
            else:
                log_test("GET /api/stats (totalEmailsSent)", "FAIL", 
                        "totalEmailsSent field missing")
        else:
            log_test("GET /api/stats", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/stats", "FAIL", str(e))

def test_certificate_issuance_with_real_email():
    """Test certificate issuance with real email notification"""
    print(f"\n{YELLOW}=== Testing Certificate Issuance with Real Email ==={RESET}\n")
    
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
    
    # Step 2: Get students to verify student exists
    try:
        students_response = requests.get(f"{BASE_URL}/students")
        if students_response.status_code != 200:
            log_test("Get students", "FAIL", 
                    f"Failed with status {students_response.status_code}")
            return
        
        students = students_response.json()
        target_student = None
        for student in students:
            if student.get('id') == STUDENT_ID_WITH_OWNER_EMAIL:
                target_student = student
                break
        
        if not target_student:
            log_test("Find target student", "FAIL", 
                    f"Student {STUDENT_ID_WITH_OWNER_EMAIL} not found")
            return
        
        log_test("Find target student", "PASS", 
                f"Found student: {target_student['name']} ({target_student['email']})")
        
    except Exception as e:
        log_test("Get students", "FAIL", str(e))
        return
    
    # Step 3: Issue certificate for student with owner email
    try:
        cert_data = {
            "studentId": target_student['id'],
            "certificateName": f"Ijazah Sarjana Komputer - Test Real Email {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "degree": "Sarjana Komputer (S.Kom)",
            "faculty": target_student.get('faculty', 'Fakultas Ilmu Komputer'),
            "major": target_student.get('major', 'Teknik Informatika'),
            "gpa": "3.95",
            "honors": "Dengan Pujian (Cum Laude)",
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
                
                # Verify email was sent successfully
                if email_notif.get('sent') == True and 'emailId' in email_notif:
                    log_test("Certificate issuance with real email", "PASS", 
                            f"Certificate issued and email sent successfully to {email_notif.get('recipientEmail', 'N/A')}")
                    log_test("Email notification details", "INFO", 
                            f"emailId: {email_notif['emailId']}")
                elif email_notif.get('skipped') == True:
                    log_test("Certificate issuance with real email", "FAIL", 
                            f"Email was skipped (expected to be sent). Reason: {email_notif.get('error', 'N/A')}")
                else:
                    log_test("Certificate issuance with real email", "FAIL", 
                            f"Email sending failed. Error: {email_notif.get('error', 'N/A')}")
                
                # Log certificate details
                if 'certificate' in data:
                    cert = data['certificate']
                    log_test("Certificate created", "INFO", 
                            f"Number: {cert['certificateNumber']}, "
                            f"Student: {cert['studentName']}, "
                            f"TxHash: {cert.get('txHash', 'N/A')[:20]}...")
            else:
                log_test("Certificate issuance response", "FAIL", 
                        "emailNotification field missing from response")
        else:
            log_test("POST /api/certificates", "FAIL", 
                    f"Expected 201, got {cert_response.status_code}: {cert_response.text}")
    except Exception as e:
        log_test("POST /api/certificates", "FAIL", str(e))

def test_full_regression():
    """Full regression test for all existing endpoints"""
    print(f"\n{YELLOW}=== Full Regression Tests ==={RESET}\n")
    
    # Test 1: Get students
    try:
        response = requests.get(f"{BASE_URL}/students")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET /api/students", "PASS", 
                        f"Returns {len(data)} students")
            else:
                log_test("GET /api/students", "FAIL", 
                        "Expected non-empty array")
        else:
            log_test("GET /api/students", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/students", "FAIL", str(e))
    
    # Test 2: Get certificates
    try:
        response = requests.get(f"{BASE_URL}/certificates")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET /api/certificates", "PASS", 
                        f"Returns {len(data)} certificates")
            else:
                log_test("GET /api/certificates", "FAIL", 
                        "Expected non-empty array")
        else:
            log_test("GET /api/certificates", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/certificates", "FAIL", str(e))
    
    # Test 3: Get blockchain status
    try:
        response = requests.get(f"{BASE_URL}/blockchain/status")
        if response.status_code == 200:
            data = response.json()
            if 'isConnected' in data and 'network' in data:
                log_test("GET /api/blockchain/status", "PASS", 
                        f"Network: {data.get('network', 'N/A')}, "
                        f"Connected: {data.get('isConnected', 'N/A')}")
            else:
                log_test("GET /api/blockchain/status", "FAIL", 
                        "Missing required fields")
        else:
            log_test("GET /api/blockchain/status", "FAIL", 
                    f"Expected 200, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/blockchain/status", "FAIL", str(e))

def main():
    """Run all tests"""
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}VeriChain Academic - Backend API Tests{RESET}")
    print(f"{BLUE}QR Code Verification, Email with Real API Key, Certificate Issuance{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Email: {TEST_EMAIL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{BLUE}{'='*70}{RESET}\n")
    
    # Run all test suites
    test_verify_api_regression()
    test_email_with_real_api_key()
    test_certificate_issuance_with_real_email()
    test_full_regression()
    
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}All tests completed!{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")

if __name__ == "__main__":
    main()
