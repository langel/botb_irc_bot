/*
	Node will not create multiple instances of a module if
	they are always loaded with the same path.  Therefore,
	all of the bot's modules are in the same directory.
*/

var main = require('./bot_modules/main.js')
main.initialize()