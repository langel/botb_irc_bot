var irc = require('irc');
var commands = require('./irc_commands.js');
var config = require('./config.js');

var bot;

var channel_filters = {
	private_chat: {
		ultrachord: false,
	},
	main_chat: {
		botbrname: false,
		botbrpass: false,
		botbrsync: false,
		help: false,
		unknown: false,
		update_ip: false,
	}
};

var color = '\x0304,01';

module.exports = {

	initialize: function() {
		bot = new irc.Client(config.irc.server, config.bot_name, {
			channels: config.irc.channels
		});

		commands.init(this);

		bot.addListener('join', function(channel, who) {
			console.log(who + ' has joined ' + channel);
		});

		bot.addListener('part', function(channel, who) {
			console.log(who + ' has parted ' + channel);
		});

		bot.addListener('quit', function(channel, who) {
			console.log(who + ' has quit ' + channel);
		});

		bot.addListener("message", function(from, to, text, info) {
			command_parser(from, to, text, info);
		});
	},

	say: function(channel, text) {
		say(channel, text);
	}
}

// XXX need a way to call this from command parser when it's inside exports
say = function(channel, text) {
	function irc_push(channel, text) {
		text = color + ' ' + text + color + ' ';
		bot.say(channel, text);
	}
	// is it an array?
	if (Array.isArray(text)) {
		text.forEach(function(line) {
			irc_push(channel, line);
		});
		return;
	}
	// is it just text?
	irc_push(channel, text);
};


command_parser = function(from, to, text, info) {
	// break text into words
	var words = text.split(' ').filter(e => e !== '');
	// supplement info
	info.from = from;
	info.command_prefix = config.command_prefix;
	info.words = words;
	// check for command prefix
	if (words[0].substr(0, 1) !== config.command_prefix) {
		if (to === config.bot_name) {
			// XXX something is fukt here
			if (from === config.bot_name) {
				console.log('STOP MESSAGING YERSELF!!');
				return false;
			}

			info.channel = from;
			commands.unknown(info, words);
		}

		return false;
	}

	// remove command prefix
	var command = words[0].substr(1);

	// check if the command is an alias
	if (typeof commands.aliases[command] !== 'undefined') {
		command = commands.aliases[command];
	}

	// check channel filter
	var channel;
	if (to === config.bot_name) {
		console.log('PM <' + from + '> ' + text);
		channel = 'private_chat';
		info.channel = from;
	} else if (config.irc.channels.indexOf(to) != -1) {
		console.log(to + ' <' + from + '> ' + text);
		channel = 'main_chat';
		info.channel = info.args[0];
	}

	if (typeof channel_filters[channel][command] === 'false') {
		console.log('command false');
		return false;
	}

	// check for command and call
	if (typeof commands[command] === "function") {
		var response = commands[command](info, words);
		// is it a promise?
		if (typeof response.then === 'function') {
			response.then(function(string) {
				say(info.channel, string);
			});
		} 
		// is it something else?
		else {
			say(info.channel, response);
		}
	}
};

