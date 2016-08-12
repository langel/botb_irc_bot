var self = module.exports = {

	// This function is a helper to the main levelup function.
	// it takes a floating point number which represents the number
	// of days ahead of right now. It outputs a string formatted:
	//     x years x months x days
	// Due to the way it's calculated, it takes month lengths, leap years,
	// hell even leap seconds into account. All thanks to Javascript Date.
	day_string: function(days) {
		// this is used to convert days into milliseconds for the Date constructor
		var milliseconds_per_day = 24 * 60 * 60 * 1000;
		var current_date = new Date(Date.now());
		var future_date = new Date(Math.round(
			// (ms / d) * d = ms
			current_date.getTime() + (milliseconds_per_day * days)
		));
		// Calculate how many years ahead the future date is.
		// Notice: this can be inaccurate! Example: dec 25th 2015 and 
		//         jan 23rd 2016 would say 1 year apart! We check for
		//         this later in the code however.
		var years = future_date.getUTCFullYear() - current_date.getUTCFullYear();
		// Next we set the current date to its current date + how many years
		// we calculated!
		current_date.setUTCFullYear(current_date.getUTCFullYear() + years);
		// Calculate the number of months ahead the future date is.
		// If the month crosses over the 12th month border, the difference
		// is negative. This is checked for further in the program.
		var months = future_date.getUTCMonth() - current_date.getUTCMonth();
		// If it IS negative, we subtract the months to set the correct month. 
		current_date.setUTCMonth(current_date.getUTCMonth() + months);
		if (months < 0) {
			// if we did get a negative month number, that means we went
			// ahead one year too far earlier. Lets take it back!...
			current_date.setUTCFullYear(current_date.getUTCFullYear() - 1);
			years--;
			// ...and lets get that month out of the negatives!
			months += 12;
		}
		// Lastly, we check the days. Once again, if we cross a month threshold, we will go into the
		// negatives. This is made up for though by checking how many days are in the month at hand, 	
		// and adding that to the negative days. 
		var days = future_date.getUTCDate() - current_date.getUTCDate();
		if (days < 0) {
			// if the days roll over into the next month...
			months--; // we were lied to earlier a la the years calculation
			current_date.setUTCMonth(current_date.getUTCMonth() - 1);
			days += new Date(current_date.getUTCFullYear(), current_date.getUTCMonth() + 1, 0).getDate();
		}
		// Only display the lowest level of day display that you can. This is to save space!
		var formatted_ymd = days + " days";
		if (years > 0) {
			formatted_ymd = years + " years " + months + " months " + formatted_ymd;
		} 
		else if (months > 0) {
			formatted_ymd = months + " months " + formatted_ymd;
		}
		return formatted_ymd;
	},

	plural_simple: function(word, val) {
		if (val == 1 || val == -1) {
			return word;
		}
		return word + 's';
	},

	seconds_string: function(seconds) {
		var days, months, years = 0;
		var hours = Math.floor(seconds / 3600);
		var minutes = Math.floor((seconds - (hours * 3600)) / 60);
		var seconds = (seconds - (hours * 3600) - (minutes * 60)).toFixed(3);
		var vals_started = false;
		var vals = [];
		if (hours >= 24) {
			days = Math.floor(hours / 24);
			hours = hours % 24;
		}
		if (days >= 30) {
			months = Math.floor(days / 30);
			days = days % 30;
		}
		if (months >= 12) {
			years = Math.floor(months / 12);
			months = months % 12;
		}
		response_push = function(string, val) {
			if (val || vals_started) {
				vals_started = true;
				vals.push(val + ' ' + self.plural_simple(string, val));
			}
		};
		response_push('year', years);
		response_push('month', months);
		response_push('day', days);
		response_push('hour', hours);
		response_push('minute', minutes);
		response_push('second', seconds);
		return vals.join(', ');
	}

};
