FROM node:20-slim

# Install necessary packages for Chrome and cron
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    cron \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Create cron log file
RUN touch /var/log/cron.log

# Add cron job (every 3 hours)
RUN echo "0 */3 * * * cd /app && yarn ts-node main.ts >> /var/log/cron.log 2>&1" > /etc/cron.d/crawling-job
# Add cron job (every 10 minutes for testing)
# RUN echo "*/10 * * * * cd /app && yarn ts-node main.ts >> /var/log/cron.log 2>&1" > /etc/cron.d/crawling-job

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/crawling-job

# Apply cron job
RUN crontab /etc/cron.d/crawling-job

# Create the run script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port (if needed for health checks)
EXPOSE 3000

# Start cron and keep container running
ENTRYPOINT ["/docker-entrypoint.sh"]