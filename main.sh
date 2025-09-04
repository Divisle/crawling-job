#!/bin/bash
# filepath: /home/planhorror/Repositories/crawling-job/main.sh

# Exit on any error
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to log messages with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting crawling job setup and execution..."

# Kill any existing Chrome processes to prevent conflicts
log "Cleaning up any existing Chrome processes..."
pkill -f "chrome" || true
pkill -f "chromium" || true
sleep 2

# Clean up any leftover Chrome user data directories
log "Cleaning up Chrome user data directories..."
rm -rf /tmp/.com.google.Chrome* 2>/dev/null || true
rm -rf /tmp/chrome_* 2>/dev/null || true

# 1. Check if nvm exists, if not download it
if ! command -v nvm &> /dev/null && [ ! -s "$HOME/.nvm/nvm.sh" ]; then
    log "NVM not found. Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    log "NVM installation completed"
else
    log "NVM already exists"
fi

# Source nvm to make it available in this script
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 2. Install and use LTS version of Node.js
log "Installing Node.js LTS version..."
nvm install --lts
nvm use --lts
log "Node.js version: $(node --version)"
log "NPM version: $(npm --version)"

# 3. Check if yarn exists, if not install it
if ! command -v yarn &> /dev/null; then
    log "Yarn not found. Installing Yarn..."
    npm install -g yarn
    log "Yarn installation completed"
else
    log "Yarn already exists. Version: $(yarn --version)"
fi

# 4. Navigate to project directory and install dependencies
log "Navigating to project directory: $SCRIPT_DIR"
cd "$SCRIPT_DIR"

log "Installing project dependencies..."
yarn install

# 5. Run the main TypeScript file
log "Starting crawling job execution..."
yarn ts-node main.ts

# Clean up after execution
log "Cleaning up Chrome processes after execution..."
pkill -f "chrome" || true
pkill -f "chromium" || true

log "Crawling job completed successfully!"