FROM node:20-slim

# Install all necessary packages in one layer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    cron \
    tini \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    && wget -q -O chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt install -y ./chrome.deb \
    && rm chrome.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .

# Generate Prisma client during build
RUN yarn prisma generate

# Create cron job that runs every 10 minutes from 22:40-23:10 GMT+7 (15:40-16:10 UTC)
RUN mkdir -p /var/log \
    && touch /var/log/cron.log \
    && chmod 666 /var/log/cron.log \
    && echo "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" > /etc/cron.d/crawling-job \
    && echo "NODE_PATH=/app/node_modules" >> /etc/cron.d/crawling-job \
    && echo "40,50 15 * * * root cd /app && /usr/local/bin/node /app/node_modules/.bin/ts-node main.ts >> /var/log/cron.log 2>&1" >> /etc/cron.d/crawling-job \
    && echo "0,10 16 * * * root cd /app && /usr/local/bin/node /app/node_modules/.bin/ts-node main.ts >> /var/log/cron.log 2>&1" >> /etc/cron.d/crawling-job \
    # For daily run at 00:00 GMT+7 (17:00 UTC) - uncomment the line below when needed
    # && echo "0 17 * * * root cd /app && /usr/local/bin/node /app/node_modules/.bin/ts-node main.ts >> /var/log/cron.log 2>&1" >> /etc/cron.d/crawling-job \
    && chmod 0644 /etc/cron.d/crawling-job \
    && crontab /etc/cron.d/crawling-job \
    && echo '#!/bin/bash\nset -e\necho "Starting container at $(date)"\necho "Node version: $(node --version)"\necho "Checking ts-node: $(/usr/local/bin/node /app/node_modules/.bin/ts-node --version || echo "ts-node not found")"\nservice cron start\necho "Cron service started successfully"\necho "Active cron jobs:"\ncrontab -l\necho "Container ready. Job will run at 22:40, 22:50, 23:00, 23:10 GMT+7 daily. Monitoring cron logs..."\necho "Initial cron log content:" > /var/log/cron.log\necho "$(date): Container started, waiting for cron jobs..." >> /var/log/cron.log\nexec tail -f /var/log/cron.log' > /start.sh \
    && chmod +x /start.sh

ENV CHROME_BIN=/usr/bin/google-chrome-stable
ENV CHROME_PATH=/usr/bin/google-chrome-stable

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/start.sh"]