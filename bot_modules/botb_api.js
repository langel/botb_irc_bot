var curl = require('curl')
var botb_api_root = 'http://battleofthebits.org/api/v1/'

module.exports = {

	request: request_url => {
		console.log('API Request: ' + botb_api_root + request_url);
		return new Promise((resolve, reject) => {
			curl.get(botb_api_root + request_url, {
					headers: {
						'User-Agent': 'curl'
					}
				},
				(err, response, body) => {
					let obj;
					try {
						let stat = response.statusCode
						if (stat != '200') {
							reject(response)
							return
						}
						obj = JSON.parse(body);
					}
					catch(e) {
						reject(response);
						return
					}
					resolve(obj)
				}
			)
		})
	},

	post: post_url => {
		// XXX BotB API does not yet accept POSTs
	},
}
