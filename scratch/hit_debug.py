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
        try: return json.loads(body), e.code
        except: return {"raw": body}, e.code

# Create a session
data, _ = req(f"{BASE_URL}/api/scan/sessions", {})
session_id = data.get("sessionId")
print(f"Session ID: {session_id}")

# Call debug endpoint
data, status = req(f"{BASE_URL}/api/scan/debug?sessionId={session_id}")
print(f"\nDebug response ({status}):")
print(json.dumps(data, indent=2))
