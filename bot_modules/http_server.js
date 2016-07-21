var config = require('./config.js');
var ram = require('./memory.js');
var http = require('http');
var bot = require('./irc_bot.js');


var commands = {

	say: function(message) {
		bot.say(config.irc.channels[0], message);
		respond(response, 200, 'text/plain', 'the bot speaks!');
	},

};

var post_handler = function(request, response) {
	return new Promise(function(resolve, reject) {
		var post_data = '';
		request.on('data', function(data) {
			post_data += data;
			if (post_data.length > 1e6) {
				post_data = '';
				respond(response, 413, 'text/plain', 'TOO MUCH DATA!  D:').end();
				request.connection.destroy();
			}
		});
		request.on('end', function() {
			respond(response, 200, 'text/plain', 'thanxiez for teh datas!');
			resolve(JSON.parse(post_data));
		});
	});
};

var respond = function(response, code, content, message) {
	response.writeHead(code, {
		'Content-Type': content
	});
	response.end(message + '\n');
};


module.exports = {

	initialize: function() {

		http.createServer(function(request, response) {
			console.log('SERVER REQUEST :: ' + request.method + ' ' + request.url);
			if (request.method == 'POST') {
				var p = post_handler(request, response);
				p.then(function(data) {
					console.log(data);
					// check for valid key
					if (data.key !== config.http.key) {
						respond(response, 500, 'text/plain', 'invalid access key');
						return;
					}
					// check for and run command
					if (typeof commands[data.command] === 'function') {
						commands[data.command](data.message);
					}
				});
			} else {
				respond(response, 500, 'text/plain', 'must post data');
			}
		}).listen(config.http.port, config.http.ip);
		// XXX i believe this is firing asynchronously before the server is up
		console.log('Server running at ' + config.http.ip + ':' + config.http.port);
	}

};