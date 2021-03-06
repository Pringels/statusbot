import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import statusBot from './reducers/statusBot';
import * as statusBotActions from './actions/statusBot';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

let store = createStore(
    statusBot,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

// Leave out Storage
//require("firebase/storage");

var config = {
    apiKey: 'AIzaSyCoJU8iEOuB0QmfwFLvIRNjJsu7EbU_imM',
    authDomain: 'statusbot-94e36.firebaseapp.com',
    databaseURL: 'https://statusbot-94e36.firebaseio.com',
    projectId: 'statusbot-94e36',
    storageBucket: 'statusbot-94e36.appspot.com',
    messagingSenderId: '604228993496'
};
firebase.initializeApp(config);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
//registerServiceWorker();

/**
     * Function called when clicking the Login/Logout button.
     */
// [START buttoncallback]
function toggleSignIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    // [END createprovider]
    // [START addscopes]
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    // [END addscopes]
    // [START signin]
    firebase.auth().signInWithRedirect(provider);
    // [END signin]
}
// [END buttoncallback]
/**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
     *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
     */
function initApp() {
    // Result from Redirect auth flow.
    // [START getidptoken]
    firebase
        .auth()
        .getRedirectResult()
        .then(function(result) {
            if (result.credential) {
                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = result.credential.accessToken;
                // [START_EXCLUDE]
            } else {
                // [END_EXCLUDE]
            }
            // The signed-in user info.
            var user = result.user;

            if (window.localStorage.getItem('statusbot_token')) {
                user = window.localStorage.getItem('statusbot_token');
            }

            if (user) {
                store.dispatch(statusBotActions.setAuth(user));
                user != window.localStorage.getItem('statusbot_token') &&
                    window.localStorage.setItem('statusbot_token', user.o);

                firebase
                    .database()
                    .ref('users')
                    .on('value', dataSnapshot => {
                        store.dispatch(statusBotActions.getUsers(dataSnapshot.val()));
                    });
                firebase
                    .database()
                    .ref('updates')
                    .on('value', dataSnapshot => {
                        store.dispatch(statusBotActions.getUpdates(dataSnapshot.val()));
                    });
            } else {
                store.dispatch(statusBotActions.setAuth(null));
            }
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // [START_EXCLUDE]
            if (errorCode === 'auth/account-exists-with-different-credential') {
                alert('You have already signed up with a different auth provider for that email.');
                // If you are using multiple auth providers on your app you should handle linking
                // the user's accounts here.
            } else {
                console.error(error);
            }
            // [END_EXCLUDE]
        });
    // [END getidptoken]
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            // [START_EXCLUDE]
            // [END_EXCLUDE]
        } else {
            // User is signed out.
            // [START_EXCLUDE]
            // [END_EXCLUDE]
        }
        // [START_EXCLUDE]
        // [END_EXCLUDE]
    });
    // [END authstatelistener]
    window.addEventListener('click', e => {
        e.target.id === 'quickstart-sign-in' && toggleSignIn();
    });
}
window.onload = function() {
    initApp();
};
