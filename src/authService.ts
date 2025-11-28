import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    UserCredential,
    User,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import { createMessage } from "./utils.js";

//Register a new user and sign them in
// export async function registerUser(email: string, password: string): Promise<UserCredential> {
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         return userCredential;
//     } catch (error) {
//         createMessage(`Error during user registration: ${error}`, 'sign-in-message', 'error');
//         throw error;
//     }
// }

// export async function signInUsers(email: string, password: string): Promise<UserCredential> {
//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         return userCredential;
//     } catch (error) {
//         createMessage(`Error during user login: ${error}`, 'sign-in-message', 'error');
//         throw error;
//     }
// }

export async function signOutUser(): Promise<void> {
    try {
        await signOut(auth);
    } catch (error) {
        createMessage(`Error during user logout: ${error}`, 'sign-in-message', 'error')
        throw error;
    }
}

export function getCurrentUser(): User | null {
    return auth.currentUser;
}

export async function getUserRole(uid: string): Promise<string | null> {
    //Create a reference to the specific user's document
    const userDocRef = doc(db, 'users', uid);
    try {
        //Fetch the document
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            //Extract the 'role' field
            const role = userDoc.data()?.role as string;
            return role || null;
        } else {
            console.log("User role document not found for UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user role from Firestore:", error);
        throw error; 
    }
}

export async function signInWithGooglePopup() {
    //Create new instance of Google Auth Provider
    const provider = new GoogleAuthProvider();
    try {
        //Open the pop-up window and wait for the user to sign in
        const result = await signInWithPopup(auth, provider);
        // The signed-in user info is in the 'result.user'
        console.log("Successfully signed in with Google:", result.user.uid);
        return result;
    } catch (error: any) {
        throw error;
    }
}

export type { User };