var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var fireBaseInterface = require('./firebase.js');
var serverInterface = require('./server.js');
var schedule = require('node-schedule');

var bot_token = process.env.SLACK_BOT_TOKEN;

var rtm = new RtmClient(bot_token);

let channel;
let statusChannel;
let im;
let update;
let current = null;
let allUpdates = [];
let allowed = false;

fireBaseInterface.init();
serverInterface.init(fireBaseInterface);

var dailyRule = new schedule.RecurrenceRule();
dailyRule.dayOfWeek = [1, new schedule.Range(2, 5)];
dailyRule.hour = 18;
dailyRule.minute = 21;

var dailyJ = schedule.scheduleJob(dailyRule, function() {
	console.log('CRON UPDATE!');

	let attachments = [
		{
			fallback: allUpdates[0].yesterday,
			color: '#aaffaa',
			pretext: `<@${allUpdates[0].user}>`,
			title: 'Yesterday',
			text: allUpdates[0].yesterday,
			mrkdwn_in: ['text']
		},
		{
			fallback: allUpdates[0].today,
			color: '#36a64f',
			title: 'Today',
			text: allUpdates[0].today,
			mrkdwn_in: ['text']
		},
		{
			fallback: allUpdates[0].blockers,
			color: '#f44f34',
			title: 'Blockers',
			text: allUpdates[0].blockers,
			mrkdwn_in: ['text']
		}
	];

	web.chat.postMessage('@peter', '', { as_user: true, attachments }, function(err, res) {
		if (err) {
			console.log('Error:', err);
		} else {
			console.log('Message sent: ', res);
		}
	});
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
	if (message.channel === im && message.user === channel && current) {
		if (!update) {
			let d = new Date();
			update = fireBaseInterface.postUpdate({
				yesterday: message.text,
				user: message.user,
				date: d.toLocaleString()
			});
			rtm.sendMessage('What will you work on today?', im);
		} else if (current === 'yesterday') {
			fireBaseInterface.editUpdate(update, {
				today: message.text
			});
			rtm.sendMessage('Anything standing in your way?', im);
			current = 'today';
		} else if (current === 'today') {
			fireBaseInterface.editUpdate(update, {
				blockers: message.text
			});
			rtm.sendMessage('Thanks! Chat again tomorrow :)', im);
			current = null;
		}
	}
});

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, rtmStartData => {
	for (const c of rtmStartData.users) {
		if (c.name === 'peter') {
			//console.log('CHANNEL FOUND', c);
			channel = c.id;
		}
	}

	for (const d of rtmStartData.channels) {
		if (d.name === 'eng-status') {
			statusChannel = d.id;
			console.log('CHANNEL FOUND', statusChannel);
		}
	}

	for (const i of rtmStartData.ims) {
		if (i.user === channel) {
			//console.log('IM FOUND', i);
			im = i.id;
		}
	}
	console.log(
		`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team
			.name}, but not yet connected to a channel`
	);
});

//you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
	fireBaseInterface.on('updates', 'value', values => {
		allUpdates = [];
		for (key in values) {
			allUpdates.push(values[key]);
		}
	});

	fireBaseInterface.on('users', 'value', values => {
		let user = values['U6E132Y20'];
		var rule = new schedule.RecurrenceRule();
		rule.dayOfWeek = [1, new schedule.Range(2, 5)];
		rule.hour = user.updateTime.split(':')[0];
		rule.minute = user.updateTime.split(':')[1];

		var j = schedule.scheduleJob(rule, function() {
			update = null;
			current = 'yesterday';
			console.log('CRON!');
			web.chat.postMessage(
				'@peter',
				'What did you do yesterday?',
				{ as_user: true },
				function(err, res) {
					if (err) {
						console.log('Error:', err);
					} else {
						console.log('Message sent: ', res);
					}
				}
			);
		});
	});
});

var web = new WebClient(bot_token);
// web.chat.postMessage('@peter', '', { as_user: true, attachments: attachments }, function(err, res) {
// 	if (err) {
// 		console.log('Error:', err);
// 	} else {
// 		console.log('Message sent: ', res);
// 	}
// });

let connect = rtm.connect('https://slack.com/api/rtm.connect');
