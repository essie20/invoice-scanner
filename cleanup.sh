#!/bin/bash

# Manual cleanup script for testing
# Usage: ./cleanup.sh

echo "Testing automatic cleanup endpoint..."

# Replace with your actual CRON_SECRET from .env.local
CRON_SECRET="very-secret-cron-secret"
ENDPOINT="http://localhost:3000/api/cleanup"

# Test the cleanup endpoint
curl -X POST "$ENDPOINT" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  | jq '.'

echo "Cleanup test completed."