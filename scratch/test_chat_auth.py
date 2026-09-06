#!/usr/bin/env python3
"""
Test script for Task 1: Proactive Compliance Risk Flagging via authenticated /api/chat calls.
"""

import urllib.request
import urllib.parse
import http.cookiejar
import json
import ssl

ssl_context = ssl._create_unverified_context()
BASE_URL = "https://bis-compliance-assistant.vercel.app"

# Setup cookie processor to capture session cookie
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cj),
    urllib.request.HTTPSHandler(context=ssl_context)
)

def post_json(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    with opener.open(req) as resp:
        return json.loads(resp.read().decode('utf-8')), resp.status

def test_task_1():
    print("=" * 60)
    print("TESTING TASK 1: PROACTIVE COMPLIANCE RISK FLAGGING")
    print("=" * 60)

    # 1. Sign up / Login test account
    test_email = f"testuser_{int(urllib.parse.quote('123'))}@example.com"
    test_pass = "TestPassword123!"

    print("\n[AUTH] Creating or logging into test user account...")
    try:
        signup_res, s_status = post_json(f"{BASE_URL}/api/auth/signup", {
            "email": "authtest@example.com",
            "name": "Auth Test User",
            "password": test_pass
        })
        print(f"Signup response: {signup_res}")
    except Exception as e:
        print(f"Signup notice: {e}")

    try:
        login_res, l_status = post_json(f"{BASE_URL}/api/auth/login", {
            "email": "authtest@example.com",
            "password": test_pass
        })
        print(f"✓ Login success: {login_res.get('user', {}).get('email')}")
    except Exception as err:
        print(f"Login failed: {err}")

    # 2. Test 1.1: Commercial query without certification
    print("\n[TEST 1.1] Commercial query: 'I manufacture LED bulbs and want to sell them in India'")
    try:
        res1, status1 = post_json(f"{BASE_URL}/api/chat", {
            "message": "I manufacture LED bulbs and want to sell them in India",
            "targetLanguage": "en"
        })
        summary1 = res1.get("structuredResponse", {}).get("summary", "")
        print(f"Summary 1:\n{summary1}\n")
        has_flag = "⚠️ Compliance Risk" in summary1 or "Compliance Risk" in summary1 or "compliance risk" in summary1.lower()
        print(f"-> Compliance Risk Flag Present: {'✅ YES' if has_flag else '❌ NO'}")
    except Exception as err:
        print(f"Test 1.1 error: {err}")

    # 3. Test 1.2: Research query
    print("\n[TEST 1.2] Research query: 'What is IS 16102 about?'")
    try:
        res2, status2 = post_json(f"{BASE_URL}/api/chat", {
            "message": "What is IS 16102 about?",
            "targetLanguage": "en"
        })
        summary2 = res2.get("structuredResponse", {}).get("summary", "")
        print(f"Summary 2:\n{summary2}\n")
        has_flag2 = "Compliance Risk" in summary2 or "⚠️" in summary2
        print(f"-> Compliance Risk Flag Present: {'❌ YES (Unexpected)' if has_flag2 else '✅ NO (Correct)'}")
    except Exception as err:
        print(f"Test 1.2 error: {err}")

    # 4. Test 1.3: Already certified query
    print("\n[TEST 1.3] Already certified: 'I already have ISI certification for my electric kettle, what's next?'")
    try:
        res3, status3 = post_json(f"{BASE_URL}/api/chat", {
            "message": "I already have ISI certification for my electric kettle, what's next?",
            "targetLanguage": "en"
        })
        summary3 = res3.get("structuredResponse", {}).get("summary", "")
        print(f"Summary 3:\n{summary3}\n")
        has_flag3 = "Compliance Risk" in summary3 or "⚠️" in summary3
        print(f"-> Compliance Risk Flag Present: {'❌ YES (Unexpected)' if has_flag3 else '✅ NO (Correct)'}")
    except Exception as err:
        print(f"Test 1.3 error: {err}")

    # 5. Test 1.4: Hindi commercial query
    print("\n[TEST 1.4] Hindi commercial query: 'मैं भारत में LED बल्ब बनाकर बेचना चाहता हूँ'")
    try:
        res4, status4 = post_json(f"{BASE_URL}/api/chat", {
            "message": "मैं भारत में LED बल्ब बनाकर बेचना चाहता हूँ",
            "targetLanguage": "hi"
        })
        summary4 = res4.get("structuredResponse", {}).get("summary", "")
        print(f"Summary 4 (Hindi):\n{summary4}\n")
        code_verbatim = "IS 16102" in summary4 or "IS 16102" in str(res4)
        print(f"-> IS Code Verbatim in Hindi output: {'✅ YES' if code_verbatim else '❌ NO'}")
    except Exception as err:
        print(f"Test 1.4 error: {err}")

if __name__ == "__main__":
    test_task_1()
