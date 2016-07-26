var fs = require('fs');
var ram_file = './memory.json';
var ram = {};

/* 
	Experimenting with the RAM only being backed up
	every 10 seconds.
*/

var save_needed = false;

module.exports = {

	initialize: function() {
		fs.access(ram_file, function(error) {
			if (error !== null) {
				console.log('New RAM created');
				return;
			} 
			else {
				fs.readFile(ram_file, function(error, data) {
					ram = JSON.parse(data);
					console.log('RAM loaded from local file');
				});
			}
		});
		setInterval(function() {
			if (save_needed === true) {
				console.log('Saving RAM to Disk');
				fs.writeFileSync(ram_file, JSON.stringify(ram));
				save_needed = false;
			}
		}, 10000);
	},

	get: function(key) {
		return ram[key];
	},

	set: function(key, val) {
		ram[key] = val;
		save_needed = true;
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
