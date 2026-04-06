// importing the main firebase 
import { deleteApp, initializeApp } from "firebase/app";
// to manage authentication 
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signOut,
} from "firebase/auth";
// to create the database 
import { getFirestore } from "firebase/firestore";
// contains the unique identifiers and keys \
//Firebase web API keys are safe to be exposed in 
// frontend code, as security is handled by Firestore Security Rules).
// Arjun M K 
const firebaseConfig = {
  apiKey: "AIzaSyCS0fTV7lIFlbJuiqQAqiC5ir8eeAqOgbE",
  authDomain: "hospitalmanagementsystem-ee3ec.firebaseapp.com",
  projectId: "hospitalmanagementsystem-ee3ec",
  storageBucket: "hospitalmanagementsystem-ee3ec.firebasestorage.app",
  messagingSenderId: "857155274878",
  appId: "1:857155274878:web:a5da44a49fa3efcfb8f02f",
  measurementId: "G-YZB3V898FN"
}; 

// Mohith 
/* 
const firebaseConfig = {
  apiKey: "AIzaSyARB6QiHUBSdB327a3_hg5bRunbYQr7PGQ",
  authDomain: "hmsproject-df549.firebaseapp.com",
  projectId: "hmsproject-df549",
  storageBucket: "hmsproject-df549.firebasestorage.app",
  messagingSenderId: "508087560588",
  appId: "1:508087560588:web:0adb6d5de06257ab864ea9"
};
 */
// wake up , the app 
const app = initializeApp(firebaseConfig);
// get the authentication and database from firebase 

export const auth = getAuth(app);
export const db = getFirestore(app); 

export { firebaseConfig };
// exporting the config (app and db) so that other parts of code can use this 
// save the users login token in the browsers local storage 
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to enable Firebase auth persistence", error);
});

export async function createDoctorAuthAccount(email, password) {
  const secondaryApp = initializeApp(firebaseConfig, `doctor-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // when you call createuserwithemailandpassword , 
    // firebase automatically logs that new user in . and if a admin is currently 
    // logged in and trying to 
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    await signOut(secondaryAuth);
    return credential.user;
  } finally {
    await deleteApp(secondaryApp); 
    // clearing the secondary app , good for flushing the memory 
    // to prevent memory leaks 
  }
}

