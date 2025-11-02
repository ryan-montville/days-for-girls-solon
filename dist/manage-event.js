import { addITemToTable, createMessage, clearMessages, deleteItem, fixDate, updateLocalStorage } from "./utils.js";
const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries');
let signUpEntriesData = JSON.parse(SignUpEntriesLocalStorge);
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
//Get modal backdrop elements
const editModalBackdrop = document.getElementById('edit-event-backdrop');
const editEventModal = document.getElementById('edit-event-modal');
const deleteEventModalBackdrop = document.getElementById('delete-item-backdrop');
function displayEventInfo(eventObject) {
    const eventInfoCard = document.getElementById('event-info');
    const eventH2 = document.createElement('h2');
    const eventTitle = document.createTextNode(eventObject['eventTitle']);
    eventH2.appendChild(eventTitle);
    eventInfoCard.appendChild(eventH2);
    const eventDateAndTimeH3 = document.createElement('h3');
    const eventDateAndTime = document.createTextNode(`${fixDate(eventObject['eventDate'].toString(), 'longDate')} ${eventObject['eventTime']}`);
    eventDateAndTimeH3.appendChild(eventDateAndTime);
    eventInfoCard.appendChild(eventDateAndTimeH3);
    const eventLocationH3 = document.createElement('h3');
    const eventLocation = document.createTextNode(eventObject['eventLocation']);
    eventLocationH3.appendChild(eventLocation);
    eventInfoCard.appendChild(eventLocationH3);
    const numberAttendingH3 = document.createElement('h3');
    const numberAttending = document.createTextNode(`Number Attending: ${eventObject['numberAttending']}`);
    numberAttendingH3.appendChild(numberAttending);
    eventInfoCard.appendChild(numberAttendingH3);
    const eventDescriptionP = document.createElement('p');
    const eventDescription = document.createTextNode(eventObject['eventDescription']);
    eventDescriptionP.appendChild(eventDescription);
    eventInfoCard.appendChild(eventDescriptionP);
    const buttonRow = document.createElement('section');
    buttonRow.setAttribute('class', 'form-row');
    const editButton = document.createElement('button');
    editButton.setAttribute('class', 'primary');
    editButton.setAttribute('type', 'button');
    const editIcon = document.createElement('span');
    editIcon.setAttribute('class', 'material-symbols-outlined');
    const editIconName = document.createTextNode('edit');
    editIcon.appendChild(editIconName);
    editButton.appendChild(editIcon);
    const editButtonText = document.createTextNode('Edit Event Info');
    editButton.appendChild(editButtonText);
    editButton.addEventListener('click', () => {
        //Open the edit event modal
        editModalBackdrop.style.display = 'flex';
        editEventModal.setAttribute('aria-modal', 'true');
        isEditModalOpen = true;
    });
    buttonRow.appendChild(editButton);
    eventInfoCard.appendChild(buttonRow);
}
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
    let formData = new FormData(editEventModal);
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
function closeModal(modal) {
    if (modal === 'delete') {
        deleteEventModalBackdrop.setAttribute('aria-modal', 'false');
        deleteEventModalBackdrop.style.display = 'none';
    }
    else if (modal === 'edit') {
        editModalBackdrop.setAttribute('aria-modal', 'false');
        editModalBackdrop.style.display = 'none';
        editEventModal.reset();
    }
}
//If the event doesn't exist, remove cards from page and add an error card
if (!eventObject) {
    createMessage("Could not find event", "main-message", "error");
    editEventModal.remove();
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
    displayEventInfo(eventObject);
    //Some where need to add event listener for the cancel, reset and submit buttons inside the edit form modal
    //Instead of submit its editEventInfo();
    //Event listener for the delete button
    deleteEventButton.addEventListener('click', () => {
        //Need a way to see if deleteItem() in utils closes the modal, change boolean back to false
        deleteEvent();
    });
}
//Event listener to submit the data to update the form
//Event listener to reset the form to the event data
//Event listener to close the edit event modal
