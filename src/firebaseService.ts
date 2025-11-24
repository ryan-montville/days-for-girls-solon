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
    DocumentSnapshot,
    setDoc
} from "firebase/firestore";
import { Event, SignUpEntry, DonatePageContent } from "./models.js";
import { db } from "./firebase.js";

//Global Firebase Variables
declare const __app_id: string;
const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Helper function to get the base collection path
function getCollectionRef(collectionName: string): CollectionReference<any> {
    const path = `/artifacts/${appId}/public/data/${collectionName}`; 
    return collection(db, path);
}

function mapDocToDonateContent(docSnap: DocumentSnapshot<any>): DonatePageContent {
    return docSnap.data() as DonatePageContent;
}

function mapDocToEvent(docSnap: DocumentSnapshot<any>): Event {
    const data = docSnap.data() as Omit<Event, 'eventId'>;
    return {
        ...data,
        eventId: docSnap.id,
    } as Event;
}

function mapDocToSignUpEntry(docSnap: DocumentSnapshot<any>): SignUpEntry {
    const data = docSnap.data() as Omit<SignUpEntry, 'entryId'>;
    return {
        ...data,
        entryId: docSnap.id, 
    } as SignUpEntry;
}

/* ---------------- Events ---------------- */
export async function getAllEvents(): Promise<Event[]> {
    try {
        const events: Event[] = [];
        const q = query(getCollectionRef('events'));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
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
        const docRef = doc(getCollectionRef('events'), eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
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
        const docRef = doc(getCollectionRef('events'), eventId);
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

export async function getSignUpEntriesForEventId(eventId: string): Promise<SignUpEntry[]> {
    try {
        const entries: SignUpEntry[] = [];
        //Create a query to filter documents where eventId matches the provided ID
        const q = query(getCollectionRef('signUpEntries'), where('eventId', '==', eventId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            entries.push(mapDocToSignUpEntry(doc));
        });

        return entries;
    } catch (error) {
        console.error(`Error fetching sign-up entries for event ${eventId}:`, error);
        return [];
    }
}

export async function getSignUpEntryById(entryId: string): Promise<SignUpEntry | null> {
    try {
        const docRef = doc(getCollectionRef('signUpEntries'), entryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
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

export async function deleteSignUpEntry(entryId: string): Promise<boolean> {
    try {
        const docRef = doc(getCollectionRef('signUpEntries'), entryId);
        await deleteDoc(docRef);
        console.log(`Sign-up entry deleted successfully: ${entryId}`);
        return true;
    } catch (error) {
        console.error(`Error deleting sign-up entry ${entryId}:`, error);
        return false;
    }
}

/* ---------------- Donate Page Content (Single Document) ---------------- */
export async function addDonatePageContent(content: string): Promise<boolean> {
    try {
        const docRef = doc(getCollectionRef('donatePage'), 'donate-page-content');
        const newContent: DonatePageContent = {
            content: content,
            lastUpdated: Timestamp.now()
        };
        await setDoc(docRef, newContent); 
        console.log(`Initial donate page content added/set with ID: ${'donate-page-content'}`);
        return true;
    } catch (error) {
        console.error("Error adding donate page content:", error);
        return false;
    }
}

export async function getDonatePageContent(): Promise<DonatePageContent | null> {
    try {
        const docRef = doc(getCollectionRef('donatePage'), 'donate-page-content');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapDocToDonateContent(docSnap);
        } else {
            console.warn(`No donate page content found at ID: ${'donate-page-content'}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching donate page content:", error);
        return null;
    }
}

export async function updateDonatePageContent(content: string): Promise<boolean> {
    try {
        const docRef = doc(getCollectionRef('donatePage'), 'donate-page-content');
        await updateDoc(docRef, {
            content: content,
            lastUpdated: Timestamp.now()
        });
        console.log(`Donate page content updated at ID: ${'donate-page-content'}`);
        return true;
    } catch (error) {
        console.error("Error updating donate page content:", error);
        return false;
    }
}