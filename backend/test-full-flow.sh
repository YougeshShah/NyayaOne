#!/bin/bash
# NyayaOne - Full Flow Test Script
# Run with: bash test-full-flow.sh

set -e  # stop immediately if any step fails
BASE="http://localhost:5000/api/v1"

echo "== 1. Firm Admin Login =="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ram@kla.com.np","password":"SecurePass123!"}')
echo "$LOGIN_RESPONSE"
echo ""

FIRM_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

if [ -z "$FIRM_TOKEN" ]; then
  echo "ERROR: Could not get token. Stopping."
  exit 1
fi
echo "Token acquired successfully."
echo ""

echo "== 2. Create Client =="
CLIENT_RESPONSE=$(curl -s -X POST "$BASE/clients" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $FIRM_TOKEN" \
  -d '{"fullName":"Hari Bahadur Thapa","phone":"9800011122","address":"Kathmandu"}')
echo "$CLIENT_RESPONSE"
echo ""

echo "== 3. Find Kathmandu District Court =="
COURT_RESPONSE=$(curl -s "$BASE/courts?search=Kathmandu%20District" \
  -H "Authorization: Bearer $FIRM_TOKEN")
echo "$COURT_RESPONSE"
COURT_ID=$(echo "$COURT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['items'][0]['id'])")
echo "Court ID: $COURT_ID"
echo ""

echo "== 4. Find Lawyer (Sita Poudel) =="
LAWYER_RESPONSE=$(curl -s "$BASE/users?accountType=LAWYER" \
  -H "Authorization: Bearer $FIRM_TOKEN")
echo "$LAWYER_RESPONSE"
LAWYER_ID=$(echo "$LAWYER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['items'][0]['id'])")
echo "Lawyer ID: $LAWYER_ID"
echo ""

echo "== 5. Find Client (just created) =="
CLIENT_LIST_RESPONSE=$(curl -s "$BASE/clients" \
  -H "Authorization: Bearer $FIRM_TOKEN")
CLIENT_ID=$(echo "$CLIENT_LIST_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['items'][0]['id'])")
echo "Client ID: $CLIENT_ID"
echo ""

echo "== 6. Create Case =="
CASE_RESPONSE=$(curl -s -X POST "$BASE/cases" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $FIRM_TOKEN" \
  -d "{\"caseNumber\":\"CASE-2026-001\",\"caseTitle\":\"Property Dispute\",\"courtId\":\"$COURT_ID\",\"clientIds\":[\"$CLIENT_ID\"],\"lawyerIds\":[\"$LAWYER_ID\"],\"leadLawyerId\":\"$LAWYER_ID\",\"priority\":\"HIGH\"}")
echo "$CASE_RESPONSE"
CASE_ID=$(echo "$CASE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
echo "Case ID: $CASE_ID"
echo ""

echo "== 7. Create Hearing (with automatic reminders) =="
HEARING_RESPONSE=$(curl -s -X POST "$BASE/hearings" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $FIRM_TOKEN" \
  -d "{\"caseId\":\"$CASE_ID\",\"hearingDate\":\"2026-08-01T10:00:00Z\",\"judge\":\"Hon. Justice Sharma\"}")
echo "$HEARING_RESPONSE"
echo ""

echo "== ALL TESTS COMPLETE =="
