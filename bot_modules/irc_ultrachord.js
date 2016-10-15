const MAX_PLUCK_FREQ = 4220; // straight from SoX source code (src/syncth.c)
const SAMPLE_DIR = 'sounds';

// declaring all these as const is probably useless

const note_names = [
	'C',
	'C#',
	'D',
	'D#',
	'E',
	'F',
	'F#',
	'G',
	'G#',
	'A',
	'A#',
	'B'
];

// must declare before exports so that timbres can concat them
const sample_timbres = [
	'baseline',
	'choirs',
	'piano',
	'synth',
	'trem'
];
const synth_timbres = [
	'pluck',
	'saw',
	'sawtooth',
	'sin',
	'sine',
	'square',
	'tri',
	'triangle'
];

// min and max octaves for timbres. if omitted, no restriction
const timbre_octaves = {
	baseline: [4, 4],
	choirs: [4, 4],
	piano: [4, 4],
	synth: [4, 4],
	trem: [0, 4]
};

module.exports = {
	default_octave: 4, // exported so that help can reference it

	timbres: sample_timbres.concat(synth_timbres),

	// returns a link to an ultrachord
	ultrachord: function(words) {
		const execSync = require('child_process').execSync;

		var errors = [];

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
		var timbre = 'square'; // square wave because chiptune dumbo
		var notes = [];

		words.slice(1).forEach(function(word) {
			// toLowerCase to make life easier!
			var param = word.toLowerCase();

			// check if it's a timbre
			if (module.exports.timbres.indexOf(param) !== -1) {
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
				octave_val = 4;
			}
			// check if note is within octave range of instrument
			var octaves = timbre_octaves[timbre];
			if (octaves) {
				if (octave_val < octaves[0] || octave_val > octaves[1]) {
					errors.push(`${param} out of ${timbre} range`);
					return;
				}
			}
			filename += octave_val;
			filename += '_';

			// get canonical note name for sample lookup
			var note_name = `${note_names[note_val % 12]}${octave_val}`;

			// push the final note via a get frequency function
			var freq = getFrequency(octave_val, note_val);
			if (timbre == 'pluck' && freq > MAX_PLUCK_FREQ) {
				errors.push(param + ' out of pluck range');
				return;
			}
			notes.push({ timbre: timbre, freq: freq, name: note_name });
		});

		var error_text = errors.length ? ' (' + errors.join(', ') + ')' : '';

		if (notes.length == 0) return 'no valid notes' + error_text;
		console.log(notes);
		console.log(filename);

		// create the synth, convert to mp3, upload to uguu.se
		var exec_samples = exec_synths = '';
		var nsamples = 0;
		notes.forEach(function(note_data) {
			if (sample_timbres.indexOf(note_data.timbre) != -1) {
				exec_samples += `${SAMPLE_DIR}/${note_data.timbre}/` +
					`${note_data.name}.wav `;
				nsamples++;
			} else {
				exec_synths += `${note_data.timbre} mix ${note_data.freq} `;
			}
		});
		// just testing this concept out  D:
		id = filename;
		execSync('sox ' +
			(nsamples > 1 ? '-m ' : '') + // use mix flag for multiple samples
			(nsamples > 0 ? '' : '-n ') + // null input file if no samples used
			exec_samples + ' ' + id + '.wav ' +
			(exec_synths ? 'synth 5 ' + exec_synths : '') +
			' remix 1-');
		execSync('lame -V2 ' + id + '.wav ' + id + '.mp3');
		var upload = execSync('curl -i -F file=@' + id + '.mp3 https://uguu.se/api.php?d=upload-tool');
		execSync('rm ' + id + '.mp3 ' + id + '.wav');

		var link = upload.toString().split(/\r?\n/);
		return link[link.length - 1] + error_text;
	}
};
