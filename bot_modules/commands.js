var botb_api = require('./botb_api.js');

module.exports = {

	aliases: {
		chord: 'ultrachord',
		g: 'google',
		gi: 'image',
		h: 'help',
		i: 'imdb',
		images: 'image',
		uc: 'ultrachord',
		w: 'wikipedia',
		wiki: 'wikipedia',
		y: 'youtube',
		yt: 'youtube',
		b: 'battle',
		ohc: 'battle',
		ohb: 'battle',
		compo: 'battle',
		up: 'uptime',
		pic: 'pix'
	},

	battle: function(bot, info, words) {
		var p = botb_api.request('battle/current');
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
				bot.say(info.channel, response);
			});

		}).catch(function(error) {
			bot.say(info.channel, 'No current Battles teh running! =0');
		});
	},

	botbr: function(bot, info, words) {
		var name = words.slice(1).join(' ');
		if (typeof name === 'undefined' || name.length < 2) {
			bot.say(info.channel, 'Moar characters!! =X');
			return;
		}

		var p = botb_api.request('botbr/search/' + name);
		var none_found = function() {
			bot.say(info.channel, 'BotBr no found! =0');
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
					bot.say(info.channel, response);
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
			bot.say(info.channel, response);
		}).catch(function(error) {
			none_found();
		});
	},

	entry: function(bot, info, words) {
		var title = words.slice(1).join(' ');
		var p;
		if (typeof title === 'undefined' || title.length < 2) {
			p = botb_api.request('entry/random');
		} else {
			p = botb_api.request('entry/search/' + title);
		}

		var none_found = function() {
			bot.say(info.channel, 'String "' + title + '" does not match entry %title%;');
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
			bot.say(info.channel, response);
		}).catch(function(error) {
			none_found();
		});
	},

	help: function(bot, info, words) { 
		var help = require('./commands/help.js');
		var chat_text = help.help(words, this.aliases, info.command_prefix);
		if (chat_text != null) bot.say(info.channel, info.nick + ": " + chat_text);
	},

	top: function(bot, info, words) {
		var filter = words.slice(1).join(' ');
		var p;

		if (typeof filter === 'undefined' || filter.length < 2) {
			p = botb_api.request('botbr/list/0/5?sort=points&desc=true');
		} else {
			p = botb_api.request('botbr/list/0/5?filters=class~' + filter + '&sort=points&desc=true');
		}

		var none_found = function() {
			bot.say(info.channel, "Couldn't find anything! Did you spell the class right?");
		}

		p.then(function(data) {
			if (data.length == 0) {
				none_found();
				return;
			}

			var response = '';
			var botbrs = [];

			var i = 1;
			data.forEach(function(botbr_object) {
				if (response !== '') {
					response += ', ';
				}

				if (i === 1) {
					response += "08"
				} else if (i === 2) {
					response += "15"
				} else if (i === 3) {
					response += "05"
				} else {
					response += ""
				}

				response += botbr_object.name;
				response += ' :: ';
				response += 'Lvl ' + botbr_object.level;
				if (typeof filter === 'undefined' || filter.length < 2) {
					response += ' ' + botbr_object.class;
				}
				i++;
				response += ""
			});

			if (response === '') {
				none_found();
			} else {
				bot.say(info.channel, response);
			}
		}).catch(function(error) {
			none_found();
		});
	},

	uptime: function(bot, info, words) {
		String.prototype.toHHMMSS = function() {
			var sec_num = parseInt(this, 10); // don't forget the second param
			var hours = Math.floor(sec_num / 3600);
			var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			var seconds = sec_num - (hours * 3600) - (minutes * 60);

			// if (hours   < 10) {hours   = "0" + hours;}
			// if (minutes < 10) {minutes = "0" + minutes;}
			// if (seconds < 10) {seconds = "0" + seconds;}
			var time = hours + ' hours, ' + minutes + ' minutes, and ' + seconds + " seconds.";
			return time;
		}

		var time = process.uptime();
		var uptime = (time + "").toHHMMSS();

		bot.say(info.channel, "BotB has been running for " + uptime);
	},

	unknown: function(bot, info, words) {
		console.log(info.from + ' unknown command');
		bot.say(info.channel, 'you are in need of ' + info.command_prefix + 'help');
	},

	/// web commands

	google: function(bot, info, words) {
		bot.say(info.channel, "https://encrypted.google.com/search?q=" + words.slice(1).join('%20'));
	},

	image: function(bot, info, words) {
		bot.say(info.channel, "https://www.google.com/search?tbm=isch&q=" + words.slice(1).join('%20'));
	},

	wikipedia: function(bot, info, words) {
		bot.say(info.channel, "https://en.wikipedia.org/w/index.php?search=" + words.slice(1).join('%20'));
	},

	imdb: function(bot, info, words) {
		bot.say(info.channel, "http://www.imdb.com/find?s=all&q=" + words.slice(1).join('%20'));
	},

	youtube: function(bot, info, words) {
		bot.say(info.channel, "https://www.youtube.com/results?search_query=" + words.slice(1).join('%20'))
	},

	ultrachord: function(bot, info, words) {
		var ultrachord = require('./commands/ultrachord.js');
		var chat_text = ultrachord.ultrachord(words);
		if (chat_text != null) bot.say(info.channel, info.nick + ": " + chat_text);
	},

	levelup: function(bot, info, words) { // TODO

	},

	pix: function(bot, info, words) { // TODO

	}
};
