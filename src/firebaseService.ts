import { initializeApp } from "firebase/app";
import {
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
    CollectionReference,
    DocumentSnapshot,
    setDoc,
    orderBy,
    runTransaction,
    limit
} from "firebase/firestore";
import { ComponentItem, DonatePageContent, Event, InventoryEntry, SignUpEntry } from "./models.js";
import { db } from "./firebase.js";

//Global Firebase Variables
declare const __app_id: string;
const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Helper function to get the base collection path
function getCollectionRef(collectionName: string): CollectionReference<any> {
    const path = `/artifacts/${appId}/public/data/${collectionName}`;
    return collection(db, path);
}

/* Functions to map Doc to objects*/
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

function mapDocToComponent(docSnap: DocumentSnapshot<any>): ComponentItem {
    const data = docSnap.data() as Omit<ComponentItem, 'componentId'>;
    return {
        ...data,
        componentId: docSnap.id,
    } as ComponentItem;
}

function mapDocToInventoryEntry(docSnap: DocumentSnapshot<any>): InventoryEntry {
    const data = docSnap.data() as Omit<InventoryEntry, 'entryId'>;
    return {
        ...data,
        entryId: docSnap.id,
    } as InventoryEntry;
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
        throw error;
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

export async function addEvent(newEvent: Omit<Event, 'eventId'>): Promise<string> {
    try {
        const docRef = await addDoc(getCollectionRef('events'), newEvent);
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
        //Get all sign-up entries for the event
        const entriesToDelete = await getSignUpEntriesForEventId(eventId);
        //Delete each sign-up entry
        const deletePromises = entriesToDelete.map(entry => deleteSignUpEntry(entry.entryId));
        await Promise.all(deletePromises);
        console.log(`Successfully deleted ${entriesToDelete.length} sign-up entries for event: ${eventId}`);
        //Delete the event document itself
        const docRef = doc(getCollectionRef('events'), eventId);
        await deleteDoc(docRef);
        console.log(`Event deleted successfully: ${eventId}`);
        return true;
    } catch (error) {
        console.error("Error deleting event and related sign-up entries:", error);
        return false;
    }
}

/* ---------------- Event Sign Up ---------------- */
export async function addSignUpEntry(newEntry: Omit<SignUpEntry, 'entryId'>): Promise<string> {
    const eventId = newEntry.eventId;

    //Get document reference to get its ID.
    const newEntryRef = doc(getCollectionRef('signUpEntries'));
    const entryId = newEntryRef.id;

    try {
        //Using Firestore transaction to make sure the entry is only added if it can update the event's number attending
        await runTransaction(db, async (txn) => {
            const eventRef = doc(getCollectionRef('events'), eventId);

            //Read the Event document
            const eventSnap = await txn.get(eventRef);
            if (!eventSnap.exists()) {
                throw new Error(`Event with ID ${eventId} not found. Cannot sign up.`);
            }

            //Increment numberAttending in the Event
            const currentAttending = eventSnap.data()?.numberAttending || 0;
            const newAttending = currentAttending + 1;
            txn.update(eventRef, { numberAttending: newAttending });

            //Add the sign-up entry
            txn.set(newEntryRef, {
                ...newEntry,
                entryId: entryId
            });
        });

        console.log(`Sign-up entry and event attendance updated successfully: ${entryId}`);
        return entryId;

    } catch (error) {
        console.error("Error adding sign-up entry (Transaction aborted):", error);
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
        throw error;
    }
}

export async function deleteSignUpEntry(entryId: string): Promise<boolean> {
    try {
        //Using Firestore transaction to make sure the entry is only deleted if it can update the event's number attending
        await runTransaction(db, async (txn) => {
            const entryRef = doc(getCollectionRef('signUpEntries'), entryId);

            //Read the sign-up entry
            const entrySnap = await txn.get(entryRef);
            if (!entrySnap.exists()) {
                console.warn(`Sign-up entry ${entryId} not found.`);
                return;
            }

            const entryToDelete = mapDocToSignUpEntry(entrySnap);
            const eventId = entryToDelete.eventId;
            const eventRef = doc(getCollectionRef('events'), eventId);
            //Read the Event document
            const eventSnap = await txn.get(eventRef);

            if (eventSnap.exists()) {
                //Decrement numberAttending in the Event document
                const currentAttending = eventSnap.data()?.numberAttending || 0;

                //Prevent negative numbers
                const newAttending = Math.max(0, currentAttending - 1);
                txn.update(eventRef, { numberAttending: newAttending });
            } else {
                console.warn(`Event ${eventId} not found when deleting sign-up entry ${entryId}. Only deleting entry.`);
            }

            //Delete the sign-up entry document
            txn.delete(entryRef);
        });

        console.log(`Sign-up entry deleted successfully: ${entryId}. Event attendance updated via transaction.`);
        return true;
    } catch (error) {
        console.error(`Error deleting sign-up entry ${entryId} (Transaction aborted):`, error);
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

/* ---------------- Inventory ---------------- */
//Helper function for seedIfEmptyInventoryLog()
async function getOrCreateDummyComponentId(): Promise<string> {
    const inventoryRef = getCollectionRef('inventory');
    //Check if any component exists
    const q = query(inventoryRef, limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        //Return the ID of the first found component
        return querySnapshot.docs[0].id;
    }

    //Create a new dummy component since the inventory is empty
    console.log("Inventory is empty. Creating a dummy component for logging.");
    const dummyComponent: Omit<ComponentItem, 'componentId'> = {
        componentType: "Placeholder component. Please delete",
        quantity: 9999
    };

    //Add the component and return the generated ID
    return addComponent(dummyComponent);
}
export async function getAllComponents(): Promise<ComponentItem[]> {
    try {
        const components: ComponentItem[] = [];
        const q = query(getCollectionRef('inventory'));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            components.push(mapDocToComponent(doc));
        });
        return components;
    } catch (error) {
        console.error("Error fetching all components:", error);
        throw error;
    }
}

export async function getComponentbyId(componentId: string): Promise<ComponentItem | null> {
    try {
        const docRef = doc(getCollectionRef('inventory'), componentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return mapDocToComponent(docSnap);
        } else {
            console.warn("No such component found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching component:", error);
        throw error;
    }
}

export async function addComponent(newComponent: Omit<ComponentItem, 'componentId'>): Promise<string> {
    try {
        const componentRef = getCollectionRef('inventory');
        //Use the componentType as the document ID
        const componentId = newComponent['componentType'];
        const docRef = doc(componentRef, componentId); 

        const componentData: ComponentItem = {
            ...newComponent,
            componentId: componentId
        };

        //Use setDoc to write the data with the specific componentType ID
        await setDoc(docRef, componentData as any); 
        console.log(`Component with id ${componentId} added to inventory`);
        return componentId;
    } catch (error) {
        console.error("Error adding component:", error);
        throw error;
    }
}

//Make sure this is not needed
// export async function updateComponentQuantity(componentId: string, additionalCount: number, isIncrement: boolean): Promise<boolean> {
//     try {
//         //Get the reference for the component
//         const docRef = doc(getCollectionRef('inventory'), componentId);
//         //Determine whether add or subtract additionalCount
//         const changeValue = isIncrement ? additionalCount : additionalCount * -1;
//         //Update the quantity
//         await updateDoc(docRef, {
//             quantity: increment(changeValue)
//         });
//         return true;
//     } catch (error) {
//         console.error("Error updating quantity:", error);
//         return false;
//     }

// }

export async function deleteComponent(componentId: string): Promise<boolean> {
    try {
        //Find all the log entries for the component
        const logRef = getCollectionRef('inventoryLog');
        const q = query(logRef, where('componentType', '==', componentId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.log(`Found ${querySnapshot.size} log entries to delete for component: ${componentId}`);
            //Delete all log entries in parallel
            const deletePromises = querySnapshot.docs.map(docSnap =>
                deleteDoc(doc(logRef, docSnap.id))
            );
            await Promise.all(deletePromises);
            console.log(`Successfully deleted all associated log entries for component: ${componentId}`);
        } else {
            console.log(`No log entries found for component: ${componentId}.`);
        }

        //Delete the component
        const docRef = doc(getCollectionRef('inventory'), componentId);
        await deleteDoc(docRef);
        console.log(`Deleted component with id: ${componentId}`);
        return true;
    } catch (error) {
        console.log("Error deleting component and related log entries:", error);
        return false;
    }
}

/* Inventory log entries */
//If there are no log entries, create a donated and distributed entry to prevent errors in getFilteredLogEntries() 
export async function seedIfEmptyInventoryLog(): Promise<void> {
    try {
        const logRef = getCollectionRef('inventoryLog');
        const q = query(logRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("Inventory Log is empty. Seeding with initial entries (Donated & Distributed).");
            
            //Ensure a component exists to link the log entry to
            const componentId = await getOrCreateDummyComponentId();
            if (!componentId) {
                console.error("Failed to get or create a component ID for seeding.");
                return;
            }

            //Create a placeholder donated entry log
            const donationSeedEntry: Omit<InventoryEntry, 'entryId'> = {
                entryDate: Timestamp.now(),
                componentType: componentId,
                quantity: 50,
                whoDonated: "Placeholder entry log. Please delete after adding a real log entry"
            };
            await addLogEntry(donationSeedEntry);

            //Create a distributed entry log
            const distributionSeedEntry: Omit<InventoryEntry, 'entryId'> = {
                entryDate: Timestamp.now(),
                componentType: componentId,
                quantity: 10,
                destination: "Placeholder entry log. Please delete after adding a real log entry"
            };
            await addLogEntry(distributionSeedEntry);

            console.log("Successfully added placeholder log entires.");
        } else {
            console.log("Inventory Log already contains entries. Skipping seed process.");
        }
    } catch (error) {
        console.error("Error during inventory log seeding:", error);
    }
}

export async function getAllLogEntires(): Promise<InventoryEntry[]> {
    try {
        const inventoryEntries: InventoryEntry[] = [];
        //Sort all entries by date
        const q = query(getCollectionRef('inventoryLog'), orderBy("entryDate", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            inventoryEntries.push(mapDocToInventoryEntry(doc));
        });
        return inventoryEntries;
    } catch (error) {
        console.error("Error fetching all inventory log entries:", error);
        throw error;
    }
}

//Get all donated or distributed inventory log entries based on logtype
export async function getFilteredLogEntries(logType: string): Promise<InventoryEntry[]> {
    try {
        let q;
        const logRef = getCollectionRef('inventoryLog');

        if (logType === 'donated') {
            //If logType === donated, return all inventory log entries where "whoDonated" is not null
            q = query(
                logRef,
                where('whoDonated', '!=', null),
                orderBy("whoDonated", "asc"), // Must be the first sort when using != filter
                orderBy("entryDate", "desc")
            );
        } else if (logType === 'distributed') {
            //If logType === distributed, return all inventory log entries where "destination" is not null
            q = query(
                logRef,
                where('destination', '!=', null),
                orderBy("destination", "asc"), // Must be the first sort when using != filter
                orderBy("entryDate", "desc")
            );
        } else {
            console.warn(`Invalid logType provided: ${logType}. Returning all log entries.`);
            return getAllLogEntires();
        }

        const inventoryEntries: InventoryEntry[] = [];
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            inventoryEntries.push(mapDocToInventoryEntry(doc));
        });

        return inventoryEntries;

    } catch (error) {
        console.error(`Error fetching filtered inventory log entries for type ${logType}:`, error);
        throw error;
    }
}

// export async function getLogEntryById(entryId: string): Promise<InventoryEntry | null> {
//     try {
//         const docRef = doc(getCollectionRef('inventoryLog'), entryId);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//             return mapDocToInventoryEntry(docSnap);
//         } else {
//             console.warn("No such inventory log entry found!");
//             return null;
//         }
//     } catch (error) {
//         console.error("Error fetching inventory log entry:", error);
//         throw error;
//     }
// }

export async function addLogEntry(newLogEntry: Omit<InventoryEntry, 'entryId'>): Promise<string> {
    //Used to update the quantity of the component
    let isIncrement: boolean;
    const componentId = newLogEntry.componentType;
    const additionalCount = newLogEntry.quantity;
    //Determine whether the log entry is a donation or distribution
    if (newLogEntry.whoDonated) {
        //Donation: Add to inventory
        isIncrement = true;
    } else if (newLogEntry.destination) {
        //Distribution: Subtract from inventory
        isIncrement = false;
    } else {
        console.warn("Log entry type is not recognized (donation/distribution). Aborting.");
        return '';
    }

    //Create a new document reference first to get its ID
    const newLogEntryRef = doc(getCollectionRef('inventoryLog'));
    const entryId = newLogEntryRef.id;

    try {
        //Using Firestore transactions to make sure the log entry is only added if it updates the component quantity
        await runTransaction(db, async (txn) => {
            const componentRef = doc(getCollectionRef('inventory'), componentId);
            const componentSnap = await txn.get(componentRef);

            if (!componentSnap.exists()) {
                throw new Error("Component not found in inventory.");
            }
            //Caculate updated component quantity
            const currentQuantity = componentSnap.data()?.quantity || 0;
            const changeValue = isIncrement ? additionalCount : additionalCount * -1;
            const newQuantity = currentQuantity + changeValue;
            if (newQuantity < 0) {
                //Prevent inventory from going negative
                throw new Error(`Please enter a quantity less than or equal to ${currentQuantity}`);
            }
            //Update the component quantity
            txn.update(componentRef, { quantity: newQuantity });

            //Add the log entry
            txn.set(newLogEntryRef, {
                ...newLogEntry,
                entryId: entryId
            });
        });

        console.log(`Inventory log entry and component quantity updated successfully: ${entryId}`);
        return entryId;
    } catch (error) {
        console.error("Error adding inventory log entry (Transaction aborted):", error);
        throw error;
    }
}

export async function deleteLogEntry(entryId: string): Promise<boolean> {
    try {
        //Using Firestore transactions to make sure the log entry is only deleted if it updates the component quantity
        await runTransaction(db, async (txn) => {
            //Document references
            const logEntryRef = doc(getCollectionRef('inventoryLog'), entryId);

            //Read the log entry to determine component and quantity
            const logEntrySnap = await txn.get(logEntryRef);

            if (!logEntrySnap.exists()) {
                console.warn(`Log entry ${entryId} not found.`);
                return;
            }

            const logEntryToDelete = mapDocToInventoryEntry(logEntrySnap);
            const componentId = logEntryToDelete.componentType;
            const additionalCount = logEntryToDelete.quantity;

            let isReversalIncrement: boolean;
            if (logEntryToDelete.whoDonated) {
                //Donation log entry, reversal is decrement
                isReversalIncrement = false;
            } else if (logEntryToDelete.destination) {
                //Distribution log entry, reversal is increment
                isReversalIncrement = true;
            } else {
                //Log entry is unrecognizable, just delete it without inventory update
                txn.delete(logEntryRef);
                return;
            }

            const componentRef = doc(getCollectionRef('inventory'), componentId);
            const componentSnap = await txn.get(componentRef);

            if (!componentSnap.exists()) {
                //Component is already gone, proceed with log entry deletion
                txn.delete(logEntryRef);
                return;
            }

            const currentQuantity = componentSnap.data()?.quantity || 0;
            const changeValue = isReversalIncrement ? additionalCount : additionalCount * -1;
            const newQuantity = currentQuantity + changeValue;

            if (newQuantity < 0) {
                //Inventory would go negative upon reversal, indicating a major inventory error
                throw new Error("Inventory inconsistency detected: Cannot reverse deletion as it would result in negative quantity for component.");
            }

            //Reverse the quantity change in the main inventory
            txn.update(componentRef, { quantity: newQuantity });
            //Delete the log entry document
            txn.delete(logEntryRef);
        });

        console.log(`Inventory log entry deleted successfully: ${entryId}. Inventory reversal guaranteed via transaction.`);
        return true;
    } catch (error) {
        console.error(`Error deleting inventory log entry ${entryId} (Transaction aborted):`, error);
        //Transactions automatically roll back
        return false;
    }
}