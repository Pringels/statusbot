const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;

const tasks = require('./kue');
const userModel = require('../models/user.js');
const updateModel = require('../models/update.js');

const schedule = require('node-schedule');

const bot_token = process.env.SLACK_BOT_TOKEN;
const rtm = new RtmClient(bot_token);

const slackInterface = {
    rateLimitTimeout: 1200,
    users: {},
    ims: {},
    channelMap: {},
    userChannels: [],
    scheduleRegistry: {},
    init() {
        return new Promise(resolve => {
            rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, rtmStartData => {
                this.getChannelData(rtmStartData);
                console.log(
                    `Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`
                );
            });
            this.webClient = new WebClient(bot_token);
            tasks.init();
            this.registerHandlers();
            this.addUserMessageEventListener();
            rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, resolve);
            connect = rtm.connect('https://slack.com/api/rtm.connect');
        });
    },
    addUserMessageEventListener() {
        rtm.on(RTM_EVENTS.MESSAGE, message => {
            if (
                this.userChannels.includes(message.user) &&
                message.channel[0] !== 'C' &&
                message.user !== 'U6E132Y20'
            ) {
                userModel.get(message.user).then(user => {
                    if (!user) {
                        this.createUser(message);
                        return;
                    }
                    var now = new Date();
                    if (now.getHours() >= user.hours) {
                        updateModel.get(user.id).then(update => {
                            if (update && update.dateMatchesNow()) {
                                let { response, done } = update.setStatus(message);
                                tasks.addTask('question', {
                                    text: response,
                                    im: this.ims[user.id]
                                });
                                done && tasks.addTask('channelStatusUpdate', update);
                            } else {
                                updateModel.createNew(message, user);
                                tasks.addTask('question', {
                                    text: 'And today?',
                                    im: this.ims[user.id]
                                });
                            }
                        });
                    } else {
                        tasks.addTask('question', {
                            text:
                                "I'm not ready yet! If you want to do status updates earlier then update your time with `/statusbot time hh:mm`",
                            im: this.ims[user.id]
                        });
                    }
                });
            } else {
                if (
                    message.subtype === 'message_changed' &&
                    this.userChannels.includes(message.message.user) &&
                    message.channel[0] !== 'C' &&
                    message.message.user !== 'U6E132Y20'
                ) {
                    this.handleEditedMessage(message.message, message.previous_message);
                }
            }
        });
    },
    handleEditedMessage(message, previous_message) {
        updateModel.get(message.user).then(update => {
            if (update) {
                let promise = Promise.reject();
                if (update.yesterday === previous_message.text) {
                    promise = update.editStatus('yesterday', message.text);
                } else if (update.today === previous_message.text) {
                    promise = update.editStatus('today', message.text);
                } else if (update.blockers === previous_message.text) {
                    promise = update.editStatus('blockers', message.text);
                }
                promise.then(update => {
                    updateModel
                        .get(message.user)
                        .then(update => tasks.addTask('channelStatusEdit', update));
                });
            }
        });
    },
    registerHandlers() {
        const registerRateLimitedBoundHandler = (type, fn) =>
            tasks.registerTaskHandler(type, fn.bind(this), this.rateLimitTimeout);
        registerRateLimitedBoundHandler('initialMessage', this.sendInitialUserMessage);
        registerRateLimitedBoundHandler('channelStatusUpdate', this.sendChannelUpdate);
        registerRateLimitedBoundHandler('channelStatusEdit', this.editChannelUpdate);
        registerRateLimitedBoundHandler('commandResponse', this.sendCommandResponse);
        registerRateLimitedBoundHandler('question', this.sendQuestion);
    },
    getChannelData(rtmStartData) {
        Object.values(rtmStartData.users).map(user => (this.users[user.id] = user.name));
        Object.values(rtmStartData.ims).map(im => (this.ims[im.user] = im.id));
        Object.values(rtmStartData.channels).map(
            channel => (this.channelMap[channel.name] = channel.id)
        );
    },
    createUser({ user }) {
        fireBaseInterface.createUser(message.user, this.users[user]);
        tasks.addTask('commandResponse', {
            text: 'Gotcha ' + users[user] + '. See you tomorrow at 8:30!',
            user: ims[user]
        });
    },
    updateSchedule(user, userId) {
        let date = new Date();
        let rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [1, new schedule.Range(2, 5)];

        rule.hour = user.updateTime.split(':')[0];
        rule.minute = user.updateTime.split(':')[1];
        this.userChannels.push(userId);
        this.scheduleRegistry[userId] && this.scheduleRegistry[userId].cancel();
        this.scheduleRegistry[userId] = schedule.scheduleJob(rule, () =>
            tasks.addTask('initialMessage', user)
        );
    },
    sendInitialUserMessage({ name }, done) {
        this.webClient.chat.postMessage(
            '@' + name,
            'What did you work on yesterday?',
            { as_user: true },
            (err, res) => {
                if (err) {
                    console.log(`FAILED TO SEND INITIAL USER MESSAGE FOR ${name}`, err);
                } else {
                    console.log('Message sent: ', res);
                    done();
                }
            }
        );
    },
    sendChannelUpdate(update, done) {
        updateModel.get(update.user).then(update => {
            this.webClient.chat.postMessage(
                update.channel,
                '',
                generateAttachment(update),
                (err, res) => {
                    err
                        ? console.log(
                              `FAILED TO SEND CHANNEL UPDATE TO ${update.channel} FROM ${update.user}: `,
                              err
                          )
                        : console.log('Message sent: ', res);
                    update.editStatus('ts', res.ts);
                    done();
                }
            );
        });
    },
    editChannelUpdate(update, done) {
        try {
            this.webClient.chat.update(
                update.ts,
                this.channelMap[update.channel],
                '',
                generateAttachment(update),
                (err, res) => {
                    err
                        ? console.log('FAILED TO EDIT CHANNEL UPDATE:', err)
                        : console.log('Message sent: ', res);
                    done();
                }
            );
        } catch (error) {
            console.error('FAILED TO EDIT CHANNEL UPDATE: ', error);
            done();
        }
    },
    sendCommandResponse({ text, user }, done) {
        rtm.sendMessage(text, user);
        done();
    },
    sendQuestion({ text, im }, done) {
        rtm.sendMessage(text, im);
        done();
    }
};

generateAttachment = ({ yesterday, user, today, blockers }) => ({
    as_user: true,
    attachments: [
        {
            fallback: yesterday,
            color: '#aaffaa',
            pretext: `<@${user}>`,
            title: 'Yesterday',
            text: yesterday,
            mrkdwn_in: ['text']
        },
        {
            fallback: today,
            color: '#36a64f',
            title: 'Today',
            text: today,
            mrkdwn_in: ['text']
        },
        {
            fallback: blockers,
            color: '#f44f34',
            title: 'Blockers',
            text: blockers,
            mrkdwn_in: ['text']
        }
    ]
});

module.exports = slackInterface;
