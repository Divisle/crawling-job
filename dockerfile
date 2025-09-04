# More advanced approach without entrypoint
FROM node:20-slim

# Install packages including init system
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates cron tini \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .

# Setup cron
RUN touch /var/log/cron.log && \
    echo "0 */3 * * * cd /app && yarn ts-node main.ts >> /var/log/cron.log 2>&1" > /etc/cron.d/crawling-job && \
    chmod 0644 /etc/cron.d/crawling-job && \
    crontab /etc/cron.d/crawling-job

# Use tini as init system
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD service cron start && exec tail -f /var/log/cron.log