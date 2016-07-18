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
		}
		else {
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

	
	help: function(bot, info, words) { // TODO
		if (words[1] === "uptime" || words[1] === "up") {
			bot.say(info.args[0], "Usage: !uptime | Aliases: !up | Displays how long the bot has been running.");
		} else if (words[1] === "pix" || words[1] === "pic") {
			bot.say(info.args[0], "Usage: !pix <botbr> | Aliases: !pic | Returns a URL of a picture of the BotBr in the flesh, if one has been submitted.");
		} else if (words[1] === "help" || words[1] === "h") {
			bot.say(info.args[0], "Usage: !help [command] | Aliases: !h | Returns a list of commands, or specific help with a command.");
		} else if (words[1] === "levelup" || words[1] === "h") {
			bot.say(info.args[0], "Usage: !levelup <botbr> | Returns BotBr's current level, current points, calculated points per year, estimated time to level up, estimated time to reach GRAND WIZARD STATUS of level 33, current boons, and calculated boons per year.");
		} else if (words[1] === "ultrachord" || words[1] === "uc" || words[1] === "chord") {
			bot.say(info.args[0], "Usage: !ultrachord <notes> [timbre] | Aliases: !uc, !chord | Returns a URL to a .wav file of the notes and timbre provided, in a format such as 'C4 E4 G4 sawtooth'. Available notes range from C0 to C7. If number is omitted it will pick octave 2. Default timbre is sin. Available timbres are sin, sawtooth, square, triangle, and pluck.");
		} else if (words[1] === "google" || words[1] === "g") {
			bot.say(info.args[0], "Usage: !google <query> | Aliases: !g | Returns a URL of the Google search of your query.");
		} else if (words[1] === "imdb" || words[1] === "i") {
			bot.say(info.args[0], "Usage: !imdb <query> | Aliases: !i | Returns a URL of the IMDB search of your query.");
		} else if (words[1] === "image" || words[1] === "images" || words[1] === "gi") {
			bot.say(info.args[0], "Usage: !image <query> | Aliases: !gi, !images | Returns a URL of the Google Images search of your query.");
		} else if (words[1] === "youtube" || words[1] === "yt" || words[1] === "y") {
			bot.say(info.args[0], "Usage: !youtube <query> | Aliases: !yt, !y | Returns a URL of the YouTube search of your query.");
		} else if (words[1] === "wikipedia" || words[1] === "wiki" || words[1] === "w") {
			bot.say(info.args[0], "Usage: !wikipedia <query> | Aliases: !wiki, !w | Returns a URL of the Wikipedia search of your query.");
		} else if (words[1] === "battle" || words[1] === "compo" || words[1] === "b") {
			bot.say(info.args[0], "Usage: !battle | Aliases: !compo, !b | Returns a list of the current battles taking place.");
		} else if (words[1] === "botbr") {
			bot.say(info.args[0], "Usage: !botbr <botbr> | Returns information about BotBrs whose name matched the query.");
		} else if (words[1] === "entry") {
			bot.say(info.args[0], "Usage: !entry <name> | Returns information about a specific entry.");
		} else if (words[1] == null) { // general help
			bot.say(info.args[0], "Available commands are: battle, levelup, pix, google, youtube, wiki, image, imdb, botbr, entry, ultrachord, uptime, help");
		} else {
			bot.say(info.args[0], "Unknown command!");
		}
	},


	top: function(bot, info, words) {
		var filter = words.slice(1).join(' ');
		var p;
		if (typeof filter === 'undefined' || filter.length < 2) {
			p = botb_api.request('botbr/list/0/5?sort=points&desc=true');
		}
		else {
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
			data.forEach(function(botbr_object) {
				if (response !== '') {
					response += ', ';
				}
				response += botbr_object.name;
				response += ' :: ';
				response += 'Lvl ' + botbr_object.level;
				if (typeof filter === 'undefined' || filter.length < 2) {
					response += ' ' + botbr_object.class;
				}
			});
			if (response === '') {
				none_found();
			}
			else {
				bot.say(info.channel, response);
			}
		}).catch(function(error) {
			none_found();
		});
	},


	uptime: function(bot, info, words) {
		String.prototype.toHHMMSS = function () {
			var sec_num = parseInt(this, 10); // don't forget the second param
			var hours   = Math.floor(sec_num / 3600);
			var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
			var seconds = sec_num - (hours * 3600) - (minutes * 60);

			// if (hours   < 10) {hours   = "0" + hours;}
			// if (minutes < 10) {minutes = "0" + minutes;}
			// if (seconds < 10) {seconds = "0" + seconds;}
			var time    = hours + ' hours, ' + minutes + ' minutes, and ' + seconds + " seconds.";
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


	ultrachord: function(bot, info, words) { // TODO
		const execSync = require('child_process').execSync;

		function makeid() {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for(var i = 0; i < 16; i++) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			return text;
		}

		var note_names = [
			'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b',
		];
		// var note_alias = {};  // for flats!
		var note_hertz = {
			3: ['130.8', '138.6', '146.8', '155.6', '164.8', '174.6', '185.0', '196.0', '207.7', '220.0', '233.1', '246.9'],
			4: ['261.6', '277.2', '293.7', '311.1', '329.6', '349.2', '370.0', '392.0', '415.3', '440.0', '466.2', '493.9']
		};
		var timbres = ['pluck', 'square', 'triangle', 'sawtooth', 'sin'];
		var timbre = timbres[0]

		var notes = [];
		words.forEach(function(word, i) {
			var param = word.toLowerCase();
			if (timbres.indexOf(param) !== -1) {
				timbre = param;
			}
			var possible_note = word.substr(0, word.length-1);
			var note_val;
			if (note_names.indexOf(possible_note) !== -1) {
				note_val = note_names.indexOf(possible_note);
			}
			var possible_octave = parseInt(word.substr(-1), 10);
			if (Array.isArray(note_hertz[possible_octave])) {
				notes.push(note_hertz[possible_octave][note_val]);
			};
		});

		// you probably shouldn't look at this code
		console.log(notes);
		console.log(words);

		var id = makeid();
		code = execSync('sox -n ' + id + '.wav synth 5 ' + timbre + " " + notes.join(" " + timbre + " "));
		upload = execSync('curl -i -F file=@' + id + '.wav https://uguu.se/api.php?d=upload-tool')

		var link = upload.toString().split(/\r?\n/);
		bot.say(info.channel, link[link.length - 1]);

		console.log(link);
		
		del = execSync('rm ' + id + '.wav');
		bot.say(info.channel, "toen work!")
	},


	levelup: function(bot, info, words) { // TODO

	},

	pix: function(bot, info, words) { // TODO

	}
};
