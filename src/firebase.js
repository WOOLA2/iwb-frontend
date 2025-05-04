import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBANU1fS4IejAsHqppRasOAWAdYKIt6Xyo", // Ensure this is the correct API key
  authDomain: "iwbapp.firebaseapp.com",
  projectId: "iwbapp",
  storageBucket: "iwbapp.appspot.com",
  messagingSenderId: "649558059470",
  appId: "1:649558059470:web:b2a31d569460b4b07ae39f" // Ensure this is the correct appId
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
