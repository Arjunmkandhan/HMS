// Firebase setup:
// This file is the single integration point between the React frontend and Firebase.
// Every feature that needs authentication or Firestore imports from here instead of
// creating its own Firebase app instance.
import { deleteApp, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase project configuration:
// These values tell the frontend which Firebase project to connect to.
// In Firebase web apps, these keys are expected to be present in the client bundle.
const firebaseConfig = {
  apiKey: "AIzaSyCS0fTV7lIFlbJuiqQAqiC5ir8eeAqOgbE",
  authDomain: "hospitalmanagementsystem-ee3ec.firebaseapp.com",
  projectId: "hospitalmanagementsystem-ee3ec",
  storageBucket: "hospitalmanagementsystem-ee3ec.firebasestorage.app",
  messagingSenderId: "857155274878",
  appId: "1:857155274878:web:a5da44a49fa3efcfb8f02f",
  measurementId: "G-YZB3V898FN",
};

// Primary Firebase app:
// The whole website shares this app instance for normal login, logout, and database access.
const app = initializeApp(firebaseConfig);

// Exported service instances:
// `auth` is used in login pages, protected routes, and logout handlers.
// `db` is used throughout the dashboards to read and write hospital data.
export const auth = getAuth(app);
export const db = getFirestore(app);

// Exporting the config can help if another module ever needs to create a second app.
export { firebaseConfig };

// Session persistence:
// This keeps the Firebase login session in browser local storage so users stay signed in
// across refreshes until they explicitly log out.
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to enable Firebase auth persistence", error);
});

// Doctor account creation helper:
// The admin dashboard uses this function when creating doctor accounts.
// A second temporary Firebase app is required because `createUserWithEmailAndPassword`
// automatically signs in as the newly created user. Without a secondary app, the admin
// would accidentally be logged out and replaced by the doctor account they just created.
export async function createDoctorAuthAccount(email, password) {
  // A unique app name ensures Firebase creates a fresh temporary app instance.
  const secondaryApp = initializeApp(firebaseConfig, `doctor-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // Create the Firebase Authentication account for the new doctor.
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    // Sign out of the temporary auth session so the admin session remains untouched.
    await signOut(secondaryAuth);
    return credential.user;
  } finally {
    // Clean up the temporary app instance to avoid memory leaks.
    await deleteApp(secondaryApp);
  }
}
