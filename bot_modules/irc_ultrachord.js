const MAX_PLUCK_FREQ = 4220; // straight from SoX source code (src/syncth.c)

module.exports = {
	default_octave: 4, // exported so that help can reference it
	// returns a link to an ultrachord
	ultrachord: words => {
		const execSync = require('child_process').execSync;
		let errors = [];

		function makeid() {
			let text = "";
			let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for (let i = 0; i < 16; i++)
				text = text.concat(possible.charAt(Math.floor(Math.random() * possible.length)));
			return text;
		}

		function getFrequency(octave, note) {
			// 1.059463094359 == 2^12, used for note frequency calculation!
			let base_note = 10; // A
			let base_octave = module.exports.default_octave;
			let note_distance = ((octave * 12) + note) - ((base_octave * 12) + base_note);
			// 440hz == A4
			let frequency = 440 * Math.pow(1.059463094359, note_distance);
			return frequency.toFixed(4);
		}

		function noteToNumber(letter) {
			switch (letter) {
				case 'a': return 9;
				case 'b': return 11;
				case 'c': return 0;
				case 'd': return 2;
				case 'e': return 4;
				case 'f': return 5;
				case 'g': return 7;
				default:  return -1;
			}
		}

		let id = makeid();
		let filename = '';

		let timbres = ['pluck', 'square', 'triangle', 'sawtooth', 'sine', 'sin', 'saw', 'tri'];
		let timbre = timbres[2]; // default triangle wave
		let notes = [];

		words.slice(1).forEach(word => {
			// toLowerCase to make life easier!
			let param = word.toLowerCase();

			// check if it's a timbre
			if (timbres.indexOf(param) !== -1) {
				filename += timbre = param;
				filename += '_';
				return;
			}

			// abort if a note parameter is not well-formed
			if (!param.match(/^[a-gA-G](-|[#b♯♭]{0,2})[0-9]?$/)) {
				errors.push(param + ' unrecognized');
				return;
			}

			// note to number function call happens
			let note_val = noteToNumber(param.charAt(0));
			filename += param.charAt(0);

			// sharps and flats handling (gotta love utf-8)
			for (let i = 1; i < param.length; i++) {
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
			let octave_val = parseInt(param.charAt(param.length - 1), 10);
			if (!Number.isInteger(octave_val)) octave_val = 4;
			filename += octave_val;
			filename += '_';

			// push the final note via a get frequency function
			let freq = getFrequency(octave_val, note_val);
			if (timbre == 'pluck' && freq > MAX_PLUCK_FREQ) {
				errors.push(param + ' out of pluck range');
				return;
			}
			notes.push({ timbre: timbre, freq: freq });
		});

		let error_text = errors.length ? ' (' + errors.join(', ') + ')' : '';

		if (notes.length == 0) return `no valid notes: ${error_text}`;
		console.log(notes);
		console.log(filename);

		// create the synth, convert to mp3, upload to uguu.se
		let exec_notes = '';
		notes.forEach(note_data => {
			exec_notes += `${note_data.timbre} ${note_data.freq} `;
		});
		// just testing this concept out  D:
		id = filename;
		execSync(`sox -n ${id}.wav synth 5 ${exec_notes} remix 1-`);
		execSync(`lame -V2 ${id}.wav ${id}.mp3`);
		let upload = execSync(`curl -i -F file=@${id}.mp3 https://uguu.se/api.php?d=upload-tool`);
		execSync(`rm ${id}.mp3 ${id}.wav`);
		let link = upload.toString().split(/\r?\n/);
		return `${link[link.length - 1]} ${error_text}`;
	}
};
