# Use the official Puppeteer image as the base
FROM ghcr.io/puppeteer/puppeteer:23.4.1

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    PUPPETEER_CACHE_DIR=/opt/render/project/.chrome

# Install dependencies required for running Chrome/Chromium in headless mode
RUN apt-get update && apt-get install -y \
    
    google-chrome-stable

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set up a command to run the application
CMD ["node", "server.js"]
