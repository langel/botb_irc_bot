module.exports = {

	delegate: function(client, to, text, message) {
		client.say(to, 'you are in need of help');
		console.log(testes);
	},

};

var testes = 'testes';

var commands = {
	help: function() {
		console.log('help called');
	},
};
