#!/bin/bash
sudo docker run -p 3000:3000 -v ~/botb_irc_bot/bot_modules:/usr/src/app/bot_modules -v ~/botb_irc_bot/memory.json:/usr/src/app/memory.json botb-irc-bot
