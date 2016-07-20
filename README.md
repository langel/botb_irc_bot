# BotB IRC bot
All that instant relay chat magic.

# getting started
Runs on node and Linux/Mac (or Windows w/ Cygwin due to execSync usage). For dev you'll need to change the bot's IRC nick.

To install the prerequisites:

``npm install irc curl``

You also need the LAME, SoX, and curl packages. On Ubuntu/Debian, you can use the following command:

``apt-get install lame sox curl``

# setup your config
Copy bot_modules/config_example.js to bot_modules/config.js and edit as you deem necessary.
