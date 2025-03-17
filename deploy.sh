#!/bin/bash



# Define variables
SERVICE_NAME="greensaucebot"
# Update code from repository
git fetch
git pull

# Build and start the service using docker-compose
docker-compose up -d --build

# Clear logs
npm run logs
