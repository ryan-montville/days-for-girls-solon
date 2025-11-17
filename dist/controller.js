function updateLocalStorage(itemName, data) {
    const dataString = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}
function getArrayFromLocalStorgae(localStorageItem) {
    const localStorageData = localStorage.getItem(localStorageItem);
    return JSON.parse(localStorageData);
}
/* Events */
//Sorts and returns the events list
export function getEventsList() {
    let eventsList = getArrayFromLocalStorgae("events");
    return eventsList.sort((a, b) => {
        const dateA = new Date(a['eventDate']).getTime();
        const dateB = new Date(b['eventDate']).getTime();
        return dateA - dateB;
    });
}
//Returns event matching eventId
export function getEvent(eventId) {
    const eventsList = getArrayFromLocalStorgae("events");
    const eventToReturn = eventsList.find(eventObj => eventObj['eventId'] === eventId);
    if (eventToReturn)
        return eventToReturn;
    //Return an empty event object if no event matching event ID
    return null;
}
//Create a new event
export function createNewEvent(newEvent) {
    let eventsList = getArrayFromLocalStorgae("events");
    eventsList.push(newEvent);
    updateLocalStorage("events", eventsList);
}
//Update an event
export function updateEvent(updatedEvent) {
    let eventsList = getArrayFromLocalStorgae("events");
    let eventObjIndex = eventsList.findIndex(item => item['eventId'] === updatedEvent['eventId']);
    eventsList[eventObjIndex] = updatedEvent;
    updateLocalStorage("events", eventsList);
}
//Update the number of people attending an event
function updateNumberAttending(eventId, reason) {
    let eventsList = getArrayFromLocalStorgae("events");
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
    const signUpEntriesList = getArrayFromLocalStorgae("SignUpEntries");
    const updatedSignUpList = signUpEntriesList.filter(entry => entry['eventId'] !== eventId);
    updateLocalStorage("SignUpEntries", updatedSignUpList);
    //Delete the event from local storage
    let eventsList = getArrayFromLocalStorgae("events");
    const updatedList = eventsList.filter(eventObj => eventObj['eventId'] !== eventId);
    updateLocalStorage("events", updatedList);
}
//Get next event ID - Will be removed
export function getNextEventId() {
    let eventsList = getArrayFromLocalStorgae("events");
    if (eventsList.length === 0) {
        return 1;
    }
    return eventsList[eventsList.length - 1]['eventId'] + 1;
}
/* Event sign ups */
//Get all sign up entries matching eventId
export function getSignUpsForEventId(eventId) {
    const signUpEntriesList = getArrayFromLocalStorgae("SignUpEntries");
    return signUpEntriesList.filter(entry => entry['eventId'] === eventId);
}
//Returns sign up entry matching entry ID
export function getSignUpEntry(entryId) {
    const signUpEntriesList = getArrayFromLocalStorgae("SignUpEntries");
    const signUpEntry = signUpEntriesList.find(entry => entry['entryId'] === entryId);
    if (signUpEntry)
        return signUpEntry;
    return null;
}
//Add new sign up entry
export function addSignUpEntry(newSignUp) {
    let signUpEntriesList = getArrayFromLocalStorgae("SignUpEntries");
    signUpEntriesList.push(newSignUp);
    updateLocalStorage("SignUpEntries", signUpEntriesList);
    updateNumberAttending(newSignUp['eventId'], "newSignUp");
}
//Delete a sign up entry
export function deleteSignUpEntry(entryId) {
    let signUpEntriesList = getArrayFromLocalStorgae("SignUpEntries");
    let updateSignUpList = signUpEntriesList.filter(entry => entry['entryId'] !== entryId);
    const signUpEntry = getSignUpEntry(entryId);
    //Update the number attending the event
    if (signUpEntry)
        updateNumberAttending(signUpEntry['eventId'], "delete");
    updateLocalStorage("SignUpEntries", updateSignUpList);
}
//Returns the next Sign Up Entry ID - Will be removed
export function getNextSignUpId() {
    const signUpEntriesList = getArrayFromLocalStorgae("SignUpEntries");
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
    return getArrayFromLocalStorgae("distributedInventory");
}
//Returns distributed log entry matching entry ID
export function getDistributedLogEnry(entryId) {
    const distribtedInventoryLog = getArrayFromLocalStorgae("distributedInventory");
    const entry = distribtedInventoryLog.find(entry => entry['entryId'] === entryId);
    if (entry)
        return entry;
    return null;
}
//Adds new log entry to the distributed inventory log and updates the counts of the current inventory
export function addDistributedEntryLog(logEntry) {
    let distribtedInventoryLog = getArrayFromLocalStorgae("distributedInventory");
    distribtedInventoryLog.push(logEntry);
    //Update current inventory count - This might change with proper data storage
    //Update local storage - This will change with proper data storage
    updateLocalStorage("distributedInventory", distribtedInventoryLog);
    updateComponentInventoryQuantity(logEntry['componentType'], "subtract", logEntry['quantity']);
}
//Delete an entry from the distributed inventory log
export function deleteDistributedEntry(entryId) {
    let distribtedInventoryLog = getArrayFromLocalStorgae("distributedInventory");
    const updatedDistributedLog = distribtedInventoryLog.filter(entry => entry['entryId'] !== entryId);
    const logEntry = getDistributedLogEnry(entryId);
    //Update the current inventory count for the component
    if (logEntry)
        updateComponentInventoryQuantity(logEntry['componentType'], "add", logEntry['quantity']);
    updateLocalStorage("distributedInventory", updatedDistributedLog);
}
//Get next ID for distributed entry - Will be removed
export function getNextDistributedEntryId() {
    const distribtedInventoryLog = getArrayFromLocalStorgae("distributedInventory");
    if (distribtedInventoryLog.length === 0) {
        return 1;
    }
    return distribtedInventoryLog[distribtedInventoryLog.length - 1]['entryId'] + 1;
}
/* Donated Inventory */
//Returns the donated inventory log
export function getDoantedInventoryLog() {
    return getArrayFromLocalStorgae("donatedInventory");
}
//Returns donated log entry match entry ID
export function getDonatedLogEntry(entryId) {
    const donatedInventoryLog = getArrayFromLocalStorgae("donatedInventory");
    const donatedEntry = donatedInventoryLog.find(entry => entry['entryId'] === entryId);
    if (donatedEntry)
        return donatedEntry;
    return null;
}
//Adds new log entry to the donated inventory log and updates the counts of the current inventory
export function addDonatedEntryLog(logEntry) {
    let donatedInventoryLog = getArrayFromLocalStorgae("donatedInventory");
    donatedInventoryLog.push(logEntry);
    //Update current inventory count - This might change with proper data storage
    //Update local storage - This will change with proper data storage
    updateLocalStorage("donatedInventory", donatedInventoryLog);
    updateComponentInventoryQuantity(logEntry['componentType'], "add", logEntry['quantity']);
}
//Delete an entry from the donated inventory log
export function deleteDonatedEntry(entryId) {
    let donatedInventoryLog = getArrayFromLocalStorgae("donatedInventory");
    const updatedDonatedLog = donatedInventoryLog.filter(entry => entry['entryId'] !== entryId);
    const donatedEntry = getDonatedLogEntry(entryId);
    //Update the current inventory count for the component
    if (donatedEntry)
        updateComponentInventoryQuantity(donatedEntry['componentType'], "subtract", donatedEntry['quantity']);
    updateLocalStorage("donatedInventory", updatedDonatedLog);
}
//Get next ID for donated Entry - Will be removed
export function getNextDonatedEntryId() {
    const donatedInventoryLog = getArrayFromLocalStorgae("donatedInventory");
    if (donatedInventoryLog.length === 0) {
        return 1;
    }
    return donatedInventoryLog[donatedInventoryLog.length - 1]['entryId'] + 1;
}
/* Current Inventory */
//Returns the current inventory
export function getCurrentInventory() {
    return getArrayFromLocalStorgae("currentInventory");
}
//Add new component Type
export function addComponentTypeToInventory(newComponent) {
    let currentInventoryList = getArrayFromLocalStorgae("currentInventory");
    currentInventoryList.push(newComponent);
    updateLocalStorage("currentInventory", currentInventoryList);
}
//Returns component matching id
export function getComponent(componentId) {
    const currentInventoryList = getArrayFromLocalStorgae("currentInventory");
    let component = currentInventoryList.find(item => item['componentId'] === componentId);
    if (component) {
        return component;
    }
    return null;
}
//Delete component Type matching id and entry logs
export function deleteComponentType(componentId) {
    const componentToDelete = getComponent(componentId);
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
function updateComponentInventoryQuantity(componentType, reason, quantity) {
    let currentInventoryList = getArrayFromLocalStorgae("currentInventory");
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
//Returns the next current inventory id - Will be removed
export function getNextCurrentInventoryId() {
    const currentInventoryList = getArrayFromLocalStorgae("currentInventory");
    if (currentInventoryList.length === 0) {
        return 1;
    }
    return currentInventoryList[currentInventoryList.length - 1]['componentId'] + 1;
}
/* Component storage location */
//Add components to location
//Move components from one location to another
//Remove components from location when distributed
