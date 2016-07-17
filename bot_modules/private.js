var botb_api = require('./botb_api.js');



module.exports = {


	unknown: function(bot, from) {
		bot.say(from, 'you are in need of help');
	},


	help: function(bot, from, words) {
		bot.say(from, from + ', you have found the help');
	}


};
