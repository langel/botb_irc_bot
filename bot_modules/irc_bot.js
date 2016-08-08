var irc = require('irc');
var config = require('./config.js');

var bot;
var commands;

var channel_blocks = {
	private_chat: {
		blocked: false,
		ultrachord: false,
	},
	main_chat: {
		blocked: false,
		// XXX merge these into identify
		botbrname: false,
		botbrpass: false,
		botbrsync: false,
		update_ip: false,
	}
};

var commands_aliases = {
	b: 'battle',
	chord: 'ultrachord',
	compo: 'battle',
	g: 'google',
	gi: 'image',
	gif: 'giphy',
	h: 'help',
	i: 'imdb',
	images: 'image',
	img: 'imgur',
	imgr: 'imgur',
	l: 'lyceum',
	ohb: 'battle',
	ohc: 'battle',
	pic: 'pix',
	uc: 'ultrachord',
	up: 'uptime',
	w: 'wikipedia',
	wiki: 'wikipedia',
	y: 'youtube',
	yt: 'youtube',
};

var commands_alias_filters = {
	'kudos_minus': /^(.+)\-{2}$/i,
	'kudos_plus': /^(.+)\+{2}$/i,
};

var color = '\x0304,01';


alias_check = function(command) {
	if (typeof commands_aliases[command] !== 'undefined') {
		command = commands_aliases[command];
	}
	return command;
};

command_check = function(channel, command) {
	if (channel_blocks[channel][command] === false) {
		return false;
	}
	if (typeof commands[command] === 'undefined') {
		return false;
	}
	return true;
};

command_parser = function(from, to, text, info) {

	var command = '';

	// break text into words
	var words = text.split(' ').filter(e => e !== '');

	// supplement info
	info.from = from;
	info.command_prefix = config.command_prefix;
	info.words = words;
	
	// interpret solicitor
	var channel;
	if (to === config.bot_name) {
		console.log('PM <' + from + '> ' + text);
		channel = 'private_chat';
		info.channel = from;
		info.channel_type = channel;
	} 
	else if (config.irc.channels.indexOf(to) != -1) {
		console.log(to + ' <' + from + '> ' + text);
		channel = 'main_chat';
		info.channel = info.args[0];
		info.channel_type = channel;
	}

	// check alias filters (command override)
	for (var key in commands_alias_filters) {
		filter = commands_alias_filters[key];
		if (filter.test(text)) {
			commands[key](info, words);
			return;
		}
	};

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
	command = alias_check(command);

	// check channel's blocked commands
	if (command_check(channel, command) === false) {
		commands.blocked(info, words);
		console.log('"' + command + '" in #' + channel + ' blocked');
		return false;
	}

	// check for command and call
	if (typeof commands[command] === "function") {
		var response = commands[command](info, words);
	}
};


module.exports = {

	alias_check: function(command) {
		return alias_check(command);
	},

	command_check: function(command, channel) {
		return command_check(command, channel);
	},

	initialize: function() {
		bot = new irc.Client(config.irc.server, config.bot_name, {
			channels: config.irc.channels
		});

		//commands.init(this);
		commands = require('./irc_commands.js');


		bot.addListener('join', function(channel, who) {
			console.log(who + ' has joined ' + channel);
		});

		bot.addListener('part', function(channel, who) {
			console.log(who + ' has parted ' + channel);
		});

		bot.addListener('quit', function(channel, who) {
			console.log(who + ' has quit ' + channel);
		});

		bot.addListener('message', function(from, to, text, info) {
			command_parser(from, to, text, info);
		});
	},

	say: function(channel, text) {
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
	}
}
