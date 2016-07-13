module.exports = {
	
	delegate: function(bot, info, words) {
		if (typeof commands[words[0]] === "function") {
			commands[words[0]](bot, info, words);
		}
	}

};

var curl = require('curl');
var botb_api_root = 'http://battleofthebits.org/api/v1/';

var botb_api_request = function(request_url) {
	return new Promise(function(resolve, reject) {
		curl.getJSON(botb_api_root + request_url, 
			{
				headers: {'User-Agent':'curl'}
			},
			function(err, response, body) {
				// XXX need error handling in here
				resolve(body);
				//callback(bot, body);
			}
		);
	});
};

var commands = {

	battle: function(bot, info, words) {
		var p = botb_api_request('battle/current');
		p.then(function(data) {
			console.log(data);
			data.forEach(function(battle) {
				var response = battle.title;
				// XXX bit period v entry period stuff
				response += ' :: ' + battle.entry_count + ' entries';
				response += ' :: ' + battle.period + ' period deadline';
				response += ' ' + battle.period_end_date;
				response += ' ' + battle.period_end_time_left;
				response += ' :: final results ' + battle.end_date;
				response += ' ' + battle.end_time_left;
				response += ' :: ' + battle.profile_url;
				bot.say(info.args[0], response);
			});
		});
	},

	botbr: function(bot, info, words) {
	},

	compo: function(bot, info, words) {
		this.battle(bot, info, words);
	},

	entry: function(bot, info, words) {
	}

};
