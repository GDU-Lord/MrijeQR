# MrijeQR 

Telegram Bot for creating and verifying tickets with QR-codes and Google Sheets API v4

## Deployment

1) Generate the correct Google API json key [INSTRUCTION](https://medium.com/@sakkeerhussainp/google-sheet-as-your-database-for-node-js-backend-a79fc5a6edd9)
2) Setup the .env file (according to the comments in .env.example)
3) Install the modules `npm i`
4) Compile TypeScript `tsc`
5) Run the bot with `node .` or use the **pm2** daemoniser

## Usage

### Admin

1) Follow the link https://t.me/BOT_NAME?start=ADMIN_KEY to be authorized to check the tickets
2) Scan the ticket with your phone and await a response from the bot

No log-out option provided, just restart the bot whenever you need it

### User

1) Follow the link https://t.me/BOT_NAME?start=__get__ to get your ticket (this will only work if the user's Telegram-Username is in the correct field of the table). If needed - press "START" and await a response
2) Receive the ticket with the QR-Code from the bot
3) Show it to the admin


