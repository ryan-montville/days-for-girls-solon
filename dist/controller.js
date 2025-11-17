import { updateLocalStorage } from "./utils.js";
/* Events */
//Sorts and returns the events list
export function getEventsList() {
    const eventsData = localStorage.getItem("events");
    let eventsList = JSON.parse(eventsData);
    return eventsList.sort((a, b) => {
        const dateA = new Date(a['eventDate']).getTime();
        const dateB = new Date(b['eventDate']).getTime();
        return dateA - dateB;
    });
}
//Returns event matching eventId
export function getEvent(eventId) {
    const eventsData = localStorage.getItem("events");
    const eventsList = JSON.parse(eventsData);
    const eventToReturn = eventsList.find(eventObj => eventObj['eventId'] === eventId);
    if (eventToReturn)
        return eventToReturn;
    //Return an empty event object if no event matching event ID
    return null;
}
//Create a new event
export function createNewEvent(newEvent) {
    const eventsData = localStorage.getItem("events");
    let eventsList = JSON.parse(eventsData);
    eventsList.push(newEvent);
    updateLocalStorage("events", eventsList);
}
//Update an event
export function updateEvent(updatedEvent) {
    const eventsData = localStorage.getItem("events");
    let eventsList = JSON.parse(eventsData);
    let eventObjIndex = eventsList.findIndex(item => item['eventId'] === updatedEvent['eventId']);
    eventsList[eventObjIndex] = updatedEvent;
    updateLocalStorage("events", eventsList);
}
//Update the number of people attending an event
function updateNumberAttending(eventId, reason) {
    const eventsData = localStorage.getItem("events");
    let eventsList = JSON.parse(eventsData);
    const eventIndex = eventsList.findIndex(item => item['eventId'] === eventId);
    if (reason === "delete") {
        eventsList[eventIndex]['numberAttending'] -= 1;
    }
    else {
        eventsList[eventIndex]['numberAttending'] += 1;
    }
    updateLocalStorage("events", eventsList);
}
//Delete an event
export function deleteEvent(eventId) {
    //Delete all sign up entries for the event
    const SignUpEntriesLocalStorage = localStorage.getItem('SignUpEntries');
    const signUpEntriesList = JSON.parse(SignUpEntriesLocalStorage);
    const updatedSignUpList = signUpEntriesList.filter(entry => entry['eventId'] !== eventId);
    updateLocalStorage("SignUpEntries", updatedSignUpList);
    //Delete the event from local storage
    const eventsData = localStorage.getItem("events");
    let eventsList = JSON.parse(eventsData);
    const updatedList = eventsList.filter(eventObj => eventObj['eventId'] !== eventId);
    updateLocalStorage("events", updatedList);
}
//Get next event ID - Will be removed
export function getNextEventId() {
    const eventsData = localStorage.getItem("events");
    let eventsList = JSON.parse(eventsData);
    if (eventsList.length === 0) {
        return 1;
    }
    return eventsList[eventsList.length - 1]['eventId'] + 1;
}
/* Event sign ups */
//Get all sign up entries matching eventId
export function getSignUpsForEventId(eventId) {
    const SignUpEntriesLocalStorage = localStorage.getItem('SignUpEntries');
    const signUpEntriesList = JSON.parse(SignUpEntriesLocalStorage);
    return signUpEntriesList.filter(entry => entry['eventId'] === eventId);
}
//Returns sign up entry matching entry ID
export function getSignUpEntry(entryId) {
    const SignUpEntriesLocalStorage = localStorage.getItem('SignUpEntries');
    const signUpEntriesList = JSON.parse(SignUpEntriesLocalStorage);
    const signUpEntry = signUpEntriesList.find(entry => entry['entryId'] === entryId);
    if (signUpEntry)
        return signUpEntry;
    return null;
}
//Add new sign up entry
export function addSignUpEntry(newSignUp) {
    const SignUpEntriesLocalStorage = localStorage.getItem('SignUpEntries');
    let signUpEntriesList = JSON.parse(SignUpEntriesLocalStorage);
    signUpEntriesList.push(newSignUp);
    updateLocalStorage("SignUpEntries", signUpEntriesList);
    updateNumberAttending(newSignUp['eventId'], "newSignUp");
}
//Delete a sign up entry
export function deleteSignUpEntry(entryId) {
    const SignUpEntriesLocalStorage = localStorage.getItem('SignUpEntries');
    let signUpEntriesList = JSON.parse(SignUpEntriesLocalStorage);
    let updateSignUpList = signUpEntriesList.filter(entry => entry['entryId'] !== entryId);
    const signUpEntry = getSignUpEntry(entryId);
    //Update the number attending the event
    if (signUpEntry)
        updateNumberAttending(signUpEntry['eventId'], "delete");
    updateLocalStorage("SignUpEntries", updateSignUpList);
}
//Returns the next Sign Up Entry ID - Will be removed
export function getNextSignUpId() {
    const SignUpEntriesLocalStorage = localStorage.getItem('SignUpEntries');
    const signUpEntriesList = JSON.parse(SignUpEntriesLocalStorage);
    if (signUpEntriesList.length === 0) {
        return 1;
    }
    else {
        return signUpEntriesList[signUpEntriesList.length - 1]['entryId'] + 1;
    }
}
/* Distributed Inventory */
//Returns the distributed inventory log
export function getDistributedInventoryLog() {
    const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory");
    return JSON.parse(distributedInventoryLocalStorage);
}
//Returns distributed log entry matching entry ID
export function getDistributedLogEnry(entryId) {
    const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory");
    const distribtedInventoryLog = JSON.parse(distributedInventoryLocalStorage);
    const entry = distribtedInventoryLog.find(entry => entry['entryId'] === entryId);
    if (entry)
        return entry;
    return null;
}
//Adds new log entry to the distributed inventory log and updates the counts of the current inventory
export function addDistributedEntryLog(logEntry) {
    const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory");
    let distribtedInventoryLog = JSON.parse(distributedInventoryLocalStorage);
    distribtedInventoryLog.push(logEntry);
    //Update current inventory count - This might change with proper data storage
    //Update local storage - This will change with proper data storage
    updateLocalStorage("distributedInventory", distribtedInventoryLog);
    updateComponentInventoryQuantity(logEntry['componentType'], "subtract", logEntry['quantity']);
}
//Delete an entry from the distributed inventory log
export function deleteDistributedEntry(entryId) {
    const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory");
    let distribtedInventoryLog = JSON.parse(distributedInventoryLocalStorage);
    const updatedDistributedLog = distribtedInventoryLog.filter(entry => entry['entryId'] !== entryId);
    const logEntry = getDistributedLogEnry(entryId);
    //Update the current inventory count for the component
    if (logEntry)
        updateComponentInventoryQuantity(logEntry['componentType'], "add", logEntry['quantity']);
    updateLocalStorage("distributedInventory", updatedDistributedLog);
}
//Get next ID for distributed entry - Will be removed
export function getNextDistributedEntryId() {
    const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory");
    const distribtedInventoryLog = JSON.parse(distributedInventoryLocalStorage);
    if (distribtedInventoryLog.length === 0) {
        return 1;
    }
    return distribtedInventoryLog[distribtedInventoryLog.length - 1]['entryId'] + 1;
}
/* Donated Inventory */
//Returns the donated inventory log
export function getDoantedInventoryLog() {
    const donateInventoryLocalStorage = localStorage.getItem('donatedInventory');
    return JSON.parse(donateInventoryLocalStorage);
}
//Returns donated log entry match entry ID
export function getDonatedLogEntry(entryId) {
    const donateInventoryLocalStorage = localStorage.getItem('donatedInventory');
    const donatedInventoryLog = JSON.parse(donateInventoryLocalStorage);
    const donatedEntry = donatedInventoryLog.find(entry => entry['entryId'] === entryId);
    if (donatedEntry)
        return donatedEntry;
    return null;
}
//Adds new log entry to the donated inventory log and updates the counts of the current inventory
export function addDonatedEntryLog(logEntry) {
    const donateInventoryLocalStorage = localStorage.getItem('donatedInventory');
    let donatedInventoryLog = JSON.parse(donateInventoryLocalStorage);
    donatedInventoryLog.push(logEntry);
    //Update current inventory count - This might change with proper data storage
    //Update local storage - This will change with proper data storage
    updateLocalStorage("donatedInventory", donatedInventoryLog);
    updateComponentInventoryQuantity(logEntry['componentType'], "add", logEntry['quantity']);
}
//Delete an entry from the donated inventory log
export function deleteDonatedEntry(entryId) {
    const donateInventoryLocalStorage = localStorage.getItem('donatedInventory');
    let donatedInventoryLog = JSON.parse(donateInventoryLocalStorage);
    const updatedDonatedLog = donatedInventoryLog.filter(entry => entry['entryId'] !== entryId);
    const donatedEntry = getDonatedLogEntry(entryId);
    //Update the current inventory count for the component
    if (donatedEntry)
        updateComponentInventoryQuantity(donatedEntry['componentType'], "subtract", donatedEntry['quantity']);
    updateLocalStorage("donatedInventory", updatedDonatedLog);
}
//Get next ID for donated Entry - Will be removed
export function getNextDonatedEntryId() {
    const donateInventoryLocalStorage = localStorage.getItem('donatedInventory');
    const donatedInventoryLog = JSON.parse(donateInventoryLocalStorage);
    if (donatedInventoryLog.length === 0) {
        return 1;
    }
    return donatedInventoryLog[donatedInventoryLog.length - 1]['entryId'] + 1;
}
/* Current Inventory */
//Add new component Type
//Delete component Type
//Update component quantity in inventory
function updateComponentInventoryQuantity(componentType, reason, quantity) {
    const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
    let currentInventoryList = JSON.parse(currentInventoryLocalStorage);
    const componetIndex = currentInventoryList.findIndex(component => component['componentType'] === componentType);
    if (reason === "add") {
        currentInventoryList[componetIndex]['quantity'] += quantity;
        console.log(`adding ${quantity} of ${componentType}`);
    }
    else {
        currentInventoryList[componetIndex]['quantity'] -= quantity;
        console.log(`Removing ${quantity} of ${componentType}`);
    }
    updateLocalStorage("currentInventory", currentInventoryList);
}
/* Component storage location */
//Add components to location
//Move components from one location to another
//Remove components from location when distributed
