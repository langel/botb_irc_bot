var ram = require('./../memory.js');

var what_max_length = 32;

var process = function(words, operator) {
	// build what
	what = words.join(' ');
	// shave operator off
	what = what.substr(0, what.length - 2).trim();
	// check what length
	if (what.length > what_max_length) {
		return 'kudos max length : ' + what_max_length;
	}
	// load kudos object from memory or setup
	kudos = ram.get('kudos');
	if (typeof kudos == 'undefined') {
		kudos = {};
	}
	console.log(kudos);
	if (typeof kudos[what] == 'undefined') {
		kudos[what] = 0;
	}
	// operate on what
	if (operator == 'minus') {
		kudos[what]--
	}
	else if (operator == 'plus') {
		kudos[what]++;
	}
	// save and return
	ram.set('kudos', kudos);
	return (what + ' has ' + kudos[what] + ' kudos');
};

module.exports = {

	info: function(words) {
		words.shift();
		what = words.join(' ').trim();
		console.log(what);
		kudos = ram.get('kudos');
		if (typeof kudos[what] == 'undefined') {
			return what + ' has no <3';
		}
		return what + ' has ' + kudos[what] + ' kudos';
	},

	minus: function(words) {
		return process(words, 'minus');
	},

	plus: function(words) {
		return process(words, 'plus');
	},


};
