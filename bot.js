var irc = require('irc');
var curl = require('curl');

var private_chat = require('./commands/private.js');

var config = {
	channels: ['#botb_bot_test'],
	server: 'irc.esper.net',
	bot_name: 'BotB2',
	autoRejoin: true,
	debug: true,
};

var bot = new irc.Client(config.server, config.bot_name, {
	channels: config.channels
});

bot.addListener('join', function(channel, who) {
	console.log(who + ' has joined ' + channel);
});

bot.addListener('part', function(channel, who) {
	console.log(who + ' has parted ' + channel);
});

bot.addListener("message", function(from, to, text, message) {
	// check if it is a PM
	if (to === config.bot_name) {
		console.log('PRIVATE_MESSAGE');
		private_chat.delegate(bot, from, text, message);
	}
	else if (config.channels.indexOf(to) != -1) {
		console.log('PUBLIC_MESSAGE in ' + to);
	}
	console.log(from + ' : ' +text);
});
