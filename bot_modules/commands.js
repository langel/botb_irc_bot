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


	help: function(bot, info, words) { 
		// setup requested command helper
		var command_help = words[1];
		if (typeof this.aliases[command_help] !== 'undefined') {
			command_help = this.aliases[command_help];
		}
		// default message with no command helper defined
		if (command_help == null) { // general help
			// XXX this could dynamically list commands available in channel
			bot.say(info.channel, "Available commands are: battle, levelup, pix, google, youtube, wiki, image, imdb, botbr, entry, ultrachord, uptime, help");
			return;
		}
		// define command helper texts
		var prefix = info.command_prefix;
		var command_help_text = {
			battle: "Usage:" + prefix + "battle | Aliases:" + prefix + "compo," + prefix + "b | Returns a list of the current battles taking place.",
			botbr: "Usage:" + prefix + "botbr <botbr> | Returns information about BotBrs whose name matched the query.",
			entry: "Usage:" + prefix + "entry <name> | Returns information about a specific entry.",
			google: "Usage: " + prefix + "google <query> | Aliases: !g | Returns a URL of the Google search of your query.",
			help: "Usage: " + prefix + "help [command] | Aliases: !h | Returns a list of commands, or specific help with a command.",
			image: "Usage:" + prefix + "image <query> | Aliases:" + prefix + "gi," + prefix + "images | Returns a URL of the Google Images search of your query.",
			imdb: "Usage: " + prefix + "imdb <query> | Aliases: !i | Returns a URL of the IMDB search of your query.",
			levelup: "Usage: " + prefix + "levelup <botbr> | Returns BotBr's current level, current points, calculated points per year, estimated time to level up, estimated time to reach GRAND WIZARD STATUS of level 33, current boons, and calculated boons per year.",
			pix: "Usage: " + prefix + "pix <botbr> | Aliases: !pic | Returns a URL of a picture of the BotBr in the flesh, if one has been submitted.",
			ultrachord: "Usage: " + prefix + "ultrachord <notes> [timbre] | Aliases:" + prefix + "uc," + prefix + "chord | Returns a URL to a .wav file of the notes and timbre provided, in a format such as 'C4 E4 G4 sawtooth'. Available notes range from C0 to B7. If number is omitted it will pick octave 2. Default timbre is sine. Available timbres are sine, sawtooth, square, triangle, and pluck.",
			uptime: "Usage: " + prefix + "uptime | Aliases: !up | Displays how long the bot has been running.",
			wikipedia: "Usage:" + prefix + "wikipedia <query> | Aliases:" + prefix + "wiki," + prefix + "w | Returns a URL of the Wikipedia search of your query.",
			youtube: "Usage:" + prefix + "youtube <query> | Aliases:" + prefix + "yt," + prefix + "y | Returns a URL of the YouTube search of your query.",
		};
		// return command helper text
		if (typeof command_help_text[command_help] !== 'undefined') {
			// XXX this could dynamically list and append aliases of a command
			bot.say(info.channel, command_help_text[command_help]);
		}
		// unknown commands!! D:
		else {
			bot.say(info.channel, "Unknown command!");
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


	ultrachord: function(bot, info, words) {
		const execSync = require('child_process').execSync;

		function makeid() {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for(var i = 0; i < 16; i++) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			return text;
		}

		function getFrequency(octave, note) {
			// 1.059463094359 == 2^12, used for note frequency calculation!
			var base_note = 10;  // A
			var base_octave = 4; // 4
			var note_distance = ((octave * 12) + note) - ((base_octave * 12) + base_note);
			// 440hz == A4
			var frequency = 440 * Math.pow(1.059463094359, note_distance);
			return frequency.toFixed(4);
		}

		var id = makeid();

		// extra flats and sharps for the musical butts out there
		var note_names = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'
				,'c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'
				,'b#', 'c#', 'd', 'd#', 'e', 'e#', 'f#', 'g', 'g#', 'a', 'a#', 'b'
				,'c', 'db', 'd', 'eb', 'fb', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'cb' ];
		var timbres = ['pluck', 'square', 'triangle', 'sawtooth', 'sine'];
		var timbre = timbres[2]; // square wave because chiptune dumbo
		var notes = [];

		words.slice(1).forEach(function(word, i) {
			// toLowerCase to make life easier!
			var param = word.toLowerCase();
			if (timbres.indexOf(param) !== -1) {
				timbre = param;
			}

			// If the last character is an integer, that means it's an octave
			// paramater, and will need to be seperated from the full note notation. 
			var possible_note;
			var possible_octave;
			if (Number.isInteger(parseInt(word.charAt(word.length-1), 10))) {
				possible_note = word.substr(0, word.length-1);
				possible_octave = parseInt(word.charAt(word.length-1), 10);
			} else {
				possible_note = word;
				possible_octave = 4;
			}

			// check if the possible note is located in the array. If so, then we use its
			// offset in the array to calculate it's note value (0-11)
			if (note_names.indexOf(possible_note) !== -1) {
				// MOD 12 for easy math. Array abuse ftw \o/
				var note_val = note_names.indexOf(possible_note)%12;
				console.log("OCTAVE: " + possible_octave + " | NOTE: " + note_val);
				// uses the helper function getFrequency that uses math to calculate
				// the frequency of the note given it's octave and value
				notes.push(getFrequency(possible_octave, note_val));
			}
		});
		console.log(notes);

		// create the synth, convert to mp3, upload to uguu.se
		// (LINUX ONLY!! O: eat it windows nerds)
		execSync('sox -n ' + id + '.wav synth 5 '
				+ timbre + ' ' + notes.join(" " + timbre + " ")
				+ " remix 1-");
		execSync('lame -V2 ' + id + '.wav ' + id + '.mp3' );
		var upload = execSync('curl -i -F file=@' + id + '.mp3 https://uguu.se/api.php?d=upload-tool');
		execSync('rm ' + id + '.mp3 ' + id + '.wav'); 

		var link = upload.toString().split(/\r?\n/);
		bot.say(info.channel, info.nick + ': ' + link[link.length - 1]);
	},


	levelup: function(bot, info, words) { // TODO

	},

	pix: function(bot, info, words) { // TODO

	}
};
