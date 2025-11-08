import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 



const firebaseConfig = {
  apiKey: "AIzaSyCck-c9obxDRT3Scw1BCyD0Z71NQxX1jCI",
  authDomain: "bbcomplaintsystem.firebaseapp.com",
  projectId: "bbcomplaintsystem",
  storageBucket: "bbcomplaintsystem.appspot.com",
  messagingSenderId: "26816550019",
  appId: "1:26816550019:web:51ef9c35605e339aa6f7b6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db , storage};

