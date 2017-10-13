var fireBaseInterface = require('../interfaces/firebase.js');

const update = {
    user: null,
    channel: null,
    date: null,
    today: null,
    yesterday: null,
    blockers: null,
    ref: null,
    dateMatchesNow() {
        var now = new Date();
        return (
            this.date.getDate() === now.getDate() &&
            this.date.getMonth() === now.getMonth() &&
            this.date.getFullYear() === now.getFullYear()
        );
    },
    setStatus({ text }) {
        if (!this.today) {
            fireBaseInterface.editUpdate(this.ref, {
                today: text
            });
            this.today = text;
            return {
                response: 'Anything standing in your way?'
            };
        } else if (!this.blockers) {
            fireBaseInterface.editUpdate(this.ref, {
                blockers: text
            });
            this.blockers = text;
            return {
                response: 'Thanks! Chat again tomorrow :)',
                done: true
            };
        } else {
            return {
                response:
                    'Why are you still here? I already have your status for today. Now get back to work before I report you.'
            };
        }
    },
    editStatus(key, value) {
        return fireBaseInterface.editUpdate(this.ref, {
            [key]: value
        });
    }
};

const updateFactory = {
    get(id) {
        return new Promise(resolve =>
            fireBaseInterface
                .getUpdate(id)
                .once('value')
                .catch(err => console.log('PROMISE ERROR: fireBaseInterface.getUpdate(id) - ', err))
                .then(snapshot => {
                    let updates = snapshot.val();
                    singleUpdate = updates ? updates[Object.keys(updates)[0]] : null;
                    let updateRef = updates ? snapshot.child(Object.keys(updates)[0]).ref : null;
                    var date = singleUpdate ? new Date(singleUpdate.date) : new Date();
                    resolve(Object.assign({}, update, singleUpdate, { date, ref: updateRef }));
                })
        );
    },
    getByTimeStamp() {
        return new Promise(resolve =>
            fireBaseInterface
                .getUpdateByTimeStamp(ts)
                .once('value')
                .catch(err =>
                    console.log('PROMISE ERROR: fireBaseInterface.getUpdateByTimeStamp(id) - ', err)
                )
                .then(snapshot => {
                    let updates = snapshot.val();
                    singleUpdate = updates ? updates[Object.keys(updates)[0]] : null;
                    let updateRef = updates ? snapshot.child(Object.keys(updates)[0]).ref : null;
                    var date = singleUpdate ? new Date(singleUpdate.date) : new Date();
                    resolve(Object.assign({}, update, singleUpdate, { date, ref: updateRef }));
                })
        );
    },
    createNew(message, user) {
        console.log('Creating new update for ', message.user, user.channel);
        let d = new Date();
        fireBaseInterface
            .postUpdate({
                yesterday: message.text,
                user: message.user,
                date: d.toLocaleString(),
                channel: user.channel
            })
            .catch(err => console.error('Error while creating new update: ', err));
    }
};

module.exports = updateFactory;
