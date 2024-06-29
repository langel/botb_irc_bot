# BotB IRC bot
All that instant relay chat magic.

# Getting Started
Runs on node version 6+ (due to heavy es6 usage) and Linux/Mac (or Windows w/ Cygwin due to execSync usage). For dev you'll need to change the bot's IRC nick.

To install the prerequisites:

``npm install``

You also need the LAME, SoX, and curl packages. On Ubuntu/Debian, you can use the following command:

``apt-get install lame sox curl``

Last tested to work on node v12.x!

# Configuration
Copy bot_modules/config_example.js to bot_modules/config.js and edit as you deem necessary.

# Contributing
ES6 with semicolons please ;)

`npm run lint` before you commit
`npm run lint:fix` will attempt autofixings
