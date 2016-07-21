var botb_api = require('./botb_api.js');

module.exports = {

	aliases: {
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
		ohb: 'battle',
		ohc: 'battle',
		pic: 'pix',
		uc: 'ultrachord',
		up: 'uptime',
		w: 'wikipedia',
		wiki: 'wikipedia',
		y: 'youtube',
		yt: 'youtube',
	},
	
	/// web shortcut commands

	giphy: function(bot, info, words) {
		bot.say(info.channel, "http://giphy.com/search/" + words.slice(1).join('%20'));
	},

	google: function(bot, info, words) {
		bot.say(info.channel, "https://encrypted.google.com/search?q=" + words.slice(1).join('%20'));
	},

	image: function(bot, info, words) {
		bot.say(info.channel, "https://www.google.com/search?tbm=isch&q=" + words.slice(1).join('%20'));
	},

	imgur: function(bot, info, words) {
		bot.say(info.channel, "http://imgur.com/search?q=" + words.slice(1).join('%20'));
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

	/// bot commands
	
	levelup: function(bot, info, words) {
		// point array for levels (indexes) 0-34.
		var points_array = [
			25,
			34,
			41,
			53,
			73,
			109,
			173,
			284,
			477,
			816,
			1280,
			1922,
			2682,
			3478,
			4331,
			5421,
			6500,
			7677,
			8972,
			10266,
			11677,
			13796,
			16856,
			21799,
			28640,
			36512,
			45596,
			56049,
			72335,
			92645,
			118353,
			245792,
			510494,
			1060247,
			99999999
		];

		// This function is a helper to the main levelup function.
		// it takes a floating point number which represents the number
		// of days ahead of right now. It outputs a string formatted:
		//     x years x months x days
		// Due to the way it's calculated, it takes month lengths, leap years,
		// hell even leap seconds into account. All thanks to Javascript Date.
		function ymd_distance(days) {
			// this is used to convert days into milliseconds for the Date constructor
			var milliseconds_per_day = 24 * 60 * 60 * 1000;
			var current_date = new Date(Date.now());
			var future_date = new Date(Math.round(
				// (ms / d) * d = ms
				current_date.getTime() + (milliseconds_per_day*days)
			));
			// Calculate how many years ahead the future date is.
			// Notice: this can be inaccurate! Example: dec 25th 2015 and 
			//         jan 23rd 2016 would say 1 year apart! We check for
			//         this later in the code however.
			var years = future_date.getUTCFullYear() - current_date.getUTCFullYear();
			// Next we set the current date to its current date + how many years
			// we calculated!
			current_date.setUTCFullYear(current_date.getUTCFullYear() + years);
			// Calculate the number of months ahead the future date is.
			// If the month crosses over the 12th month border, the difference
			// is negative. This is checked for further in the program.
			var months = future_date.getUTCMonth() - current_date.getUTCMonth();
			// If it IS negative, we subtract the months to set the correct month. 
			current_date.setUTCMonth(current_date.getUTCMonth() + months);
			if (months < 0) {
				// if we did get a negative month number, that means we went
				// ahead one year too far earlier. Lets take it back!...
				current_date.setUTCFullYear(current_date.getUTCFullYear() - 1);
				years--;
				// ...and lets get that month out of the negatives!
				months += 12;
			}
			// Lastly, we check the days. Once again, if we cross a month threshold, we will go into the
			// negatives. This is made up for though by checking how many days are in the month at hand, 	
			// and adding that to the negative days. 
			var days = future_date.getUTCDate() - current_date.getUTCDate();			
			if (days < 0) {
				// if the days roll over into the next month...
				months--; // we were lied to earlier a la the years calculation
				current_date.setUTCMonth(current_date.getUTCMonth() - 1);
				days += new Date(current_date.getUTCFullYear(), current_date.getUTCMonth() + 1, 0).getDate();
			}
			// Only display the lowest level of day display that you can. This is to save space!
			var formatted_ymd = days + " days";
			if (years > 0) {
				formatted_ymd = years + " years " + months + " months " + formatted_ymd;
			} else if (months > 0) {
				formatted_ymd = months + " months " + formatted_ymd;
			}
			return formatted_ymd;
		}
		// == Target Response ==
		// Points: 55306 - Level: 26 - Points per year: 23139 - 
		// Next level ETA: 0 years 0 months 11 days - 
		// for Level 33: 43 years 5 months 4 days - Boons: 6265 , Boons per year: 2621
		// ==================
		var username = "";
		for (var i = 1; i < words.length; i++) username = username.concat(words[i] + ' ');
		// Get a list of botbrs using the API.
		var botbr_list = botb_api.request('botbr/list?filters=name~' + username);
		botbr_list.then(function(data) {
			var botbr  = data[0];
			var level  = parseInt(botbr.level);
			var points = parseInt(botbr.points);
			var boons  = parseFloat(botbr.boons);
			// get the current date and the date of the botbr's creation.
			var time_current = Date.now();
			var time_botbr = new Date(botbr.create_date).getTime();
			var milliseconds_per_day = 24 * 60 * 60 * 1000;
			//                         hr   mn   sec  milli
			var botbrs_age = (time_current-time_botbr) / milliseconds_per_day; // in days
			var points_per_day = points / botbrs_age;
			var boons_per_day  = boons / botbrs_age;
			var days_until_levelup = (points_array[level + 1] - points) / points_per_day;
			var days_until_level33 = (points_array[33] - points) / points_per_day;
			var levelup = ymd_distance(days_until_levelup);
			var level33 = ymd_distance(days_until_level33);
			bot.say(info.channel, "Points: " + points
				+ " - Levesl: " + botbr.level
				+ " - Points per year: " + Math.round(points_per_day * 365)
				+ " - Next level ETA: " + levelup
				+ " - for Level 33: " + level33
				+ " - Boons: " + boons + ", Boons per year: " + Math.round(boons_per_day * 365));
		});
	},

	pix: function(bot, info, words) { // TODO
		var botbr = words.slice(1).join(" ");
		var picurl;

		var fs = require('fs');

		fs.readFile("pix.json", "utf-8", function(err, data) {
			if (err) {
				return console.log(err);
				bot.say(info.channel, "00,03 Couldn't read pix JSON!04,01");
			} else {
				console.log("The file was read!");
				JSON.parse(data, function (k, v) {
					if (k.toLowerCase() === botbr.toLowerCase()) {
						picurl = v;
					}
				});
				if (picurl != null) {
					bot.say(info.channel, "00,03 Pixies of " + botbr + ": " + picurl + " 04,01");
				} else {
					bot.say(info.channel, "00,03 BotBr not pixelated! 04,01");
				}
			}
		}); 
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

			var response = '';
			var botbrs = [];

			var i = 1;
			var esc = '\x03';
			data.forEach(function(botbr_object) {
				if (response !== '') {
					response += ', ';
				}

				response += esc;
				if (i === 1) {
					response += "08,01"
				} else if (i === 2) {
					response += "15,01"
				} else if (i === 3) {
					response += "07,01"
				} else {
					response += "04,01"
				}

				response += botbr_object.name;
				response += ' :: ';
				response += 'Lvl ' + botbr_object.level;
				if (typeof filter === 'undefined' || filter.length < 2) {
					response += ' ' + botbr_object.class;
				}
				i++;
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

	ultrachord: function(bot, info, words) {
		var ultrachord = require('./commands/ultrachord.js');
		var chat_text = ultrachord.ultrachord(words);
		if (chat_text != null) bot.say(info.channel, info.nick + ": " + chat_text);
	},

	unknown: function(bot, info, words) {
		console.log(info.from + ' unknown command');
		bot.say(info.channel, 'you are in need of ' + info.command_prefix + 'help');
	},

	uptime: function(bot, info, words) {
		String.prototype.toWWDDHHMMSS = function() {
			var sec_num = parseInt(this, 10); // don't forget the second param
			var days = 0;
			var hours = Math.floor(sec_num / 3600);
			var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			var seconds = sec_num - (hours * 3600) - (minutes * 60);

			if (hours >= 24) {
				days = Math.floor(hours / 24);
				hours = hours % 24;
			}

			var time = days

			if (days == 1) {
				time += " day, "
			} else {
				time += " days, "
			}

			time += hours;
			if (hours == 1) {
				time += " hour, "
			} else {
				time += " hours, "
			}

			time += minutes;
			if (minutes == 1) {
				time += " minute, and "
			} else {
				time += " minutes, and "
			}

			time += seconds;
			if (seconds == 1) {
				time += " second. "
			} else {
				time += " seconds. "
			}
			return time;
		}

		var time = process.uptime();
		var uptime = (time + "").toWWDDHHMMSS();

		bot.say(info.channel, "BotB has been running for " + uptime);
	},

};
