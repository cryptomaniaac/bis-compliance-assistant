#!/usr/bin/env python3
"""
Diagnose why /api/scan/poll returns 'waiting' after /api/scan/complete sets status='completed'.
Tests against local dev server to get detailed Vercel function logs.
"""
import urllib.request
import json
import ssl
import time

ssl_context = ssl._create_unverified_context()
BASE_URL = "https://bis-compliance-assistant.vercel.app"

def req(url, payload=None, method=None):
    if payload is not None:
        data = json.dumps(payload).encode()
        r = urllib.request.Request(url, data=data, method=method or "POST")
        r.add_header("Content-Type", "application/json")
    else:
        r = urllib.request.Request(url, method=method or "GET")
    try:
        with urllib.request.urlopen(r, context=ssl_context) as resp:
            body = resp.read().decode()
            return json.loads(body), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return json.loads(body), e.code
        except:
            return {"raw": body}, e.code


print("=== Supabase scan_sessions flow diagnostic ===\n")

# Step 1: Create session
data, status = req(f"{BASE_URL}/api/scan/sessions", {})
print(f"[1] POST /api/scan/sessions → {status}: {data}")
session_id = data.get("sessionId")
if not session_id:
    print("FATAL: No sessionId returned")
    exit(1)

# Step 2: Immediate poll (expect 'waiting')
data, status = req(f"{BASE_URL}/api/scan/poll?sessionId={session_id}")
print(f"[2] GET /api/scan/poll → {status}: {data}")

# Step 3: Complete
data, status = req(f"{BASE_URL}/api/scan/complete", {"sessionId": session_id})
print(f"[3] POST /api/scan/complete → {status}: {data}")

# Step 4: Poll again after 1 second
time.sleep(1)
data, status = req(f"{BASE_URL}/api/scan/poll?sessionId={session_id}")
print(f"[4] GET /api/scan/poll after complete → {status}: {data}")

if data.get("status") == "completed":
    print("\n✅ PASS: status=completed after calling /api/scan/complete")
else:
    print(f"\n❌ FAIL: status='{data.get('status')}' — DB update not reaching poll")
    print("\nLikely causes:")
    print("  A) Supabase RLS SELECT policy blocks anon reads on scan_sessions")
    print("     → Fix: Add RLS policy to allow anon SELECT on scan_sessions")
    print("  B) Supabase RLS UPDATE/INSERT policy blocks service-role write")
    print("     → Unlikely since service role bypasses RLS")
    print("  C) The session UUID from /api/scan/sessions uses a fallback that isn't in DB")
    print(f"     → Session ID was: {session_id}")

# Step 5: Try direct debug endpoint for admin SELECT
print(f"\n[5] Checking if /api/scan/poll returns null for this session (RLS SELECT issue check)...")
# Try with a random non-existent UUID — if poll returns 'waiting' for both, it means
# anon client can't see ANY scan_sessions rows
import uuid
fake_id = str(uuid.uuid4())
data2, _ = req(f"{BASE_URL}/api/scan/poll?sessionId={fake_id}")
data3, _ = req(f"{BASE_URL}/api/scan/poll?sessionId={session_id}")
print(f"  Poll with fake UUID    → {data2}")
print(f"  Poll with real UUID    → {data3}")
if data2.get("status") == data3.get("status") == "waiting":
    print("  → Both real and fake UUIDs return 'waiting': anon client CANNOT read scan_sessions (RLS SELECT policy missing)")
elif data3.get("status") == "completed":
    print("  → Real UUID now shows 'completed' ✅ (timing issue resolved)")
else:
    print("  → Inconclusive")
