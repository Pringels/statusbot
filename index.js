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
//let im;
let update;
let current = null;
let allUpdates = [];
let allowed = false;
let ims = {};

let scheduleRegistry = {};

fireBaseInterface.init();
serverInterface.init(fireBaseInterface);

var dailyRule = new schedule.RecurrenceRule();
dailyRule.dayOfWeek = [1, new schedule.Range(2, 5)];
dailyRule.hour = 17;
dailyRule.minute = 00;

var dailyJ = schedule.scheduleJob(dailyRule, function() {
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
	console.log('INCOMING MESSAGE', message);
	fireBaseInterface.getUser(message.user).once('value').then(snapshot => {
		let user = snapshot.val();
		let user_id = snapshot.key;
		console.log('USER', user);
		var now = new Date();
		let hours = user.updateTime.split(':')[0];
		let minutes = user.updateTime.split(':')[1];
		if (now.getHours() >= hours && now.getMinutes() >= minutes) {
			console.log('TIME IS GOOD');
			fireBaseInterface.getUpdate(message.user).once('value').then(snapshot => {
				let updates = snapshot.val();
				update = updates ? updates[Object.keys(updates)[0]] : null;
				let updateRef = updates ? snapshot.child(Object.keys(updates)[0]).ref : null;
				var date = update ? new Date(update.date) : new Date();

				if (
					update &&
					date.getDate() === now.getDate() &&
					date.getMonth() === now.getMonth() &&
					date.getFullYear() === now.getFullYear()
				) {
					console.log('SAME!');
					if (!update.today) {
						fireBaseInterface.editUpdate(updateRef, {
							today: message.text
						});
						rtm.sendMessage('Anything standing in your way?', ims[user_id]);
					} else if (!update.blockers) {
						fireBaseInterface.editUpdate(updateRef, {
							blockers: message.text
						});
						rtm.sendMessage('Thanks! Chat again tomorrow :)', ims[user_id]);
					} else {
						rtm.sendMessage(
							'Why are you still here? I already have your status for today. Now get back to work before I report you.',
							ims[user_id]
						);
					}
				} else {
					let d = new Date();
					update = fireBaseInterface.postUpdate({
						yesterday: message.text,
						user: message.user,
						date: d.toLocaleString()
					});
					rtm.sendMessage('And today?', ims[user_id]);
				}
			});
		} else {
			rtm.sendMessage(
				"I'm not ready yet! If you want to do status updates earlier then update your time with `/statusbot time hh:mm`",
				ims[user_id]
			);
		}
	});

	// if (message.channel === im && message.user === channel && current) {
	// 	if (!update) {
	// 		let d = new Date();
	// 		update = fireBaseInterface.postUpdate({
	// 			yesterday: message.text,
	// 			user: message.user,
	// 			date: d.toLocaleString()
	// 		});
	// 		rtm.sendMessage('What will you work on today?', im);
	// 	} else if (current === 'yesterday') {
	// 		current = 'today';
	// 	} else if (current === 'today') {
	// 		fireBaseInterface.editUpdate(update, {
	// 			blockers: message.text
	// 		});
	// 		rtm.sendMessage('Thanks! Chat again tomorrow :)', im);
	// 		current = null;
	// 	}
	// }
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
		ims[i.user] = i.id;
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

	fireBaseInterface.on(
		'users',
		'value',
		users => {
			for (key in users) {
				updateUser(users[key], key);
			}
		},
		true
	);

	fireBaseInterface.on('users', 'child_changed', updateUser);
});

function updateUser(user, key) {
	var rule = new schedule.RecurrenceRule();
	rule.dayOfWeek = [1, new schedule.Range(2, 5)];
	rule.hour = user.updateTime.split(':')[0];
	rule.minute = user.updateTime.split(':')[1];

	scheduleRegistry[key] && scheduleRegistry[key].cancel();
	console.log('ADDING NEW SCHEDULE...', user.updateTime);
	var j = schedule.scheduleJob(rule, function() {
		update = null;
		current = 'yesterday';
		web.chat.postMessage(
			'@' + user.name,
			'What did you work on yesterday?',
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

	scheduleRegistry[key] = j;
}

var web = new WebClient(bot_token);
// web.chat.postMessage('@peter', '', { as_user: true, attachments: attachments }, function(err, res) {
// 	if (err) {
// 		console.log('Error:', err);
// 	} else {
// 		console.log('Message sent: ', res);
// 	}
// });

let connect = rtm.connect('https://slack.com/api/rtm.connect');
