import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'semantic-ui-css/semantic.min.css';
import * as firebase from 'firebase/app'
import 'firebase/firestore'


firebase.initializeApp({
    apiKey: "AIzaSyDi_2g9USHTtuketPcEHa2tBZwMNFZMF30",
    authDomain: "jukebox-2952e.firebaseapp.com",
    databaseURL: "https://jukebox-2952e.firebaseio.com",
    projectId: "jukebox-2952e",
    storageBucket: "jukebox-2952e.appspot.com",
  });
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();
  
  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true
  });

ReactDOM.render(<App dbRef={db} />, document.getElementById('root'));
registerServiceWorker();
