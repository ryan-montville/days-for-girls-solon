import { ComponentItem, Event, InventoryEntry, SignUpEntry, } from "./models.js";
import { Timestamp } from "firebase/firestore";

function updateLocalStorage(itemName: string, data: Event[] | SignUpEntry[] | ComponentItem[] | InventoryEntry[] | string) {
    const dataString: string = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}

function getArrayFromLocalStorgae(localStorageItem: string) {
    const localStorageData = localStorage.getItem(localStorageItem) as string;
    return JSON.parse(localStorageData);
}

/* Events */
//Sorts and returns the events list
export function getEventsList(): Event[] {
    let eventsList: Event[] = getArrayFromLocalStorgae("events");
    return eventsList.sort((a, b) => {
        const dateA = a['eventDate'].toDate().getTime();
        const dateB = b['eventDate'].toDate().getTime();
        return dateA - dateB;
    });
}

//Returns event matching eventId
export function getEvent(eventId: number): Event | null {
    const eventsList: Event[] = getArrayFromLocalStorgae("events");
    const eventToReturn: Event | undefined = eventsList.find(eventObj => eventObj['eventId'] === eventId.toString());
    if (eventToReturn) return eventToReturn;
    //Return an empty event object if no event matching event ID
    return null;
}

//Create a new event
export function createNewEvent(newEvent: Event) {
    let eventsList: Event[] = getArrayFromLocalStorgae("events");
    eventsList.push(newEvent);
    updateLocalStorage("events", eventsList);
}

//Update an event
export function updateEvent(updatedEvent: Event) {
    let eventsList: Event[] = getArrayFromLocalStorgae("events");
    let eventObjIndex: number = eventsList.findIndex(item => item['eventId'] === updatedEvent['eventId']);
    eventsList[eventObjIndex] = updatedEvent;
    updateLocalStorage("events", eventsList);
}

//Update the number of people attending an event
function updateNumberAttending(eventId: number, reason: string) {
    let eventsList: Event[] = getArrayFromLocalStorgae("events");
    const eventIndex = eventsList.findIndex(item => item['eventId'] === eventId.toString());
    if (reason === "delete") {
        eventsList[eventIndex]['numberAttending'] -= 1;
    } else {
        eventsList[eventIndex]['numberAttending'] += 1;
    }
    updateLocalStorage("events", eventsList);
}

//Delete an event
export function deleteEvent(eventId: number) {
    //Delete all sign up entries for the event
    const signUpEntriesList: SignUpEntry[] = getArrayFromLocalStorgae("SignUpEntries");
    const updatedSignUpList = signUpEntriesList.filter(entry => entry['eventId'] !== eventId);
    updateLocalStorage("SignUpEntries", updatedSignUpList);
    //Delete the event from local storage
    let eventsList: Event[] = getArrayFromLocalStorgae("events");
    const updatedList = eventsList.filter(eventObj => eventObj['eventId'] !== eventId.toString());
    updateLocalStorage("events", updatedList);
}

//Get next event ID - Will be removed
export function getNextEventId(): number {
    let eventsList: Event[] = getArrayFromLocalStorgae("events");
    if (eventsList.length === 0) {
        return 1;
    }
    return 42;
}

/* Event sign ups */
//Get all sign up entries matching eventId
export function getSignUpsForEventId(eventId: number): SignUpEntry[] {
    const signUpEntriesList: SignUpEntry[] = getArrayFromLocalStorgae("SignUpEntries");
    return signUpEntriesList.filter(entry => entry['eventId'] === eventId);
}

//Returns sign up entry matching entry ID
export function getSignUpEntry(entryId: number): SignUpEntry | null {
    const signUpEntriesList: SignUpEntry[] = getArrayFromLocalStorgae("SignUpEntries");
    const signUpEntry: SignUpEntry | undefined = signUpEntriesList.find(entry => entry['entryId'] === entryId);
    if (signUpEntry) return signUpEntry;
    return null;

}

//Add new sign up entry
export function addSignUpEntry(newSignUp: SignUpEntry) {
    let signUpEntriesList: SignUpEntry[] = getArrayFromLocalStorgae("SignUpEntries");
    signUpEntriesList.push(newSignUp);
    updateLocalStorage("SignUpEntries", signUpEntriesList);
    updateNumberAttending(newSignUp['eventId'], "newSignUp");
}

//Delete a sign up entry
export function deleteSignUpEntry(entryId: number) {
    let signUpEntriesList: SignUpEntry[] = getArrayFromLocalStorgae("SignUpEntries");
    let updateSignUpList = signUpEntriesList.filter(entry => entry['entryId'] !== entryId);
    const signUpEntry = getSignUpEntry(entryId);
    //Update the number attending the event
    if (signUpEntry) updateNumberAttending(signUpEntry['eventId'], "delete");
    updateLocalStorage("SignUpEntries", updateSignUpList);
}

//Returns the next Sign Up Entry ID - Will be removed
export function getNextSignUpId() {
    const signUpEntriesList: SignUpEntry[] = getArrayFromLocalStorgae("SignUpEntries");
    if (signUpEntriesList.length === 0) {
        return 1;
    } else {
        return signUpEntriesList[signUpEntriesList.length - 1]['entryId'] + 1;
    }
}

/* Distributed Inventory */
//Returns the distributed inventory log
export function getDistributedInventoryLog(): InventoryEntry[] {
    return getArrayFromLocalStorgae("distributedInventory") as InventoryEntry[];
}

//Returns distributed log entry matching entry ID
export function getDistributedLogEntry(entryId: number): InventoryEntry | null {
    const distribtedInventoryLog: InventoryEntry[] = getArrayFromLocalStorgae("distributedInventory");
    const entry: InventoryEntry | undefined = distribtedInventoryLog.find(entry => entry['entryId'] === entryId);
    if (entry) return entry;
    return null;
}

//Adds new log entry to the distributed inventory log and updates the counts of the current inventory
export function addDistributedEntryLog(logEntry: InventoryEntry) {
    let distribtedInventoryLog: InventoryEntry[] = getArrayFromLocalStorgae("distributedInventory");
    distribtedInventoryLog.push(logEntry);
    //Update current inventory count - This might change with proper data storage
    //Update local storage - This will change with proper data storage
    updateLocalStorage("distributedInventory", distribtedInventoryLog);
    updateComponentInventoryQuantity(logEntry['componentType'], "subtract", logEntry['quantity'])
}

//Delete an entry from the distributed inventory log
export function deleteDistributedEntry(entryId: number) {
    let distribtedInventoryLog: InventoryEntry[] = getArrayFromLocalStorgae("distributedInventory");
    const updatedDistributedLog = distribtedInventoryLog.filter(entry => entry['entryId'] !== entryId);
    const logEntry = getDistributedLogEntry(entryId);
    //Update the current inventory count for the component
    if (logEntry) updateComponentInventoryQuantity(logEntry['componentType'], "add", logEntry['quantity']);
    updateLocalStorage("distributedInventory", updatedDistributedLog);
}

//Get next ID for distributed entry - Will be removed
export function getNextDistributedEntryId(): number {
    const distribtedInventoryLog: InventoryEntry[] = getArrayFromLocalStorgae("distributedInventory");
    if (distribtedInventoryLog.length === 0) {
        return 1;
    }
    return distribtedInventoryLog[distribtedInventoryLog.length - 1]['entryId'] + 1;
}

export function CheckInventoryForDistribution(componentTypeToCheck: string, quantityToDistribute: number): { hasEnough: boolean, quantity: number } {
    let currentInventoryArray: ComponentItem[] = getCurrentInventory();
    const itemToCheck: ComponentItem | null = getComponent({componentType: componentTypeToCheck});
    if (itemToCheck) {
        if (itemToCheck['quantity'] < quantityToDistribute) {
            //There is enough to distribute
            return { hasEnough: false, quantity: itemToCheck['quantity'] };
        } else {
            //There is not enough to distribute
            return { hasEnough: true, quantity: itemToCheck['quantity'] };
        }
    } else {
        //The component was not found, return false to create an error message
        return { hasEnough: false, quantity: 0 };
    }
}

/* Donated Inventory */
//Returns the donated inventory log
export function getDoantedInventoryLog(): InventoryEntry[] {
    return getArrayFromLocalStorgae("donatedInventory") as InventoryEntry[];
}

//Returns donated log entry match entry ID
export function getDonatedLogEntry(entryId: number): InventoryEntry | null {
    const donatedInventoryLog: InventoryEntry[] = getArrayFromLocalStorgae("donatedInventory");
    const donatedEntry: InventoryEntry | undefined = donatedInventoryLog.find(entry => entry['entryId'] === entryId);
    if (donatedEntry) return donatedEntry;
    return null;
}

//Adds new log entry to the donated inventory log and updates the counts of the current inventory
export function addDonatedEntryLog(logEntry: InventoryEntry) {
    let donatedInventoryLog: InventoryEntry[] = getArrayFromLocalStorgae("donatedInventory");
    donatedInventoryLog.push(logEntry);
    //Update current inventory count - This might change with proper data storage
    //Update local storage - This will change with proper data storage
    updateLocalStorage("donatedInventory", donatedInventoryLog);
    updateComponentInventoryQuantity(logEntry['componentType'], "add", logEntry['quantity']);
}

//Delete an entry from the donated inventory log
export function deleteDonatedEntry(entryId: number) {
    let donatedInventoryLog: InventoryEntry[] = getArrayFromLocalStorgae("donatedInventory");
    const updatedDonatedLog = donatedInventoryLog.filter(entry => entry['entryId'] !== entryId);
    const donatedEntry = getDonatedLogEntry(entryId);
    //Update the current inventory count for the component
    if (donatedEntry) updateComponentInventoryQuantity(donatedEntry['componentType'], "subtract", donatedEntry['quantity']);
    updateLocalStorage("donatedInventory", updatedDonatedLog);
}

//Get next ID for donated Entry - Will be removed
export function getNextDonatedEntryId(): number {
    const donatedInventoryLog: InventoryEntry[] = getArrayFromLocalStorgae("donatedInventory");
    if (donatedInventoryLog.length === 0) {
        return 1;
    }
    return donatedInventoryLog[donatedInventoryLog.length - 1]['entryId'] + 1;
}

/* Current Inventory */
//Returns the current inventory
export function getCurrentInventory(): ComponentItem[] {
    return getArrayFromLocalStorgae("currentInventory") as ComponentItem[];
}
//Add new component Type
export function addComponentTypeToInventory(newComponent: ComponentItem) {
    let currentInventoryList: ComponentItem[] = getArrayFromLocalStorgae("currentInventory");
    currentInventoryList.push(newComponent);
    updateLocalStorage("currentInventory", currentInventoryList);
}

//Returns component matching id
export function getComponent({componentId, componentType}: {componentId?: number, componentType?: string}): ComponentItem | null {
    const currentInventoryList: ComponentItem[] = getArrayFromLocalStorgae("currentInventory");
    if (componentId) {
        let component = currentInventoryList.find(item => item['componentId'] === componentId);
        if (component) {
            return component;
        }
    } else {
        let component = currentInventoryList.find(item => item['componentType'] === componentType);
        if (component) {
            return component;
        }
    }
    return null;
}

//Delete component Type matching id and entry logs
export function deleteComponentType(componentId: number) {
    const componentToDelete: ComponentItem | null = getComponent({componentId: componentId});
    if (componentToDelete) {
        let distribtedInventoryLog = getDistributedInventoryLog();
        let donatedInventoryLog = getDoantedInventoryLog();
        let currentInventoryArray = getCurrentInventory();
        const updatedDistributedLog = distribtedInventoryLog.filter(entry => entry['componentType'] !== componentToDelete['componentType']);
        const updatedDonatedLog = donatedInventoryLog.filter(entry => entry['componentType'] !== componentToDelete['componentType']);
        const updateCurrentInventory = currentInventoryArray.filter(component => component['componentId'] !== componentId);
        updateLocalStorage("donatedInventory", updatedDonatedLog);
        updateLocalStorage("distributedInventory", updatedDistributedLog);
        updateLocalStorage("currentInventory", updateCurrentInventory);
    }

}

//Update component quantity in inventory
function updateComponentInventoryQuantity(componentType: string, reason: string, quantity: number) {
    let currentInventoryList: ComponentItem[] = getArrayFromLocalStorgae("currentInventory");
    const componetIndex = currentInventoryList.findIndex(component => component['componentType'] === componentType);
    if (reason === "add") {
        currentInventoryList[componetIndex]['quantity'] += quantity;
    } else {
        currentInventoryList[componetIndex]['quantity'] -= quantity;
    }
    updateLocalStorage("currentInventory", currentInventoryList);
}
//Returns the next current inventory id - Will be removed
export function getNextCurrentInventoryId(): number {
    const currentInventoryList: ComponentItem[] = getArrayFromLocalStorgae("currentInventory");
    if (currentInventoryList.length === 0) {
        return 1;
    }
    return currentInventoryList[currentInventoryList.length - 1]['componentId'] + 1;
}

/* Component storage location */
//Add components to location

//Move components from one location to another

//Remove components from location when distributed

/* Donate Page Content */
//Get the content for the donate page
export function getDonatePageContent(): string {
    const contentData = localStorage.getItem("donatePage") as string;
    return JSON.parse(contentData);
}

export function submitDonatePageContent(pageContent: string) {
    updateLocalStorage("donatePage", pageContent);
}