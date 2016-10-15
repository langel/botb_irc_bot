var curl = require('curl')
var botb_api_root = 'http://battleofthebits.org/api/v1/'

module.exports = {

	request: request_url => {
		return new Promise((resolve, reject) => {
			curl.get(botb_api_root + request_url, {
					headers: {
						'User-Agent': 'curl'
					}
				},
				(err, response, body) => {
					let stat = response.statusCode
					if (stat == '400' || stat == '500') {
						reject(response)
						return
					}
					resolve(JSON.parse(body))
				}
			)
		})
	},

	post: post_url => {
		// XXX BotB API does not yet accept POSTs
	},
}