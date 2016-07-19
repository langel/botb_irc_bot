var irc = require('irc');
var config = require('./bot_modules/config.js');
var command_input = require('./bot_modules/delegator.js');


var bot = new irc.Client(config.irc.server, config.bot_name, {
	channels: config.irc.channels
});


bot.addListener('join', function(channel, who) {
	console.log(who + ' has joined ' + channel);
});


bot.addListener('part', function(channel, who) {
	console.log(who + ' has parted ' + channel);
});


bot.addListener("message", function(from, to, text, info) {
	command_input.delegate(from, to, text, info, bot);
});