import firebase from 'firebase/compat/app';
import { getFirestore } from 'firebase/firestore';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAZcea_0-196wy75fNYKqOsSOPaZoZVDQM',
  authDomain: 'tamagotchi-66e1c.firebaseapp.com',
  projectId: 'tamagotchi-66e1c',
  storageBucket: 'tamagotchi-66e1c.appspot.com',
  messagingSenderId: '912013731576',
  appId: '1:912013731576:web:0a76b46794c82c660e3d0d',
  measurementId: 'G-1G9DYCELSB',
};
export const app = firebase.initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = app.auth();
