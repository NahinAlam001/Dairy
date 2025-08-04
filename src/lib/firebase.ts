import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCIuwuowyPxhhc0nWkf8YKUMCBRdPRk4y0",
  authDomain: "myvirtualdiary-f99ef.firebaseapp.com",
  projectId: "myvirtualdiary-f99ef",
  // This is the corrected line:
  storageBucket: "myvirtualdiary-f99ef.firebasestorage.app",
  messagingSenderId: "1055161909574",
  appId: "1:1055161909574:web:c0a4ed37a799f07dff2547",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
