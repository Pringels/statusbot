import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

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

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
