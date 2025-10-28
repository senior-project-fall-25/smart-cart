// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: issue with Reactnative persistence feature
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxxMAIswvO4AmEAgKkuz9AngO43exNmJ4",
  authDomain: "smartcart-5cb29.firebaseapp.com",
  projectId: "smartcart-5cb29",
  storageBucket: "smartcart-5cb29.firebasestorage.app",
  messagingSenderId: "1004457801974",
  appId: "1:1004457801974:web:e2d78eb28dfe8f9c2a54d7",
  measurementId: "G-7NQS9DSE06"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);
// export const auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage),
// });
export const db = getFirestore(app);
export const storage = getStorage(app);