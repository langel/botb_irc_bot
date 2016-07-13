module.exports = {

	delegate: function(bot, from, to, words) {
		if (typeof commands[words[0]] === "function") {
			commands[words[0]](bot, from, words);
		}
		else commands.unknown(bot, from);
	},

};


var commands = {
	unknown: function(bot, from) {
		bot.say(from, 'you are in need of help');
	},
		
	help: function(bot, from, words) {
		bot.say(from, from + ', you have found the help');
	}
};
