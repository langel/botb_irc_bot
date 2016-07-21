/*
	load all servies and initialize
*/

var services = {
	http_server: require('./http_server.js'),
	irc_bot: require('./irc_bot.js'),
	memory: require('./memory'),
};

module.exports = {

	initialize: function() {
		for (var service_key in services) {
			console.log('Initializing Module : ' + service_key);
			services[service_key].initialize();
		};
	},

};