import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration (use environment variables!)
const firebaseConfig = {
    apiKey: "AIzaSyB1WSIsFnVeWHSVT49d7F6oJ1fSKGy1Lqw",
    authDomain: "days-for-girls-solon.firebaseapp.com",
    projectId: "days-for-girls-solon",
    storageBucket: "days-for-girls-solon.firebasestorage.app",
    messagingSenderId: "346609262014",
    appId: "1:346609262014:web:84575a258a86b63069edef",
    measurementId: "G-WL4JF18LVH"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
