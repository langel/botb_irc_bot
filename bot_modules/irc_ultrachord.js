module.exports = {
	default_octave: 4, // exported so that help can reference it

	// returns a link to an ultrachord
	ultrachord: function(words) {
		const execSync = require('child_process').execSync;

		function makeid() {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for (var i = 0; i < 16; i++) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			return text;
		}

		function getFrequency(octave, note) {
			// 1.059463094359 == 2^12, used for note frequency calculation!
			var base_note = 10; // A
			var base_octave = module.exports.default_octave;
			var note_distance = ((octave * 12) + note) - ((base_octave * 12) + base_note);
			// 440hz == A4
			var frequency = 440 * Math.pow(1.059463094359, note_distance);
			return frequency.toFixed(4);
		}

		function noteToNumber(letter) {
			switch (letter) {
				case 'a':
					return 9;
				case 'b':
					return 11;
				case 'c':
					return 0;
				case 'd':
					return 2;
				case 'e':
					return 4;
				case 'f':
					return 5;
				case 'g':
					return 7;
				default:
					return -1;
			}
		}

		var id = makeid();
		var filename = '';

		var timbres = ['pluck', 'square', 'triangle', 'sawtooth', 'sine', 'sin', 'saw', 'tri'];
		var timbre = timbres[2]; // square wave because chiptune dumbo
		var notes = [];

		words.slice(1).forEach(function(word) {
			// toLowerCase to make life easier!
			var param = word.toLowerCase();

			// check if it's a timbre
			if (timbres.indexOf(param) !== -1) {
				filename += timbre = param;
				filename += '_';
				return;
			}

			// abort if a note parameter is not well-formed
			if (!param.match(/^[a-gA-G](-|[#b♯♭]{0,2})[0-9]?$/)) return;

			// note to number function call happens
			var note_val = noteToNumber(param.charAt(0));
			filename += param.charAt(0);

			// sharps and flats handling
			for (var i = 1; i < param.length; i++) {
				switch (param.charAt(i)) {
					case '#':
					case '♯':
						note_val++;
						filename += 'S';
						break;
					case 'b':
					case '♭':
						note_val--;
						filename += 'b';
						break;
				}
			}

			// octave handling
			var octave_val = parseInt(param.charAt(param.length - 1), 10);
			if (!Number.isInteger(octave_val)) {
				if (param.length > 2) return;
				octave_val = 4;
			}
			filename += octave_val;
			filename += '_';

			// push the final note via a get frequency function
			notes.push({
				timbre: timbre,
				freq: getFrequency(octave_val, note_val)
			});
		});

		if (notes.length == 0) return 'notes missing or invalid';
		console.log(notes);
		console.log(filename);

		// create the synth, convert to mp3, upload to uguu.se
		var exec_notes = '';
		notes.forEach(function(note_data) {
			exec_notes += note_data.timbre + ' ' + note_data.freq + ' ';
		});
		// just testing this concept out  D:
		id = filename;
		execSync('sox -n ' + id + '.wav synth 5 ' +
			exec_notes +
			" remix 1-");
		execSync('lame -V2 ' + id + '.wav ' + id + '.mp3');
		var upload = execSync('curl -i -F file=@' + id + '.mp3 https://uguu.se/api.php?d=upload-tool');
		execSync('rm ' + id + '.mp3 ' + id + '.wav');

		var link = upload.toString().split(/\r?\n/);
		return link[link.length - 1];
	}
};
