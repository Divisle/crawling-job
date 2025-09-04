#!/bin/bash
# filepath: /home/planhorror/Repositories/crawling-job/setup-cron.sh

# Exit on any error
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to log messages with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Setting up automated cron job for crawling project..."

# Make main.sh executable
log "Making main.sh executable..."
chmod +x "$SCRIPT_DIR/main.sh"

# Ask user for cron schedule
echo ""
echo "Choose a cron schedule:"
echo "1) Every hour"
echo "2) Daily at 9 AM"
echo "3) Daily at midnight"
echo "4) Every 6 hours"
echo "5) Custom schedule"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        CRON_SCHEDULE="0 * * * *"
        SCHEDULE_DESC="every hour"
        ;;
    2)
        CRON_SCHEDULE="0 9 * * *"
        SCHEDULE_DESC="daily at 9 AM"
        ;;
    3)
        CRON_SCHEDULE="0 0 * * *"
        SCHEDULE_DESC="daily at midnight"
        ;;
    4)
        CRON_SCHEDULE="0 */6 * * *"
        SCHEDULE_DESC="every 6 hours"
        ;;
    5)
        echo "Enter custom cron schedule (e.g., '0 9 * * *' for daily at 9 AM):"
        read -p "Schedule: " CRON_SCHEDULE
        SCHEDULE_DESC="custom schedule: $CRON_SCHEDULE"
        ;;
    *)
        log "Invalid choice. Using default: daily at 9 AM"
        CRON_SCHEDULE="0 9 * * *"
        SCHEDULE_DESC="daily at 9 AM"
        ;;
esac

# Create the cron job entry
CRON_JOB="$CRON_SCHEDULE $SCRIPT_DIR/main.sh >> $SCRIPT_DIR/cron.log 2>&1"

log "Adding cron job with schedule: $SCHEDULE_DESC"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$SCRIPT_DIR/main.sh"; then
    log "Cron job already exists. Removing old entry..."
    # Remove existing entry
    (crontab -l 2>/dev/null | grep -v "$SCRIPT_DIR/main.sh") | crontab -
fi

# Add new cron job
log "Installing new cron job..."
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

# Verify cron job was added
log "Verifying cron job installation..."
if crontab -l | grep -q "$SCRIPT_DIR/main.sh"; then
    log "✅ Cron job successfully installed!"
    echo ""
    echo "📋 Cron job details:"
    echo "   Schedule: $SCHEDULE_DESC"
    echo "   Command: $SCRIPT_DIR/main.sh"
    echo "   Log file: $SCRIPT_DIR/cron.log"
    echo ""
    echo "🔍 To check cron jobs: crontab -l"
    echo "📝 To view logs: tail -f $SCRIPT_DIR/cron.log"
    echo "❌ To remove cron job: crontab -e (then delete the line)"
    echo ""
else
    log "❌ Failed to install cron job"
    exit 1
fi

# Test the main script once to make sure it works
read -p "Do you want to test run the script now? (y/n): " test_run
if [[ $test_run =~ ^[Yy]$ ]]; then
    log "Running test execution..."
    echo "----------------------------------------"
    "$SCRIPT_DIR/main.sh"
    echo "----------------------------------------"
    log "✅ Test execution completed!"
fi

log "🎉 Setup completed! Your crawling job will now run automatically $SCHEDULE_DESC"