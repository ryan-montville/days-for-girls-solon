import { collection, CollectionReference } from "firebase/firestore";
import { addDoc, getDocs, doc, getDoc, DocumentData, QuerySnapshot, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { Event } from "./models.js";

//Firebase collections
export const eventsCollection = collection(db, "events") as CollectionReference<Event>;


/* ---------------- Events ---------------- */
export async function getAllEvents(): Promise<Event[]> {
    try {
        // Fetch all documents from the 'events' collection
        const querySnapshot: QuerySnapshot<Event, DocumentData> = await getDocs(eventsCollection);
        return querySnapshot.docs.map(doc => ({
            eventId: doc.id,
            ...(doc.data() as Omit<Event, 'eventId'>),
        }));
    } catch (error) {
        console.error("Error fetching all events:", error);
        throw error;
    }
}

export async function getEventById(eventId: string): Promise<Event | null> {
    try {
        //Get the event using the collection name and the eventId
        const eventDocRef = doc(db, 'events', eventId);
        //Fetch the document snapshot
        const docSnap = await getDoc(eventDocRef);

        if (docSnap.exists()) {
            //If the document exists, map the event
            const eventData = docSnap.data() as Omit<Event, 'eventId'>;
            return {
                eventId: docSnap.id,
                ...eventData
            } as Event;
        } else {
            //Return null if the event does not exist
            console.log(`No event found with ID: ${eventId}`);
            return null;
        }
    } catch (error) {
        //Return null if there is an error
        console.error(`Error retrieving event with ID ${eventId}:`, error);
        return null;
    }
}

export async function addEvent(newEventData: Omit<Event, 'eventId'>): Promise<string> {
    try {
        const docRef = await addDoc(eventsCollection, newEventData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
}

export async function updateEvent(eventId: string, updatedData: Omit<Event, 'eventId'>): Promise<boolean> {
    try {
        //Get the event
        const eventDocRef = doc(db, 'events', eventId);
        //Use setDoc with the merge option to update the document without overwriting it completely
        await setDoc(eventDocRef, updatedData, { merge: true });
        console.log(`Event with ID ${eventId} successfully updated.`);
        //Return true if sucess
        return true;
    } catch (error) {
        console.error(`Error updating event with ID ${eventId}:`, error);
        //Return false if fail
        return false;
    }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
    try {
        //Get a reference to the event using the collection reference and the eventId
        const eventDocRef = doc(db, 'events', eventId);
        
        //Delete the event
        await deleteDoc(eventDocRef);
        //Return true if success
        return true;
    } catch (error) {
        //Log why the delete failed
        console.error(`Error deleting event with ID ${eventId}:`, error);
        //Return false if failed
        return false;
    }
}