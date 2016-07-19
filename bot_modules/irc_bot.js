var irc = require('irc');
var config = require('./config.js');
var delegator = require('./delegator.js');

var bot;

var self = module.exports = {

	color: '\x0304,01',

	initialize: function() { 
		var bot_wrapper = this;
		bot = new irc.Client(config.irc.server, config.bot_name, {
			channels: config.irc.channels
		});

		bot.addListener('join', function(channel, who) {
			console.log(who + ' has joined ' + channel);
		});

		bot.addListener('part', function(channel, who) {
			console.log(who + ' has parted ' + channel);
		});

		bot.addListener("message", function(from, to, text, info) {
			delegator.delegate(from, to, text, info, bot_wrapper);
		});
	},

	say: function(channel, text) {
		text = this.color + ' ' + text + ' ';
		bot.say(channel, text);
	}

};
