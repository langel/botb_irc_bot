var self = module.exports = {

	// This function is a helper to the main levelup function.
	// it takes a floating point number which represents the number
	// of days ahead of right now. It outputs a string formatted:
	//     x years x months x days
	// Due to the way it's calculated, it takes month lengths, leap years,
	// hell even leap seconds into account. All thanks to Javascript Date.
	days_to_fulldate: days_in_future => {
		if (days_in_future === Infinity) return '∞ years' // no need to calculate
		if (days_in_future < 1.0) return "less than 1 day" // also covers the 'hasn't levelled up bug
		let ms_per_day = 1 * 24 * 60 * 60 * 1000
		//               day hr   min  sec  milli
		let present_in_ms = new Date().getTime()
		let future_in_ms  = ms_per_day * days_in_future + present_in_ms
		// now as date objects
		let future_date  = new Date(future_in_ms)
		let current_date = new Date(present_in_ms)
		let years  = future_date.getFullYear() - current_date.getFullYear()
		let months = future_date.getMonth()    - current_date.getMonth()
		let days   = future_date.getDate()     - current_date.getDate()
		if ((months == 0 && days < 0) || (months < 0)) years--
		if (months < 0) months += 12
		if (days < 0) {
			months--
		let days_in_future_month  = new Date(future_date.getFullYear(),  future_date.getMonth()  + 1, 0).getDate()
		let days_in_present_month = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0).getDate()
		let days_left_in_present_month = days_in_present_month - current_date.getDate()
		days = future_date.getDate() + days_left_in_present_month
		}
		return
			years  > 0 ? `${years} years ${months} months ${days} days` :
			months > 0 ? `${months} months ${days} days` : `${days} days`
	},

	plural_simple: (word, val) => 
		(val == 1 || val == -1) ? word : word + 's',

	seconds_string: s => {
		let days, months, years = 0
		let hours = Math.floor(s / 3600)
		let minutes = Math.floor((s - (hours * 3600)) / 60)
		let seconds = (s - (hours * 3600) - (minutes * 60)).toFixed(3)
		let vals_started = false
		let vals = []
		if (hours >= 24) {
			days = Math.floor(hours / 24)
			hours = hours % 24
		}
		if (days >= 30) {
			months = Math.floor(days / 30)
			days = days % 30
		}
		if (months >= 12) {
			years = Math.floor(months / 12)
			months = months % 12
		}
		response_push = (string, val) => {
			if (val || vals_started) {
				vals_started = true
				vals.push(`${val} ${self.plural_simple(string, val)}`)
			}
		}
		response_push('year', years)
		response_push('month', months)
		response_push('day', days)
		response_push('hour', hours)
		response_push('minute', minutes)
		response_push('second', seconds)
		return vals.join(', ')
	}

}
