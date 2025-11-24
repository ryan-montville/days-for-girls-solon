import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    increment,
    CollectionReference,
    DocumentSnapshot
} from "firebase/firestore";
import { Event, SignUpEntry } from "./models.js";
import { db } from "./firebase.js";

//Global Firebase Variables
declare const __app_id: string;
const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Helper function to get the base collection path
function getCollectionRef(collectionName: string): CollectionReference<any> {
    // Path structure: /artifacts/{appId}/public/data/{collectionName}
    const path = `/artifacts/${appId}/public/data/${collectionName}`; 
    return collection(db, path);
}

// --- NEW HELPER FUNCTIONS ---

/**
 * Maps a Firestore DocumentSnapshot to a complete Event interface, including the document ID.
 */
function mapDocToEvent(docSnap: DocumentSnapshot<any>): Event {
    const data = docSnap.data() as Omit<Event, 'eventId'>;
    return {
        ...data, // Spread data fields first
        eventId: docSnap.id, // Set the document ID LAST to ensure it is not overwritten
    } as Event;
}

/**
 * Maps a Firestore DocumentSnapshot to a complete SignUpEntry interface, including the document ID.
 */
function mapDocToSignUpEntry(docSnap: DocumentSnapshot<any>): SignUpEntry {
    const data = docSnap.data() as Omit<SignUpEntry, 'entryId'>;
    return {
        ...data, // Spread data fields first
        entryId: docSnap.id, // Set the document ID LAST to ensure it is not overwritten
    } as SignUpEntry;
}

/* ---------------- Events ---------------- */
export async function getAllEvents(): Promise<Event[]> {
    try {
        const events: Event[] = [];
        const q = query(getCollectionRef('events'));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            // Updated to use the new helper function
            events.push(mapDocToEvent(doc));
        });
        return events;
    } catch (error) {
        console.error("Error fetching all events:", error);
        return [];
    }
}

export async function getEventById(eventId: string): Promise<Event | null> {
    try {
        // FIX: Use doc(collectionRef, docId) instead of passing path string segments
        const docRef = doc(getCollectionRef('events'), eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Updated to use the new helper function
            return mapDocToEvent(docSnap);
        } else {
            console.warn("No such event document found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching event:", error);
        throw error;
    }
}

export async function addEvent(newEventData: Omit<Event, 'eventId'>): Promise<string> {
    try {
        const docRef = await addDoc(getCollectionRef('events'), newEventData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
}

export async function updateEvent(eventId: string, updatedEvent: Event): Promise<boolean> {
    try {
        // FIX: Use doc(collectionRef, docId) instead of passing path string segments
        const docRef = doc(getCollectionRef('events'), eventId);
        // Remove eventId property before updating to prevent issues if it's included in the object
        const { eventId: _, ...updateData } = updatedEvent; 
        await updateDoc(docRef, updateData as any);
        console.log(`Event updated successfully: ${eventId}`);
        return true;
    } catch (error) {
        console.error("Error updating event:", error);
        return false;
    }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
    try {
        // FIX: Use doc(collectionRef, docId) instead of passing path string segments
        const docRef = doc(getCollectionRef('events'), eventId);
        await deleteDoc(docRef);
        console.log(`Event deleted successfully: ${eventId}`);
        return true;
    } catch (error) {
        console.error("Error deleting event:", error);
        return false;
    }
}

export async function updateNumberAttending(eventId: string, isIncrement: boolean): Promise<boolean> {
    try {
        //Get the reference for the event
        const docRef = doc(getCollectionRef('events'), eventId);
        //Determine whether to add or subtract 1 from the numAttending
        const changeValue = isIncrement ? 1 : -1;
        //Update the numAttending
        await updateDoc(docRef, {
             //Atomically adds 1 or -1
            numberAttending: increment(changeValue)
        });
        return true;
    } catch (error) {
        console.error("Error updating numberAttending:", error);
        return false;
    }
}

/* ---------------- Event Sign Up ---------------- */

/**
 * Adds a new sign-up entry to the 'signUpEntries' collection.
 * @param newEntryData The sign-up data without the entryId.
 * @returns The ID of the newly created document.
 */
export async function addSignUpEntry(newEntryData: Omit<SignUpEntry, 'entryId'>): Promise<string> {
    try {
        const docRef = await addDoc(getCollectionRef('signUpEntries'), newEntryData);
        console.log(`Sign-up entry added with ID: ${docRef.id} for Event: ${newEntryData.eventId}`);
        return docRef.id;
    } catch (error) {
        console.error("Error adding sign-up entry:", error);
        throw error;
    }
}

/**
 * Retrieves all sign-up entries associated with a specific event ID.
 * @param eventId The ID of the event to filter sign-ups by.
 * @returns An array of SignUpEntry objects.
 */
export async function getSignUpEntriesForEventId(eventId: string): Promise<SignUpEntry[]> {
    try {
        const entries: SignUpEntry[] = [];
        // Create a query to filter documents where eventId matches the provided ID
        const q = query(getCollectionRef('signUpEntries'), where('eventId', '==', eventId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            // Updated to use the new helper function
            entries.push(mapDocToSignUpEntry(doc));
        });

        return entries;
    } catch (error) {
        console.error(`Error fetching sign-up entries for event ${eventId}:`, error);
        return [];
    }
}

/**
 * Retrieves a single sign-up entry by its unique entry ID.
 * @param entryId The unique ID of the sign-up entry.
 * @returns The SignUpEntry object or null if not found.
 */
export async function getSignUpEntryById(entryId: string): Promise<SignUpEntry | null> {
    try {
        // FIX: Use doc(collectionRef, docId) instead of passing path string segments
        const docRef = doc(getCollectionRef('signUpEntries'), entryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Updated to use the new helper function
            return mapDocToSignUpEntry(docSnap);
        } else {
            console.warn(`No sign-up entry document found with ID: ${entryId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching sign-up entry ${entryId}:`, error);
        throw error;
    }
}

/**
 * Deletes a sign-up entry by its unique entry ID.
 * @param entryId The unique ID of the sign-up entry to delete.
 * @returns True if deletion was successful, false otherwise.
 */
export async function deleteSignUpEntry(entryId: string): Promise<boolean> {
    try {
        // FIX: Use doc(collectionRef, docId) instead of passing path string segments
        const docRef = doc(getCollectionRef('signUpEntries'), entryId);
        await deleteDoc(docRef);
        console.log(`Sign-up entry deleted successfully: ${entryId}`);
        return true;
    } catch (error) {
        console.error(`Error deleting sign-up entry ${entryId}:`, error);
        return false;
    }
}