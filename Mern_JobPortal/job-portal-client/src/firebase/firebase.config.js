// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeN34KyYeJXq6UfqZ3t4a8PgU7q_81D18",
  authDomain: "mern-job-portal-ddba8.firebaseapp.com",
  projectId: "mern-job-portal-ddba8",
  storageBucket: "mern-job-portal-ddba8.firebasestorage.app",
  messagingSenderId: "499557113466",
  appId: "1:499557113466:web:a67989eb77d1ad4e51a5c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;