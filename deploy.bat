@echo off
setlocal

REM Define variables
set SERVICE_NAME=greensaucebot

REM Build and start the service using docker-compose
docker-compose up -d --build

REM Clear logs

npm run logs

endlocal