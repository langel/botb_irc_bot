var bot = require('./bot_modules/irc_bot.js');
bot.initialize();

var server = require('./bot_modules/http_server.js');
server.intialize(bot);
