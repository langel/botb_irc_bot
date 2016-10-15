# BotB IRC bot
All that instant relay chat magic.

# Getting Started
Runs on node version 6+ (due to heavy es6 usage) and Linux/Mac (or Windows w/ Cygwin due to execSync usage). For dev you'll need to change the bot's IRC nick.

To install the prerequisites:

``npm install``

You also need the LAME, SoX, and curl packages. On Ubuntu/Debian, you can use the following command:

``apt-get install lame sox curl``

# Configuration
Copy bot_modules/config_example.js to bot_modules/config.js and edit as you deem necessary.

# Contributing
Keep in mind ES6 standards when developing to keep things consistent.

Read up on the features here --> http://es6-features.org
