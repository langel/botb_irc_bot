module.exports = {
	help: function(words, aliases, prefix) {
		// setup requested command helper
		var command_help = words[1];
		if (typeof aliases[command_help] !== 'undefined') {
			command_help = aliases[command_help];
		}
		// default message with no command helper defined
		if (command_help == null) { // general help
			// XXX this could dynamically list commands available in channel
			return "Available commands are: battle, levelup, pix, google, youtube, wikipedia, image, imdb, botbr, entry, top, ultrachord, uptime, help";
		}
		// define command helper texts
		var command_help_text = {
			battle: "Usage: "     + prefix + "battle | Aliases: "            + prefix + "compo," + prefix + "b | Returns a list of the current battles taking place.",
			botbr: "Usage: "      + prefix + "botbr <botbr> | Returns information about BotBrs whose name matched the query.",
			entry: "Usage: "      + prefix + "entry <name> | Returns information about a specific entry.",
			google: "Usage: "     + prefix + "google <query> | Aliases: "    + prefix + "g | Returns a URL of the Google search of your query.",
			help: "Usage: "       + prefix + "help [command] | Aliases: "    + prefix + "h | Returns a list of commands, or specific help with a command.",
			image: "Usage: "      + prefix + "image <query> | Aliases: "     + prefix + "gi," + prefix + "images | Returns a URL of the Google Images search of your query.",
			imdb: "Usage: "       + prefix + "imdb <query> | Aliases: "      + prefix + "i | Returns a URL of the IMDB search of your query.",
			levelup: "Usage: "    + prefix + "levelup <botbr> | Returns BotBr's current level, current points, calculated points per year, estimated time to level up, estimated time to reach GRAND WIZARD STATUS of level 33, current boons, and calculated boons per year.",
			pix: "Usage: "        + prefix + "pix <botbr> | Aliases: "       + prefix + "pic | Returns a URL of a picture of the BotBr in the flesh, if one has been submitted.",
			top: "Usage: "        + prefix + "top [class] | Returns list of top BotBrs over all or by class.",
			ultrachord: "Usage: " + prefix + "ultrachord <notes> [timbre] | Aliases: " + prefix + "uc," + prefix + "chord | Returns a URL to a .wav file of the notes and timbre provided, in a format such as 'C4 E4 G4 sawtooth'. Available notes range from C0 to B7. If number is omitted it will pick octave 2. Default timbre is sine. Available timbres are sine, sawtooth, square, triangle, and pluck.",
			uptime: "Usage: "     + prefix + "uptime | Aliases: "            + prefix + "up | Displays how long the bot has been running.",
			wikipedia: "Usage: "  + prefix + "wikipedia <query> | Aliases: " + prefix + "wiki," + prefix + "w | Returns a URL of the Wikipedia search of your query.",
			youtube: "Usage: "    + prefix + "youtube <query> | Aliases: "   + prefix + "yt," + prefix + "y | Returns a URL of the YouTube search of your query.",
		};
		// return command helper text
		if (typeof command_help_text[command_help] !== 'undefined') {
			// XXX this could dynamically list and append aliases of a command
			return command_help_text[command_help];
		}
		else {
			return "Unknown command!";
		}
	}

};
	
