var fs = require('fs');
var ram_file = './memory.json';
var ram = {};

/* 
	There's potential here for things to get haywire.
	I have no idea what would happen if this memory
	manager tried to write the file multiple times
	in the same moment.

	Moar research and testing could be done.
*/



module.exports = {

	initialize: function() {
		fs.access(ram_file, function(error) {
			if (error !== null) {
				console.log('New RAM created');
				return;
			} else {
				fs.readFile(ram_file, function(error, data) {
					ram = JSON.parse(data);
					console.log('RAM loaded from local file');
				});
			}
		});
	},

	get: function(key) {
		return ram[key];
	},

	set: function(key, val) {
		ram[key] = val;
		console.log('Saving RAM to Disk');
		fs.writeFileSync(ram_file, JSON.stringify(ram));
	},

	// carefull, this can overwrite a non array
	value_push: function(key, val) {
		var value = this.get(key);
		if (!Array.isArray(value)) {
			value = [];
		}
		value.push(val);
		this.set(key, value);
	}

};
