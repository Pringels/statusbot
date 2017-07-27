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

	postUpdate(update) {
		return firebase.database().ref('updates').push(update);
	},

	editUpdate(update, data) {
		update.update(data);
	},

	on(type, event, fn) {
		var messagesRef = firebase.database().ref(type).limitToLast(1);
		messagesRef.on(event, dataSnapshot => {
			let values = dataSnapshot.val();
			fn(values);
		});
	}
};

/**
     * Handles the sign in button press.
     */
function toggleSignIn() {
	if (firebase.auth().currentUser) {
		// [START signout]
		firebase.auth().signOut();
		// [END signout]
	} else {
		// [START authanon]
		firebase.auth().signInAnonymously().catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// [START_EXCLUDE]
			if (errorCode === 'auth/operation-not-allowed') {
				alert('You must enable Anonymous auth in the Firebase Console.');
			} else {
				console.error(error);
			}
			// [END_EXCLUDE]
		});
		// [END authanon]
	}
}
/**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     */
function initApp() {
	// Listening for auth state changes.
	// [START authstatelistener]
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			var messagesRef = firebase.database().ref('updates');
			messagesRef.on('value', dataSnapshot => {
				let values = dataSnapshot.val();
				//web.chat.postMessage('eng-status', '(@peter) Today: ' + values.peter);
			});
		} else {
			console.log('SIGN OUT');
		}
	});
}

module.exports = fireBaseInterface;
