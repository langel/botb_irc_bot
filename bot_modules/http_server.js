var config = require('./config.js');
var http = require('http');


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
	response.writeHead(code, {'Content-Type':content});
	response.end(message);
};


module.exports = {

	intialize: function(bot) {

		http.createServer(function (request, response) {
			console.log('SERVER REQUEST :: ' + request.url);

			// XXX need to check for key
			console.log(request.method);
			if (request.method == 'POST') {
				var p = post_handler(request, response);
				p.then(function(data) {
					console.log(data);
					
					bot.say(config.irc.channels[0], data.string);
				});
			}
			else {
				respond(response, 500, 'text/plain', 'must post data');
			}
		}).listen(config.http.port, config.http.ip);
		console.log('Server running at ' + config.http.ip + ':' + config.http.port);


	}

};
