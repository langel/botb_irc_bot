var irc = require('irc');

var private_chat = require('./bot_modules/private.js');
var main_chat = require('./bot_modules/main.js');


var config = {
	channels: ['#botb_bot_test'],
	server: 'irc.esper.net',
	bot_name: 'BotB2',
	autoRejoin: true,
	debug: true,
};

// XXX will most likely be '!' when released
var command_prefix = ';';


var bot = new irc.Client(config.server, config.bot_name, {
	channels: config.channels
});



bot.addListener('join', function(channel, who) {
	console.log(who + ' has joined ' + channel);
});


bot.addListener('part', function(channel, who) {
	console.log(who + ' has parted ' + channel);
});



bot.addListener("message", function(from, to, text, info) {

	// break text into words
	var words = text.split(' ').filter(e => e !== '');

	// check if it is a PM
	if (to === config.bot_name) {
		console.log('PM <' + from + '> ' + text);

		// call private chat command
		if (typeof private_chat[words[0]] === "function") {
			private_chat[words[0]](bot, from, words);
		}
		// call default unknown command
		else private_chat.unknown(bot, from);
	}

	// public chats
	else if (config.channels.indexOf(to) != -1) {
		console.log(to + ' <' + from + '> ' + text);

		// check for command prefix
		if (words[0].substr(0,1) !== command_prefix) {
			return false;
		}
		// remove command prefix
		words[0] = words[0].substr(1);
		// call main chat command
		if (typeof main_chat[words[0]] === "function") {
			main_chat[words[0]](bot, info, words);
		}
	}
});
