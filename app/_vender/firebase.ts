import firebase from 'firebase/compat/app';
import { getFirestore } from 'firebase/firestore';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAD-W1wWSMvfe2ke-VJzovNFY3h4jjwwM0',
  authDomain: 'taglyze.firebaseapp.com',
  projectId: 'taglyze',
  storageBucket: 'taglyze.appspot.com',
  messagingSenderId: '860716123071',
  appId: '1:860716123071:web:9c3530f74b5174a3cc970a',
  measurementId: 'G-2KG8KWPH2L',
};
export const app = firebase.initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = app.auth();
