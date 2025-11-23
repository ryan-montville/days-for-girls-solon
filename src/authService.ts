import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    UserCredential,
    User,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase.js";
import { createMessage } from "./utils.js";

//Register a new user and sign them in
export async function registerUser(email: string, password: string): Promise<UserCredential> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        createMessage(`Error during user registration: ${error}`, 'sign-in-message', 'error');
        throw error;
    }
}

export async function signInUSers(email: string, password: string): Promise<UserCredential> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        createMessage(`Error during user login: ${error}`, 'sign-in-message', 'error');
        throw error;
    }
}

export async function SignOutUser(): Promise<void> {
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

export async function signInWithGooglePopup() {
    //Create new instance of Google Auth Provider
    const provider = new GoogleAuthProvider();
    try {
        //Open the pop-up window and wait for the user to sign in
        const result = await signInWithPopup(auth, provider);
        // The signed-in user info is in the 'result.user'
        console.log("Successfully signed in with Google:", result.user.uid);
        
        // This is where you can get the Google Access Token if needed
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential?.accessToken;

        return result;
    } catch (error: any) {
        createMessage(`Error during Google Sign-In: ${error}`, 'main-message', 'error');
        throw error;
    }
}