// Import FirebaseAuth and firebase.
import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';

import StyledFirebaseAuth from './StyledFirebaseAuth';
import { auth } from './_vender/firebase';
import './firebaseui-styling.global.css';

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

function SignInScreen() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, []);

  return (
    <div className='flex items-center justify-end gap-2 p-2 min-h-[3.5rem]'>
      {isSignedIn ? (
        <>
          <span>{auth.currentUser?.displayName}</span>
          <button
            className='bg-gray-800 rounded p-2'
            onClick={() => auth.signOut()}
          >
            Sign-out
          </button>
        </>
      ) : (
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
      )}
    </div>
  );
}

export default SignInScreen;
