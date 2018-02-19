var config = require('./config.js')
var ram = require('./memory.js')
var http = require('http')
var bot = require('./irc_bot.js')


var commands = {

	say: message => {
		bot.say(config.irc.channels[0], message)
		respond(response, 200, 'text/plain', 'the bot speaks!')
	},

}

var post_handler = (request, response) => {
	return new Promise((resolve, reject) => {
		let post_data = ''
		request.on('data', data => {
			post_data += data
			if (post_data.length > 1e6) {
				post_data = ''
				respond(response, 413, 'text/plain', 'TOO MUCH DATA!  D:').end()
				request.connection.destroy()
			}
		})
		request.on('end', () => {
			respond(response, 200, 'text/plain', 'thanxiez for teh datas!')
			// XXX CRASHES if JSON is borked
			resolve(JSON.parse(post_data))
		})
	})
}

var respond = (response, code, content, message) => {
	response.writeHead(code, {
		'Content-Type': content
	})
	response.end(message + '\n')
}


module.exports = {

	initialize: () => {

		http.createServer((request, response) => {
			console.log(`SERVER REQUEST ::  ${request.method} ${request.url}`)
			if (request.method == 'POST') {
				let p = post_handler(request, response)
				p.then(data => {
					console.log(data)
					// check for valid key
					if (data.key !== config.http.key) {
						respond(response, 500, 'text/plain', 'invalid access key')
						return
					}
					// check for and run command
					console.log('run command');
					console.log(commands);
					if (typeof commands[data.command] === 'function') {
						commands[data.command](data.message)
					}
				})
			} else {
				respond(response, 500, 'text/plain', 'must post data')
			}
		}).listen(config.http.port, config.http.ip, null, () => {
			console.log(`Server running at ${config.http.ip}:${config.http.port}`)
		})
	}

}
