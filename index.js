var fireBaseInterface = require('./interfaces/firebase.js');
var serverInterface = require('./server.js');

const slackInterface = require('./interfaces/slack.js');

fireBaseInterface.init();
serverInterface.init(fireBaseInterface);

slackInterface.init().then(() => {
    // Create new schedules for all users.
    fireBaseInterface.on(
        'users',
        'value',
        users => Object.keys(users).map(key => slackInterface.updateSchedule(users[key], key)),
        true
    );
    // Update users' schedules when a user property changes
    fireBaseInterface.on(
        'users',
        'child_changed',
        slackInterface.updateSchedule.bind(slackInterface)
    );
});
