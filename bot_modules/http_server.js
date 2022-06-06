var config = require('./config.js');
var ram = require('./memory.js');
var http = require('http');
var bot = require('./irc_bot.js');
var alerts = require('./irc_alerts.js');

var commands = {

	say: message => {
		alerts.setXHBTimeouts(); // update XHB alerts
		console.log('SAY FROM SITE :: ' + message);
		bot.say(config.irc.channels[0], message);
		return 'the bot speaks!';
	},

};

var post_handler = (request, response) => {
	return new Promise((resolve, reject) => {
		let post_data = '';
		request.on('data', data => {
			console.log(data);
			post_data += data;
			if (post_data.length > 1000000) {
				post_data = '';
				respond(response, 413, 'text/plain', 'TOO MUCH DATA!  D:').end();
				request.connection.destroy();
			}
		});
		request.on('end', () => {
			respond(response, 200, 'text/plain', 'thanxiez for teh datas!');
			resolve(post_data);
//			if (typeof post_data === 'string') return resolve(post_data);
			if (typeof post_data !== 'object') return resolve(false);
			else resolve(post_data);
		});
	});
};

var respond = (response, code, content, message) => {
	response.writeHead(code, {
		'Content-Type': content
	});
	response.end(message + '\n');
};


module.exports = {

	initialize: () => {
		// wait until bot joins IRC, hopefully it's done so in 30 seconds
		setTimeout(alerts.setXHBTimeouts, 30000);
		setInterval(alerts.setXHBTimeouts, 5 * 60 * 1000);

		http.createServer((request, response) => {
			console.log(`SERVER REQUEST ::  ${request.method} ${request.url}`);
			if (request.method == 'POST') {
				let p = post_handler(request, response);
				p.then(data => {
					if (typeof data !== 'object') data = JSON.parse(data);
					let rtype = 200;
					let rtext = '';
					// check for valid key
					if (data.key != config.http.key) {
						console.log('BAD KEY');
						rtype = 500;
						rtext = 'invalid access key';
					}
					// check for and run command
					// XXX could add error handling to response
					if (typeof commands[data.command] === 'function') {
						console.log('run command: ' + data.command);
						rtext = commands[data.command](data.message);
					}
					respond(response, rtype, 'text/plain', rtext);
					return;
				});
			} else {
				respond(response, 500, 'text/plain', 'must post data');
			}
		}).listen(config.http.port, config.http.ip, null, () => {
			console.log(`Server running at ${config.http.ip}:${config.http.port}`);
		});
	}

};
