import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Corrected import
import { getStorage } from "firebase/storage";

const firebaseConfig = {
apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatify-cb270.firebaseapp.com",
  projectId: "chatify-cb270",
  storageBucket: "chatify-cb270.appspot.com",
  messagingSenderId: "411927122585",
  appId: "1:411927122585:web:1246011c4979d4680a1e08",
  measurementId: "G-N7LH4JTNM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // Corrected function name
const storage = getStorage(app);

export { auth, db, storage, analytics };