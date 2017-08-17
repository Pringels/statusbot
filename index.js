var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var fireBaseInterface = require('./firebase.js');
var serverInterface = require('./server.js');
var schedule = require('node-schedule');
var winston = require('winston');
require('winston-loggly-bulk');
var Throttle = require('./utils/throttle');

const throttle = Object.create(Throttle);
throttle.init({
    delay: 1100,
    retries: 10
});

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
let users = {};
let userChannels = [];

winston.add(winston.transports.Loggly, {
    token: 'e8444aaa-338a-42bb-8ff6-d0162dafed0d',
    subdomain: 'pringelman',
    tags: ['Winston-NodeJS'],
    json: true
});

winston.log('info', 'Restarting app');

let scheduleRegistry = {};

fireBaseInterface.init();
serverInterface.init(fireBaseInterface);

var dailyRule = new schedule.RecurrenceRule();
dailyRule.dayOfWeek = [1, new schedule.Range(2, 5)];
dailyRule.hour = 16;
dailyRule.minute = 30;

var dailyJ = schedule.scheduleJob(dailyRule, function() {
    fireBaseInterface.getUpdates().once('value').then(snapshot => {
        let updates = snapshot.val();
        if (updates) {
            let attachments = Object.values(updates)
                .map(update => [
                    {
                        fallback: update.yesterday,
                        color: '#aaffaa',
                        pretext: `<@${update.user}>`,
                        title: 'Yesterday',
                        text: update.yesterday,
                        mrkdwn_in: ['text']
                    },
                    {
                        fallback: update.today,
                        color: '#36a64f',
                        title: 'Today',
                        text: update.today,
                        mrkdwn_in: ['text']
                    },
                    {
                        fallback: update.blockers,
                        color: '#f44f34',
                        title: 'Blockers',
                        text: update.blockers,
                        mrkdwn_in: ['text']
                    }
                ])
                .reduce((a, b) => a.concat(b), []);

            web.chat.postMessage('eng-status', '', { as_user: true, attachments }, function(
                err,
                res
            ) {
                if (err) {
                    console.log('Error:', err);
                } else {
                    console.log('Message sent: ', res);
                }
            });
        }
    });
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    if (userChannels.includes(message.user) && message.channel[0] !== 'C') {
        fireBaseInterface.getUser(message.user).once('value').then(snapshot => {
            let user = snapshot.val();
            if (!user) {
                console.log('CREATING NEW USER', message.user, users[message.user]);
                winston.log('info', 'Creating new user: ' + message.user);
                fireBaseInterface.createUser(message.user, users[message.user]);
                throttle.call(() =>
                    rtm.sendMessage(
                        'Gotcha ' + users[message.user] + '. See you tomorrow at 8:30!',
                        ims[message.user]
                    )
                );
                return;
            }
            let user_id = snapshot.key;
            console.log('USER', user);
            var now = new Date();
            let hours = user.updateTime.split(':')[0];
            let minutes = user.updateTime.split(':')[1];
            console.log('HOURS', hours, minutes);
            if (now.getHours() >= hours) {
                console.log('TIME IS GOOD');
                fireBaseInterface
                    .getUpdate(message.user)
                    .once('value')
                    .catch(err => {
                        winston.log('error', err);
                        console.log(
                            'PROMISE ERROR: fireBaseInterface.getUpdate(message.user) - ',
                            err
                        );
                    })
                    .then(snapshot => {
                        let updates = snapshot.val();
                        update = updates ? updates[Object.keys(updates)[0]] : null;
                        let updateRef = updates
                            ? snapshot.child(Object.keys(updates)[0]).ref
                            : null;
                        var date = update ? new Date(update.date) : new Date();
                        if (
                            update &&
                            date.getDate() === now.getDate() &&
                            date.getMonth() === now.getMonth() &&
                            date.getFullYear() === now.getFullYear()
                        ) {
                            if (!update.today) {
                                fireBaseInterface.editUpdate(updateRef, {
                                    today: message.text
                                });
                                throttle.call(() =>
                                    rtm.sendMessage('Anything standing in your way?', ims[user_id])
                                );
                            } else if (!update.blockers) {
                                fireBaseInterface.editUpdate(updateRef, {
                                    blockers: message.text
                                });
                                throttle.call(() =>
                                    rtm.sendMessage('Thanks! Chat again tomorrow :)', ims[user_id])
                                );
                            } else {
                                throttle.call(() =>
                                    rtm.sendMessage(
                                        'Why are you still here? I already have your status for today. Now get back to work before I report you.',
                                        ims[user_id]
                                    )
                                );
                            }
                        } else {
                            let d = new Date();
                            update = fireBaseInterface.postUpdate({
                                yesterday: message.text,
                                user: message.user,
                                date: d.toLocaleString(),
                                channel: user.channel
                            });
                            throttle.call(() => rtm.sendMessage('And today?', ims[user_id]));
                        }
                    });
            } else {
                throttle.call(() =>
                    rtm.sendMessage(
                        "I'm not ready yet! If you want to do status updates earlier then update your time with `/statusbot time hh:mm`",
                        ims[user_id]
                    )
                );
            }
        });
    }
});

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, rtmStartData => {
    for (const c of rtmStartData.users) {
        users[c.id] = c.name;
    }

    for (const d of rtmStartData.channels) {
        if (d.name === 'eng-status') {
            statusChannel = d.id;
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
    userChannels.push(key);

    scheduleRegistry[key] && scheduleRegistry[key].cancel();
    console.log('ADDING NEW SCHEDULE...', user.updateTime);
    var j = schedule.scheduleJob(rule, function() {
        update = null;
        current = 'yesterday';
        throttle.call(() =>
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
            )
        );
    });

    scheduleRegistry[key] = j;
}

var web = new WebClient(bot_token);

let connect = rtm.connect('https://slack.com/api/rtm.connect');
