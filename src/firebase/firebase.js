import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 



const firebaseConfig = {
  apiKey: "AIzaSyC1AAbnl6oj7QGVnfmeeM679NNiq0bEYXc",
  authDomain: "complaint-system-db.firebaseapp.com",
  projectId: "complaint-system-db",
  storageBucket: "complaint-system-db.firebasestorage.app",
  messagingSenderId: "862929055008",
  appId: "1:862929055008:web:8ac50b77548810177abb45",
  measurementId: "G-NHVBMP3RST"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db , storage, firebaseConfig};

