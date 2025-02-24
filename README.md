# GreenSauceBot
This is a personal project by Ryan Kim. It is a discord bot that can be added to your server and allows users to use the bot as a pomodoro timer with focus and break times.

## Stack
Node.js, mongodb, docker

## Setting up
Initialize .env file

1. `$ cp .env.template .env`
2. populate the variables in the .env file

Ensure podman machine is running

1. `$ podman machine start`

Run the deploy.bat (on windows only at the moment)

`$ deploy.bat`