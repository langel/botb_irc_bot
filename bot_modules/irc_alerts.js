/*
 * irc_alerts.js --
 * throws messages in IRC when
 * - it is 15 minutes before an XHB start;
 * - an XHB has started;
 * - it is 30, 10 or 2 minutes before XHB end;
 * - when an XHB ends, and voting begins
 */

var https = require('https');
var querystring = require('querystring');
var request = require('request');

var bot = require('./irc_bot.js');
var commands = require('./irc_commands.js');
var botb_api = require('./botb_api.js');
var config = require('./config.js');

// keep track of all timeout ids
let timeouts = [];
let alertChannel = config.irc.channels[0];
let preAlertTime = 9e5; // 15 minutes in ms

// discord role ping string, used at xhb pre-alert
let roleXHBr = "<@&864233546981179442>";

let battleAlerts = {};

// contains functions that throw XHB announcement messages to the channel
let announce = {
  // when XHB starts
  XHBStart: battle => {
    battleAlerts[battle.id].start = true;

    let allFormats = battle.format_tokens.join(", "); // just in case XHBs contain multiple formats in future
    let announceString = `${battle.hour_count} started! g0g0g0g0g0! :: ${battle.title} :: Format ${allFormats} :: <${battle.profile_url.match(commands.url_regex)}>`;
    bot.say(alertChannel, announceString);
  },

  // some minutes before XHB starts
  XHBPre: (battle, startTime) => {
    battleAlerts[battle.id].pre = true;

    let minutes = Math.round((startTime / 1000) / 60);
    let allFormats = battle.format_tokens.join(", ");
    let announceString = `${battle.hour_count} will begin in ${minutes} minutes! :: ${battle.title} :: Format ${allFormats} ${roleXHBr}`;
    bot.say(alertChannel, announceString);
  },

  // some minutes before XHB ends
  XHBMinEnd: (battle, minutes) => {
    switch (minutes) {
      case 30:
        battleAlerts[battle.id].end30 = true;
        break;
      case 10:
        battleAlerts[battle.id].end10 = true;
        break;
      case 2:
        battleAlerts[battle.id].end2 = true;
        break;
      default:
        break;
    }

    let allFormats = battle.format_tokens.join(", ");
    let announceString = `${minutes} minutes left! @ ${battle.hour_count} :: ${battle.title} :: Format ${allFormats}`;
    if (battleAlerts[battle.id].end2) {
      announceString = `${minutes} minutes left! @ ${battle.hour_count} !!! I suggest you R teh uploading !!!! :: ${battle.title} :: Format ${allFormats}`;
    }
    bot.say(alertChannel, announceString);
  },

  // announce XHB end
  XHBEnd: battle => {
    battleAlerts[battle.id].end = true;

    let allFormats = battle.format_tokens.join(", ");
    let announceString = `Yer ${battle.hour_count} time is teh up. slackerz. :: ${battle.title} :: Format ${allFormats}`;
    bot.say(alertChannel, announceString);

    // remove battle from battleAlerts
    delete battleAlerts[battle.id];
  }
};

let setXHBTimeouts = () => {
  console.log("updating XHB timeouts!!");

  botb_api.request("battle/current").then(data => {
    // clear all the timeouts
    if (timeouts.length > 0) {
      for (timeout of timeouts) {
        clearTimeout(timeout);
      }
    }

    data.forEach(battle => {
      if (battle.type === "3") {
        // this is an XHB

        battle['hour_count'] = commands.get_xhb_type(battle.cover_art_url).toUpperCase();

        if (battle.period === "vote") {
          console.log(`battle ${battle.title} in voting phase, skipping...`);
          return;
        }

        if (!battleAlerts.hasOwnProperty(battle.id)) {
          // create object to track what alerts have been sent
          battleAlerts[battle.id] = {
            pre: false, start: false,
            end30: false, end10: false, end2: false,
            end: false
          };
        }

        if (battle.period === "warmup") {
          // XHB not yet started
          // create timeout for when XHB begins, if we haven't alerted people yet
          if (!battleAlerts[battle.id].start) {
            timeouts.push(setTimeout(announce.XHBStart,
                                     battle.period_end_seconds * 1000,
                                     battle));
            console.log(`waiting ${battle.period_end_seconds * 1000}ms until ${battle.title} begins...`);
          }

          // if we haven't alerted the peoples yet...
          if (!battleAlerts[battle.id].pre) {
            if (battle.period_end_seconds > (preAlertTime / 1000)) {
              // create timeout for some time before XHB begins
              timeouts.push(setTimeout(announce.XHBPre,
                                       (battle.period_end_seconds * 1000) - preAlertTime,
                                       battle, preAlertTime));
              console.log(`waiting ${(battle.period_end_seconds * 1000) - preAlertTime}ms until pre-alert for ${battle.title} begins...`);
            } else if (battle.period_end_seconds > 120) { // two mins minimum alert time
              // alert them now!!
              announce.XHBPre(battle, battle.period_end_seconds * 1000);
              console.log(`${battle.title} begins now!`);
            }
          }
        } else if (battle.period === "entry") {
          // XHB started!

          // alert at 30 minutes...
          if (!battleAlerts[battle.id].end30) {
            if ((battle.period_end_seconds * 1000) - 18e5 > 0) {
              timeouts.push(setTimeout(announce.XHBMinEnd,
                                       (battle.period_end_seconds * 1000) - 18e5,
                                       battle, 30));
              console.log(`waiting ${(battle.period_end_seconds * 1000) - 18e5}ms until 30min alert for ${battle.title}...`);
            }
          }
          // alert at 10 minutes...
          if (!battleAlerts[battle.id].end10) {
            if ((battle.period_end_seconds * 1000) - 6e5 > 0) {
              timeouts.push(setTimeout(announce.XHBMinEnd,
                                       (battle.period_end_seconds * 1000) - 6e5,
                                       battle, 10));
              console.log(`waiting ${(battle.period_end_seconds * 1000) - 6e5}ms until 10min alert for ${battle.title}...`);
            }
          }
          // alert at 2 minutes...
          if (!battleAlerts[battle.id].end2) {
            if ((battle.period_end_seconds * 1000) - 12e4 > 0) {
              timeouts.push(setTimeout(announce.XHBMinEnd,
                                       (battle.period_end_seconds * 1000) - 12e4,
                                       battle, 2));
              console.log(`waiting ${(battle.period_end_seconds * 1000) - 12e4}ms until 2min alert for ${battle.title}...`);
            }
          }
          // alert at XHB end...
          if (!battleAlerts[battle.id].end) {
            timeouts.push(setTimeout(announce.XHBEnd,
                                     (battle.period_end_seconds * 1000),
                                     battle));
            console.log(`waiting ${(battle.period_end_seconds * 1000)}ms until end alert for ${battle.title}...`);
          }
        }
      }
    });
  }, error => {
    return 1; // there are no battles!
  });
};

module.exports = {
  setXHBTimeouts: setXHBTimeouts
};
