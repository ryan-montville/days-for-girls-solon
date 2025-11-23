import { collection, CollectionReference } from "firebase/firestore";
import { addDoc, getDocs, doc, getDoc, DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "./firebase.js";
import { Event } from "./models.js";

//Firebase collections
export const eventsCollection = collection(db, "events") as CollectionReference<Event>;


/* ---------------- Events ---------------- */
export async function getAllEvents(): Promise<Event[]> {
    try {
        const querySnapshot: QuerySnapshot<Event, DocumentData> = await getDocs(eventsCollection);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching all events:", error);
        throw error;
    }
}

export async function addEvent(newEventData: Omit<Event, 'eventId'>): Promise<string> {
    try {
        // You'll likely need to adjust the structure if your model includes an ID field
        const docRef = await addDoc(eventsCollection, newEventData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
}