var curl = require('curl');
var botb_api_root = 'https://battleofthebits.com/api/v1/';

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
						let stat = response.statusCode;
						console.log('stat : ' + stat);
						if (stat != '200') {
							reject(response);
							return;
						}
						obj = JSON.parse(body);
					}
					catch(e) {
						reject(response);
						return;
					}
					resolve(obj);
				}
			);
		});
	},

	post: (request_url, body) => {
		// XXX does not currently handle returns
		request_url = botb_api_root + request_url;
		console.log('API POST: ' + request_url);
		return new Promise((resolve, reject) => {
			curl.post(request_url, body, {
					headers: { 
						'User-Agent': 'curl', 
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				},
				(err, response, body) => {
					let obj;
					try {
						let stat = response.statusCode;
						console.log('stat : ' + stat);
						if (stat != '200') {
							reject(response);
							return;
						}
						obj = JSON.parse(body);
					}
					catch(e) {
						reject(response);
						return;
					}
					resolve(obj);
				}
			);
		});
	},


};
