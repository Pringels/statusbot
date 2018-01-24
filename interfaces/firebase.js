var firebase = require('firebase');

const fireBaseInterface = {
    init() {
        let proejctId = process.env.FIREBASE_PROJECT_ID;
        var config = {
            apiKey: process.env.FIREBASE_TOKEN,
            authDomain: `${proejctId}.firebaseapp.com`,
            databaseURL: `https://${proejctId}.firebaseio.com`,
            projectId: proejctId,
            storageBucket: `${proejctId}.appspot.com`,
            messagingSenderId: process.env.FIREBASE_SENDER_ID
        };
        firebase.initializeApp(config);
        toggleSignIn();
        initApp();
    },

    getUpdate(user) {
        return firebase
            .database()
            .ref('updates')
            .orderByChild('user')
            .equalTo(user)
            .limitToLast(1);
    },

    getUpdateByTimeStamp(ts) {
        return firebase
            .database()
            .ref('updates')
            .orderByChild('ts')
            .equalTo(ts)
            .limitToLast(1);
    },

    getUpdates() {
        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date = date.toLocaleString();
        return firebase
            .database()
            .ref('updates')
            .orderByChild('date')
            .startAt(date);
    },

    getUser(id) {
        return firebase
            .database()
            .ref('users')
            .child(id);
    },

    postUpdate(update) {
        return firebase
            .database()
            .ref('updates')
            .push(update);
    },

    editUpdate(update, data) {
        return update.update(data);
    },

    createUser(id, name, channel) {
        return firebase
            .database()
            .ref('users')
            .child(id)
            .set({
                name,
                updateTime: '8:30',
                channel: [channel]
            });
    },

    setUpdateTime(id, time) {
        return firebase
            .database()
            .ref('users')
            .child(id)
            .update({
                updateTime: time
            });
    },

    getUserChannels(id) {
        return new Promise((resolve, reject) => {
            let user = firebase
                .database()
                .ref('users')
                .child(id)
                .once('value')
                .then(user => {
                    let currentChannels = user.val().channel;
                    resolve(currentChannels);
                });
        });
    },

    addChannel(id, channel) {
        return new Promise((resolve, reject) => {
            let user = firebase
                .database()
                .ref('users')
                .child(id)
                .once('value')
                .then(user => {
                    let currentChannels = user.val().channel;
                    if (currentChannels.includes(channel)) {
                        reject(
                            "I'm already posting updates to " +
                                channel +
                                '. Have some more coffee...'
                        );
                    } else {
                        resolve();
                        firebase
                            .database()
                            .ref('users')
                            .child(id)
                            .update({
                                channel: [...currentChannels, channel]
                            });
                    }
                });
        });
    },

    removeChannel(id, channel) {
        return new Promise((resolve, reject) => {
            let user = firebase
                .database()
                .ref('users')
                .child(id)
                .once('value')
                .then(user => {
                    let currentChannels = user.val().channel;
                    if (!currentChannels.includes(channel)) {
                        reject(
                            "Err...I couldn't seem to locate " +
                                channel +
                                " in your channels. These are the channels I'm currently posting updates to: " +
                                currentChannels.join(', ')
                        );
                    } else if (currentChannels.length === 1) {
                        reject(
                            "You need to post status updates to at least one channel. How else will we know you're actually doing work?"
                        );
                    } else {
                        resolve();
                        firebase
                            .database()
                            .ref('users')
                            .child(id)
                            .update({
                                channel: [
                                    ...currentChannels.filter(
                                        ch => ch !== channel
                                    )
                                ]
                            });
                    }
                });
        });
    },

    deleteUser(id) {
        return firebase
            .database()
            .ref('users')
            .child(id)
            .remove();
    },

    on(type, event, fn, once = false) {
        var messagesRef = firebase.database().ref(type);
        if (once) {
            messagesRef.once(event, dataSnapshot => {
                let values = dataSnapshot.val();
                let key = dataSnapshot.key;
                fn(values, key);
            });
        } else {
            messagesRef.on(event, dataSnapshot => {
                let values = dataSnapshot.val();
                let key = dataSnapshot.key;
                fn(values, key);
            });
        }
    }
};

function toggleSignIn() {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    } else {
        firebase
            .auth()
            .signInAnonymously()
            .catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode === 'auth/operation-not-allowed') {
                    alert(
                        'You must enable Anonymous auth in the Firebase Console.'
                    );
                } else {
                    console.error(error);
                }
            });
    }
}

function initApp() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var messagesRef = firebase.database().ref('updates');
            messagesRef.on('value', dataSnapshot => {
                let values = dataSnapshot.val();
            });
        } else {
            console.log('Signed out of Firebase');
        }
    });
}

module.exports = fireBaseInterface;
