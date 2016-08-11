/*
	load all servies and initialize
*/

var fs = require('fs');

var services = [
	'http_server',
	'irc_bot',
	'memory'
];


module.exports = {

	initialize: function() {
		// check that bot_modules/config.js is setup
		try {
			fs.lstatSync('bot_modules/config.js', fs.F_OK);
			console.log('config.js found');
			// XXX also need to check all parameters are defined
			// in the case of config structure updates
		}
		catch(e) {
			console.log('config.js missing from bot_modules/');
			console.log('copy from bot_modules/config_example.js and edit appropriately');
			process.exit(1);
		}

		// initialize services
		services.forEach(function(service) {
			var module = require('./' + service + '.js');
			module.initialize();
		});
	},

};
