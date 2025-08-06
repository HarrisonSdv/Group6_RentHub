// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQTFgrOGdynLcdnFDE2z7hExab-SdjR0w",
  authDomain: "group6renthub.firebaseapp.com",
  projectId: "group6renthub",
  storageBucket: "group6renthub.firebasestorage.app",
  messagingSenderId: "384063604407",
  appId: "1:384063604407:web:3927875c18415fd119ef32"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);
