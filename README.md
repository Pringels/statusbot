# StatusBot
A daily status update bot for Slack.

## Requirements

- Node.js ^6.11.3
- Redis
- Firebase
- Slack

## Installation

First ensure you have created a firebase app and slack bot.
You will then need to set the following environment variables:

`SLACK_BOT_TOKEN`  
`SLACK_COMMAND_TOKEN`  

`FIREBASE_TOKEN`  
`FIREBASE_PROJECT_ID`  
`FIREBASE_SENDER_ID`  

Fursth reading:
https://api.slack.com/tokens  
https://firebase.google.com/docs/web/setup  

## Starting the server

Simply execute `npm run start` or `yarn start` to run the server for local development.
For production environments it is recommended that you use a process manager like `pm2` instead.

## Starting the client application

The client application uses `create-react-app`. 
To run it locally execute `npm run start` or `yarn start`.
For production environments it is recommended that you serve the compiled bundles directly through a web server like `nginx`.

