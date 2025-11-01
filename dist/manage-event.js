import { addITemToTable, createMessage, clearMessages, deleteItem, updateLocalStorage } from "./utils.js";
const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries');
let signUpEntriesData = JSON.parse(SignUpEntriesLocalStorge);
const editForm = document.getElementById('edit-form');
const resteEventInfoButton = document.getElementById('reset');
const entriesCard = document.getElementById('sign-up-entires');
const entriesTable = document.getElementById('entries-table');
const signUpEntriesCard = document.getElementById('sign-up-entires');
const deleteEventCard = document.getElementById('deleteEventCard');
const deleteEventButton = document.getElementById('delete-button');
//Get event id from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const idString = urlParams.get('id');
let paramEventId = 0;
if (idString) {
    const parsedId = parseInt(idString, 10);
    if (!isNaN(parsedId)) {
        paramEventId = parsedId;
    }
    else {
        createMessage("Could not find event", "main-message", "error");
    }
}
else {
    createMessage("Could not find event", "main-message", "error");
}
//Get event matching eventId
const eventObject = eventsData.find(eventObject => eventObject['eventId'] === paramEventId);
function resetInfo(eventObject) {
    //Get event title input and set the value
    let eventTitleInput = document.getElementById('eventTitle');
    eventTitleInput.value = eventObject['eventTitle'];
    //Get event date input, create a new date object, get the date, and set the value
    let eventDateInput = document.getElementById('eventDate');
    let eventDate = new Date(eventObject['eventDate']);
    eventDateInput.value = eventDate.toISOString().split('T')[0];
    //Get event location input and set the value
    let eventLocationInput = document.getElementById('eventLocation');
    eventLocationInput.value = eventObject['eventLocation'];
    //Get event time input and set the value
    let eventTimeInput = document.getElementById('eventTime');
    eventTimeInput.value = eventObject['eventTime'];
    //Get event description textarea and set the value
    let eventDescriptionInput = document.getElementById('eventDescription');
    eventDescriptionInput.value = eventObject['eventDescription'];
}
function editEventInfo() {
    let formData = new FormData(editForm);
    //Create an object for the updated event
    let updatedEvent = {
        eventId: paramEventId,
        eventTitle: "",
        eventDate: new Date(),
        eventLocation: "",
        eventTime: "",
        eventDescription: "",
        numberAttending: 0
    };
    //Validate the event title input
    let TitleValue = formData.get('eventTitle');
    if (TitleValue === null || TitleValue.toString().trim() === '') {
        createMessage("Please enter the title of the event", "main-message", "error");
        return;
    }
    else {
        updatedEvent['eventTitle'] = TitleValue.toString();
    }
    //Validate the event date input
    const dateValue = formData.get('eventDate');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date of the event", "main-message", "error");
        return;
    }
    else {
        updatedEvent['eventDate'] = new Date(dateValue.toString());
    }
    //Validate event location input
    let locationValue = formData.get('eventLocation');
    if (locationValue === null || locationValue.toString().trim() === '') {
        createMessage("Please enter the location of the event", "main-message", "error");
        return;
    }
    else {
        updatedEvent['eventLocation'] = locationValue.toString();
    }
    //Validate event time input
    let timeValue = formData.get('eventTime');
    if (timeValue === null || timeValue.toString().trim() === '') {
        createMessage("Please enter the time of the event", "main-message", "error");
        return;
    }
    else {
        updatedEvent['eventTime'] = timeValue.toString();
    }
    //Get the event description from the textarea, validate, and turn it into a string
    let eventDescription = "";
    let eventDescriptionValue = formData.get('eventDescription');
    if (eventDescriptionValue === null || eventDescriptionValue.toString().trim() === '') {
        createMessage("Please enter a description for the event", "main-message", "error");
        return;
    }
    else {
        updatedEvent['eventDescription'] = eventDescriptionValue.toString();
    }
    //Get index of event object in array for local storage
    //This will probably change with proper data storage
    let eventObjIndex = eventsData.findIndex(item => item['eventId'] === paramEventId);
    eventsData[eventObjIndex] = updatedEvent;
    updateLocalStorage("events", eventsData);
    createMessage("The event was successfully updated", "main-message", "check_circle");
}
function populateEntriesTable(eventObject) {
    //Get signup entries for the event
    let eventSignUpEntries = signUpEntriesData.filter(entry => entry['eventId'] === paramEventId);
    if (eventSignUpEntries.length === 0) {
        entriesTable.remove();
        let noEntriesP = document.createElement('p');
        let noEntriesText = document.createTextNode(`No one has signed up for ${eventObject['eventTitle']} yet`);
        noEntriesP.appendChild(noEntriesText);
        entriesCard.appendChild(noEntriesP);
    }
    else {
        //Create the table body and add the entries
        let tableBody = document.createElement('tbody');
        eventSignUpEntries.forEach(entry => {
            let newRow = addITemToTable(entry, 4, "SignUpEntries");
            tableBody.appendChild(newRow);
        });
        entriesTable.appendChild(tableBody);
    }
}
function deleteEvent() {
    clearMessages();
    if (eventObject) {
        deleteItem("events", "eventId", eventObject['eventId']);
    }
    else {
        createMessage(`The was an error deleting the event. Please go back to the events page and try again`, "main-message", "error");
        deleteEventCard.remove();
    }
}
//If the event doesn't exist, remove cards from page and add an error card
if (!eventObject) {
    createMessage("Could not find event", "main-message", "error");
    editForm.remove();
    signUpEntriesCard.remove();
    deleteEventCard.remove();
    let errorCard = document.createElement('section');
    errorCard.setAttribute('class', 'card');
    let errorH2 = document.createElement('h2');
    let errorTite = document.createTextNode("Could not find event");
    errorH2.appendChild(errorTite);
    errorCard.appendChild(errorH2);
    let errorP = document.createElement('p');
    let errorMessage = document.createTextNode('The event you were looking for does not exist or the url is incorrect. Please go back to the events page and try again.');
    errorP.appendChild(errorMessage);
    errorCard.appendChild(errorP);
    let main = document.querySelector('main');
    if (main)
        main.appendChild(errorCard);
}
else {
    //Else, load the event data into the edit form and load the signup entries
    resetInfo(eventObject);
    populateEntriesTable(eventObject);
    //Event listener for the delete button
    deleteEventButton.addEventListener('click', () => deleteEvent());
    //Event listener for the reset form button
    resteEventInfoButton.addEventListener('click', (e) => {
        e.preventDefault();
        clearMessages();
        createMessage("Event information has been reset", "main-message", "info");
        resetInfo(eventObject);
    });
    //Event lsitener for the edit/update event form button
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearMessages();
        editEventInfo();
    });
}
