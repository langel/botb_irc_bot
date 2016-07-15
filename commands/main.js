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
	console.log('api request : ' + request_url);
	return new Promise(function(resolve, reject) {
		curl.get(botb_api_root + request_url, 
			{
				headers: {'User-Agent':'curl'}
			},
			function(err, response, body) {
				var stat = response.statusCode;
				if (stat == '400' || stat == '500') {
					reject(response);
					return;
				}
				resolve(JSON.parse(body));
			}
		);
	});
};


var commands = {

	battle: function(bot, info, words) {
		var p = botb_api_request('battle/current');
		p.then(function(data) {
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
		}).catch(function(error) {
			bot.say(info.args[0], 'No current Battles teh running! =0');
		});
	},


	botbr: function(bot, info, words) {
		var name = words.slice(1).join(' ');
		if (typeof name === 'undefined' || name.length < 2) {
			bot.say(info.args[0], 'Moar characters!! =X');
			return;
		}
		var p = botb_api_request('botbr/search/' + name);
		var none_found = function() {
			bot.say(info.args[0], 'BotBr no found! =0');
		}
		p.then(function(data) {
			if (data.length == 0) {
				none_found();
				return;
			}
			var botbr;
			if (data.length > 1) {
				var response;
				var botbrs = [];
				data.forEach(function(botbr_object) {
					botbrs.push(botbr_object.name);
					if (name == botbr_object.name) {
						botbr = botbr_object;
					}
				});
				if (typeof botbr === 'undefined') {
					response = 'Possible matches :: ';
					response += botbrs.join(', ');
					bot.say(info.args[0], response);
					return;
				}
			}
			if (data.length == 1) {
				botbr = data[0];
			}
			var response = botbr.name;
			response += ' :: Lvl ' + botbr.level;
			response += ' ' + botbr.class;
			response += ' :: ' + botbr.profile_url;
			bot.say(info.args[0], response);
		}).catch(function(error) {
			none_found();
		});
	},


	compo: function(bot, info, words) {
		this.battle(bot, info, words);
	},


	entry: function(bot, info, words) {
		var title = words.slice(1).join(' ');
		var p;
		if (typeof title === 'undefined' || title.length < 2) {
			p = botb_api_request('entry/random');
		}
		else {
			p = botb_api_request('entry/search/' + title);
		}
		var none_found = function() {
			bot.say(info.args[0], 'String "' + title + '" does not match entry %title%;');
		}
		p.then(function(data) {
			if (data.length == 0) {
				none_found();
				return;
			}
			var entry;
			if (data.length == 1) {
				entry = data[0];
			}
			if (data.length > 1) {
				entry = data[Math.floor(Math.random() * data.length)];
			}
			var response = entry.botbr.name;
			response += ' - ' + entry.title;
			response += ' :: ' + entry.profile_url;
			bot.say(info.args[0], response);
		}).catch(function(error) {	
			none_found();
		});
	}

};
