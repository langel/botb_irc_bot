var https = require('https')
var querystring = require('querystring')

var bot = require('./irc_bot.js')
var botb_api = require('./botb_api.js')
var config = require('./config.js')
var kudos = require('./irc_kudos.js')
var memory = require('./memory.js')
var request = require('request')
var ultrachord = require('./irc_ultrachord.js')
var util = require('./util.js')

// regex to shorten battle urls
let url_regex = /^http.*\d\//i;

function battle_data_to_response(data) {
	let response = [];
	let text = '';
	data.forEach(battle => {
		text = 	battle.title + 
			` :: ${battle.entry_count} entries`    + 
			` :: ${battle.period} period deadline` +
			` ${battle.period_end_date}`           +
			` ${battle.period_end_time_left}`      +
			` :: final results ${battle.end_date}` +
			` ${battle.end_time_left}`             +
			` :: <${battle.profile_url.match(url_regex)}>`
		response.push(text)
	})
	return response
}


module.exports = {
	url_regex: url_regex,
	/**
	 *	battle
	 *
	 */
	battle: (info, words) => {
		let title = words.slice(1).join(' ')
		if (typeof title === 'undefined' || title.length < 3) {
			botb_api.request('battle/current').then(data => {
				bot.say(info.channel, battle_data_to_response(data));
			},
			error => {
				bot.say(info.channel, 'No current Battles teh running! =0');
			});
		} 
		else {
			// pagination: 0 page, limit 3
			botb_api.request('battle/search/' + title + '/0/3').then(data => {
				if (data.length == 0) throw 'garbage';
				let out = [];
				data.forEach(battle_object => {
					out.push(battle_object.title+' :: '+battle_object.profile_url.match(url_regex));
				});
				bot.say(info.channel, out.join(' $_$ '));
				return;
			}).catch(error => { bot.say(info.channel, 'Battle no found! =0')});
		}
	},

	/**
	 * blocked
	 *
	 */
	blocked: (info, words) => {
		bot.say(info.channel, 'illegal command')
	},

	/**
	 *	botbr
	 *
	 */
	botbr: (info, words) => {
		let name = words.slice(1).join(' ')
		if (typeof name === 'undefined' || name.length < 2) {
			bot.say(info.channel, 'Moar characters!! =X')
			return
		}

		botb_api.request('botbr/search/' + name).then(data => {
			if (data.length == 0) throw "No botbr search data returned!"
			let botbr
			if (data.length > 1) {
				let response
				let botbrs = []
				data.forEach(botbr_object => {
					botbrs.push(botbr_object.name)
					if (name == botbr_object.name)
						botbr = botbr_object
				})

				if (typeof botbr === 'undefined') {
					response = `Possible matches :: ${botbrs.join(', ')}`
					bot.say(info.channel, response)
					return
				}
			}

			if (data.length == 1) botbr = data[0]

			let response = `${botbr.name} :: Lvl ${botbr.level} ${botbr.class} :: ${botbr.profile_url}`
			bot.say(info.channel, response)
		}).catch(error => {
			bot.say(info.channel, 'BotBr no found! =0')
		})
	},

	/**
	 *	entry
	 *
	 */
	entry: (info, words) => {
		let title = words.slice(1).join(' ')
		let p
		if (typeof title === 'undefined' || title.length < 2) {
			p = botb_api.request(`entry/random`)
		} else {
			p = botb_api.request(`entry/search/${title}`)
		}

		p.then(data => {
			if (data.length == 0) throw "No entry data returned!"

			let entry
			if (data.length == 1) entry = data[0]
			if (data.length > 1) entry = data[Math.floor(Math.random() * data.length)]
			let response = `${entry.botbr.name} - ${entry.title} :: ${entry.profile_url}`
			bot.say(info.channel, response)
		}).catch(error => {
			bot.say(info.channel, `String "${title}" does not match entry %title%;`)
		})
	},

	/**
	 * entry_id
	 *
	 */
	entry_id: (info, words) => {
		let id = words.slice(1).join(' ');
		let p = botb_api.request(`entry/load/${id}/`);
		p.then(data => {
			bot.say(info.channel, `${data.botbr.name} -- ${data.title} :: Σ${data.score} ${data.rank}${data.rank_suffix} ${data.format_token} :: ${data.datetime} :: ${data.profile_url}`);
		}).catch(error => {
			bot.say(info.channel, `Integer "${id}" is an invalid entry id`);
		});
	},

	/**
	 *	giphy
	 *
	 */
	giphy: (info, words) => {
		bot.say(info.channel, `http://giphy.com/search/${words.slice(1).join('%20')}`)
	},

	/**
	 *	google
	 *
	 */
	google: (info, words) => {
		bot.say(info.channel, `https://encrypted.google.com/search?q=${words.slice(1).join('%20')}`)
	},

	/**
	 *	help
	 *
	 */
	help: (info, words) => {
		// define command helper texts
		let prefix = config.command_prefix
		let usage = 'Usage:'
		let command_help_text = {
			battle:     `${usage} ${prefix}battle | Returns a list of the current battles taking place.`,
			botbr:      `${usage} ${prefix}botbr <botbr> | Returns information about BotBrs whose name matched the query.`,
			entry:      `${usage} ${prefix}entry <name> | Returns information about a specific entry.`,
			google:     `${usage} ${prefix}google <query> | Returns a URL of the Google search of your query.`,
			help:       `${usage} ${prefix}help [command] | Returns a list of commands, or specific help with a command.`,
			image:      `${usage} ${prefix}image <query> | Returns a URL of the Google Images search of your query.`,
			imdb:       `${usage} ${prefix}imdb <query> | Returns a URL of the IMDB search of your query.`,
			levelup:    `${usage} ${prefix}levelup <botbr> | Returns BotBr's current level, current points, calculated points per year, estimated time to level up, estimated time to reach GRAND WIZARD STATUS of level 33, current boons, and calculated boons per year.`,
			pix:        `${usage} ${prefix}pix <botbr> | Returns a URL of a picture of the BotBr in the flesh, if one has been submitted.`,
			top:        `${usage} ${prefix}top [class] | Returns list of top BotBrs over all or by class.`,
			ultrachord: `${usage} ${prefix}ultrachord [timbre] <notes> | Returns a URL to a .wav file of the notes and timbre provided, in a format such as 'sawtooth C4 E4 Bb4 D#5'. Available notes range from C0 to B7. If number is omitted it will pick octave " + ultrachord.default_octave + ". Default timbre is sine. Available timbres are sine, sawtooth, square, triangle, and pluck.`,
			uptime:     `${usage} ${prefix}uptime | Displays how long the bot has been running.`,
			wikipedia:  `${usage} ${prefix}wikipedia <query> | Returns a URL of the Wikipedia search of your query.`,
			youtube:    `${usage} ${prefix}youtube <query> | Returns a URL of the first YouTube result for your query.`,
		}
		// general help or command helper?
		let command_help = false
		let response
		if (words.length > 1) {
			// check for alias
			command_help = bot.alias_check(words[1])
			// make sure command is defined and available
			if (!bot.command_check(info.channel_type, command_help)) {
				bot.say(info.channel, 'teh command no defined and/or availables  D:')
				return
			}
		}
		// no command defined for help
		if (command_help === false) {
			// list commands available
			bot.say(info.channel, `Available commands: ${bot.command_list(info.channel_type).join(', ')}`)
			return
		}
		// finally, give usage definition
		if (typeof command_help_text[command_help] !== 'undefined') {
			// XXX this could dynamically list and append aliases of a command
			response = command_help_text[command_help]
		} 
		else {
			response = `${command_help} has no defined help  :C`
		}
		let alias_list = bot.alias_find(command_help)
		if (alias_list.length) {
			response += ` | Aliases: ${prefix}${alias_list.join(', ' + prefix)}`
		}
		bot.say(info.channel, response)
	},
	
	/**
	 *	image
	 *
	 */
	image: (info, words) => {
		bot.say(info.channel, `https://www.google.com/search?tbm=isch&q=${words.slice(1).join('%20')}`)
	},
	
	/**
	 *	imdb
	 *
	 */
	imdb: (info, words) => {
		bot.say(info.channel, `http://www.imdb.com/find?s=all&q=${words.slice(1).join('%20')}`)
	},

	/**
	 *	imgur
	 *
	 */
	imgur: (info, words) => {
		bot.say(info.channel, `http://imgur.com/search?q=${words.slice(1).join('%20')}`)
	},

	/**
	 *	kudos info
	 *
	 */
	kudos: (info, words) => {
		bot.say(info.channel, kudos.info(words))
	},

	/**
	 *	kudos minus
	 *
	 */
	kudos_minus: (info, words) => {
		bot.say(info.channel, kudos.minus(words))
	},

	/**
	 *	kudos plus
	 *
	 */
	kudos_plus: (info, words) => {
		bot.say(info.channel, kudos.plus(words))
	},

	/**
	 *	levelup
	 *
	 */
	levelup: (info, words) => {
		// point array for levels (indexes) 0-34.
		let points_array = [
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
		]

		// == Target Response ==
		// Points: 55306 - Level: 26 - Points per year: 23139 - 
		// Next level ETA: 0 years 0 months 11 days - 
		// for Level 33: 43 years 5 months 4 days - Boons: 6265 , Boons per year: 2621
		// ==================
		let username = words.length > 2 ? words.slice(1).join(' ') : words[1]
		// Get a list of botbrs using the API.
		botb_api.request(`botbr/list?filters=name~${username}`).then(data => {
			let botbr  = data[0]
			let level  = parseFloat(botbr.level)
			let points = parseFloat(botbr.points)
			let boons  = parseFloat(botbr.boons)
			// get the current date and the date of the botbr's creation.
			let ms_current = new Date().getTime()
			let ms_botbr_creation = new Date(botbr.create_date).getTime()
			let ms_per_day = 1 * 24 * 60 * 60 * 1000
			//               day hr   min  sec  milli
			let botbr_days_existing = (ms_current - ms_botbr_creation) / ms_per_day // in days
			let points_per_day = points / botbr_days_existing
			let boons_per_day = boons / botbr_days_existing
			let days_until_levelup = (points_array[level + 1] - points) / points_per_day
			let days_until_level33 = (points_array[33] - points) / points_per_day
			let levelup = util.days_to_fulldate(days_until_levelup)
			let level33 = util.days_to_fulldate(days_until_level33)
			let response = 	`Points: ${points} - Level: ${botbr.level}` +
				` - Points per year: ${Math.round(points_per_day * 365)}` +
				` - Next level ETA: ${levelup} - for Level 33: ${level33}` +
				` - Boons: ${boons}, Boons per year: ${Math.round(boons_per_day * 365)}`
			bot.say(info.channel, response)
		}, error => {
			bot.say(info.channel, "BotBr unfound!  :O")
		})
	},
	
	/**
	 * lyceum
	 *
	 */
	lyceum: (info, words) => {
		let title = words.slice(1).join(' ')
		if (typeof title === 'undefined' || title.length < 3) {
			bot.say(info.channel, "https://battleofthebits.org/lyceum/");
			return
		}

		botb_api.request(`lyceum_article/search/${title}`).then(data => {
			if (data.length == 0) throw "No lyceum data returned!"

			let article
			if (data.length > 1) {
				let response
				let articles = []
				data.forEach(article_object => {
					articles.push(article_object.title)
					if (title == article_object.title) {
						article = article_object
					}
				})

				if (typeof article === 'undefined') {
					response = `Possible matches :: ${articles.join(', ')}`
					bot.say(info.channel, response)
					return
				}
			}

			if (data.length == 1) article = data[0]
			let response = `${article.title} :: ${article.profile_url}`
			bot.say(info.channel, response)
		}).catch(error => {
			bot.say(info.channel, 'Article no found! =0')
		})
	},

	ohb: (info, words) => {
		botb_api.request('battle/current').then(data => {
			data = data.filter(battle => parseInt(battle.type) === 3)
			if (data.length === 0) throw "No ohb data returned!"
			data.forEach(battle => {
				let ohb_info = "OHB \"" + battle.title + "\" :: ";
				if (battle.period == 'warmup') ohb_info += "Starting in: " + battle.period_end_time_left;
				if (battle.period == 'entry') ohb_info += "Time left: " + battle.period_end_time_left;
				if (battle.period == 'vote') ohb_info += "Vorting Tiem";
				ohb_info += " :: Format: " + battle.format_tokens[0];
				ohb_info += " :: <" + battle.profile_url.match(url_regex) + "> ";
				bot.say(info.channel, ohb_info);
			})
		}).catch( error => {
			bot.say(info.channel, 'We ALL love OHBs, but none is currently runningz :)))))))')
			console.log(error)
		})
	},

	/**
	 *	top
	 *
	 */
	top: (info, words) => {
		let filter = words.slice(1).join(' ')
		let p
		if (typeof filter === 'undefined' || filter.length < 2) {
			p = botb_api.request(`botbr/list/0/5?sort=points&desc=true`)
		} else {
			p = botb_api.request(`botbr/list/0/5?filters=class~${filter}&sort=points&desc=true`)
		}

		let response = ''
		return p.then(data => {
				if (data.length == 0) throw "No top botbr data returned!"
				let botbrs = []
				let esc = '\x03'
				for (datum in data) {
					if (response !== '') response += ', '
					response += esc
					response += 
						datum==0 ? "08,01" :
						datum==1 ? "15,01" :
						datum==2 ? "07,01" : "04,01"
					response += `${data[datum].name} :: Lvl ${data[datum].level}`
					if (typeof filter === 'undefined' || filter.length < 2)
						response += ` ${data[datum].class}`
				}
				if (response === '') {
					throw `No botbrs are class ${filter} U:`
				}	else {
					bot.say(info.channel, response)
				}
			}, error => {
				bot.say(info.channel, "Couldn't find anything! Did you spell the class right?")
			})
	},
	
	/**
	 *	pix
	 *
	 */
	pix: (info, words) => {
		let botbr = words.slice(1).join(" ")
		let picurl
		let esc = '\x03'
		if (botbr === "") {
			bot.say(info.channel, `${esc}00,03 Pox of whose???? ${esc}04,01`)
			return
		}

		let fs = require('fs')
		let response
		return new Promise((resolve, reject) => {
			fs.readFile("pix.json", "utf-8", (err, data) => {
				if (err) {
					console.log(err)
					bot.say(info.channel, `${esc}00,03 No read pix JSON! )): ${esc}04,01`)
				} else {
					console.log("The file was read!")
					JSON.parse(data, (k, v) => {
						if (k.toLowerCase() === botbr.toLowerCase()) {
							picurl = v
							botbr = k
						}
					})
					if (picurl) {
						bot.say(info.channel, `${esc}00,03 Pixies of ${botbr}: ${picurl} ${esc}04,01`)
					} else {
						bot.say(info.channel, `${esc}00,03 BotBr not pixelated! ${esc}04,01`)
					}
				}
			})
		})
	},
  
	/**
	 *  roll
	 *
	 */
	roll: (info, words) => {
	 let dice_notation = words.slice(1).join(" ").toLowerCase();
	  if (dice_notation.includes("d")) {
	   if (dice_notation == "") dice_notation = "1d10";
	        
	   if (dice_notation.startsWith("d")) {dice_notation = "1" + dice_notation; var dice_amount = 1}
	   else {var dice_amount = parseInt(dice_notation.split("d")[0])};
	        
	   let sum = 0;
	        
	   var dice_amount_length = dice_amount.toString().length + 1;
	        
	   if (dice_notation.includes("+")) {
	    let add_to_sum = dice_notation.split("+")[1];
	            
	    if (add_to_sum.includes("d")) {
	     if (add_to_sum.startsWith("d")) add_to_sum = "1" + add_to_sum;
	     let subdice_amount = parseInt(add_to_sum.split("d")[0]);;
	     let subnumber_limit = parseInt(add_to_sum.split("d")[1]);
	     for (let i = 0; i < subdice_amount; i++) {sum += Math.floor(Math.random() * subnumber_limit) + 1};
	    }
	    else {
	     sum += parseInt(add_to_sum);
	    };
	            
	    var number_limit = parseInt(dice_notation.split("+")[0].slice(dice_amount_length));
	   }
	   else if (dice_notation.includes("-")) {
	    let subtract_to_sum = dice_notation.split("-")[1];
	            
	    if (subtract_to_sum.includes("d")) {
	     if (subtract_to_sum.startsWith("d")) subtract_to_sum = "1" + subtract_to_sum;
	     let subdice_amount = parseInt(subtract_to_sum.split("d")[0]);
	     let subnumber_limit = parseInt(subtract_to_sum.split("d")[1]);
	     for (let i = 0; i < subdice_amount; i++) {sum -= Math.floor(Math.random() * subnumber_limit) + 1};
	    }
	    else {
	     sum += parseInt(subtract_to_sum);
	    };
	            
	    var number_limit = parseInt(dice_notation.split("-")[0].slice(dice_amount_length));
	   }
	   else {
	    var number_limit = parseInt(dice_notation.slice(dice_amount_length));
	   };
	        
	   for (let i = 0; i < dice_amount; i++) {sum += Math.floor(Math.random() * number_limit) + 1};
	   var chat_text = `${info.from} rolls ` + sum + "!";
	  }
	  else {
		 if (dice_notation == "") dice_notation = "10";
	    var chat_text = `${info.from} rolls ` + (Math.floor(Math.random() * parseInt(dice_notation)) + 1) + "!";
	   };
	    
	 bot.say(info.channel, `${chat_text}`);
	},

	/**
	 *	ultrachord
	 *
	 */
	ultrachord: (info, words) => {
		let chat_text = ultrachord.ultrachord(words)
		if (chat_text) bot.say(info.channel, `${chat_text}`)
	},

	/**
	 *	unknown
	 *
	 */
	unknown: (info, words) => {
		console.log(`${info.from} unknown command`)
		bot.say(info.channel, `you are in need of ${info.command_prefix}help`)
	},

	/**
	 *	update_ip
	 *
	 */
	update_ip: (info, word) => {
		// get public facing ip from free service
		request('http://ipinfo.io/ip', (error, response, body) => {
			let host_domain = `${body.trim()}:${config.http.port}`
			memory.set('host_domain', host_domain)
			console.log(`host domain ${host_domain} saved to memory`)
			let request_uri = `irc_bot/update_ip/${config.botb_api_key}/${host_domain}.json`
			botb_api.request(request_uri).then(data => {
				console.log('battleofthebits.org response:')
				console.log(data)
				bot.say(info.channel, 'irc bot host domain updated')
			}, error => {
				let response = 'battleofthebits.org domain update error'
				console.log(response)
				bot.say(info.channel, response)
			})
		})
	},

	/**
	 *	uptime
	 *
	 */
	uptime: (info, words) => {
		let uptime = util.seconds_string(process.uptime())
		bot.say(info.channel, `${config.bot_name} has been running for ${uptime}`)
	},
	
	/**
	 *	wikipedia
	 *
	 */
	wikipedia: (info, words) => {
		bot.say(info.channel, `https://en.wikipedia.org/w/index.php?search=${words.slice(1).join('%20')}`)
	},

	/**
	 *	youtube
	 *
	 */
	youtube: (info, words) => {
		// make a request to the youtube API requesting the first video
		// matching a search query, using jangler's API key
		let req_url = 'https://www.googleapis.com/youtube/v3/search?key=' +
			'AIzaSyDR5xOXOViVLMUyWWJM1iQefTaRiKkJfqs&part=id&maxResults=1&q=' +
			querystring.escape(words.slice(1).join(' ')) + '&type=video'
		https.request(req_url, resp => {
			resp.on('data', data => {
				// parse API response and give video URL (if video exists)
				let results = JSON.parse(data)
				try {
					bot.say(info.channel, `https://youtu.be/${results['items'][0]['id']['videoId']}`)
				} 
				catch(e) {
					bot.say(info.channel, 'no youtorb results U:')
				}
			})
		}).end()
	},

}
