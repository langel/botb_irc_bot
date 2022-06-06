var ram = require('./memory.js');
var what_max_length = 32;


var get_kudos = () => {
	var kudos;
	kudos = ram.get('kudos');
	if (typeof kudos == 'undefined') kudos = {};
	return kudos;
};

var best_and_worst = () => {
	var kudos = get_kudos();
	var sordid = [];
	for (var word in kudos) sordid.push([word, kudos[word]]);
	kudos = sordid.sort(function(ass, bean) {
		return bean[1] - ass[1];
	});
	var THE_TRUTH = [];
	var tops = kudos.slice(0, 10);
	tops.forEach((ass) => {
		THE_TRUTH.push(ass[0] + ' ' + ass[1]);
	});
	var bottoms = kudos.slice(-10);
	bottoms.forEach((ass) => {
		THE_TRUTH.push(ass[0] + ' ' + ass[1]);;
	});
	return THE_TRUTH.join('  •  ');
};


var process = (words, operator) => {
	// build what
	var what = words.join(' ');
	// shave operator off
	what = what.substr(0, what.length - 2);
	// remove dicksword identifier and trim
	what = what.replace(/\s*\[[^)]*\]\s*/, '').trim();
	// check what length
	if (what.length > what_max_length)
		return `kudos max length : ${what_max_length}`;
	var display = what;
	what = what.toLowerCase();
	// special cases? :shrug:
	if (what == '56') return `56 has 56 kudos`;
	// load kudos object from memory or setup
	kudos = get_kudos();
	if (typeof kudos[what] == 'undefined') kudos[what] = 0;
	// operate on what
	if (operator == 'minus') {
		kudos[what]--;
	} else if (operator == 'plus') {
		kudos[what]++;
	}
	// save and return
	ram.set('kudos', kudos);
	return `${display} has ${kudos[what]} kudos`;
};


module.exports = {

	info: words => {
		words.shift();
		what = words.join(' ').trim();
		if (what == '') {
			return best_and_worst();
		}
		console.log(what);
		kudos = ram.get('kudos');
		for (let prop in kudos) if (prop.toLowerCase() == what.toLowerCase()) {
			return `${prop} has ${kudos[prop]} kudos`;
		}
		return `${what} has no <3`;
	},

	minus: words => process(words, 'minus'),
	plus: words => process(words, 'plus')

};
