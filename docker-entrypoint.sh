#!/bin/bash

echo "Starting Docker container..."
echo "Node version: $(node --version)"
echo "Yarn version: $(yarn --version)"

# Start cron service
service cron start

# Run the job once immediately (optional)
echo "Running initial job execution..."
cd /app && yarn ts-node main.ts

echo "Cron job scheduled to run every 3 hours"
echo "Container is ready. Monitoring cron logs..."

# Keep the container running and show logs
tail -f /var/log/cron.log