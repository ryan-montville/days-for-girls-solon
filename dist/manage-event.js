import { createButton, createTableRow, createMessage, createDeleteModal, createTable, closeModal, fixDate, trapFocus } from "./utils.js";
import { deleteEvent, deleteSignUpEntry, getEvent, getSignUpsForEventId, updateEvent } from "./controller.js";
import { initializeApp } from "./app.js";
//Page Elements
const signUpEntriesCard = document.getElementById('sign-up-entires-card');
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
const eventObject = getEvent(paramEventId);
//Get modal backdrop elements
const editModalBackdrop = document.getElementById('edit-event-backdrop');
const editEventModal = document.getElementById('edit-event-modal');
function displayEventInfo(eventObject) {
    const eventInfoCard = document.getElementById('event-info');
    eventInfoCard.innerHTML = '';
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
    const editButton = createButton('Edit Event Info', 'button', 'editButton', 'primary', 'edit_calendar');
    editButton.addEventListener('click', () => {
        //Open the edit event modal
        editModalBackdrop.style.display = 'flex';
        editEventModal.setAttribute('aria-modal', 'true');
        const eventTitleInput = document.getElementById('eventTitle');
        eventTitleInput.focus();
        trapFocus(editEventModal, editModalBackdrop);
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
        createMessage("Please enter the title of the event", "edit-event-modal-message", "error");
        return;
    }
    else {
        updatedEvent['eventTitle'] = TitleValue.toString();
    }
    //Validate the event date input
    const dateValue = formData.get('eventDate');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date of the event", "edit-event-modal-message", "error");
        return;
    }
    else {
        updatedEvent['eventDate'] = new Date(dateValue.toString());
    }
    //Validate event location input
    let locationValue = formData.get('eventLocation');
    if (locationValue === null || locationValue.toString().trim() === '') {
        createMessage("Please enter the location of the event", "edit-event-modal-message", "error");
        return;
    }
    else {
        updatedEvent['eventLocation'] = locationValue.toString();
    }
    //Validate event time input
    let timeValue = formData.get('eventTime');
    if (timeValue === null || timeValue.toString().trim() === '') {
        createMessage("Please enter the time of the event", "edit-event-modal-message", "error");
        return;
    }
    else {
        updatedEvent['eventTime'] = timeValue.toString();
    }
    //Get the event description from the textarea, validate, and turn it into a string
    let eventDescriptionValue = formData.get('eventDescription');
    if (eventDescriptionValue === null || eventDescriptionValue.toString().trim() === '') {
        createMessage("Please enter a description for the event", "edit-event-modal-message", "error");
        return;
    }
    else {
        updatedEvent['eventDescription'] = eventDescriptionValue.toString();
    }
    updateEvent(updatedEvent);
    displayEventInfo(updatedEvent);
    closeModal("edit-event-backdrop");
    createMessage("The event was successfully updated", "main-message", "check_circle");
}
function addNewRow(newEntry) {
    //Create a new row for the table with the entry details
    const newRow = createTableRow(newEntry, 4, "signUpEntry");
    const deleteButton = newRow.querySelector("button");
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            //Create/open the modal and get the button row to add event lsiteners
            const buttonRow = createDeleteModal(newEntry, `Are you sure you want to delete this entry?`);
            if (buttonRow) {
                const noButton = buttonRow.children[0];
                const yesButton = buttonRow.children[1];
                if (yesButton) {
                    yesButton.addEventListener('click', () => {
                        //Delete the sign up entry
                        deleteSignUpEntry(newEntry['entryId']);
                        //Close the delete modal
                        closeModal('delete-item-backdrop');
                        //Create a message saying the sign up entry has been deleted
                        createMessage(`Deleted entry from ${newEntry['fullName']}`, "main-message", "delete");
                        //Remove the entry from the table
                        newRow.remove();
                    });
                }
                if (noButton) {
                    noButton.addEventListener('click', () => {
                        closeModal('delete-item-backdrop');
                    });
                }
            }
        });
    }
    return newRow;
}
function populateEntriesTable(eventObject) {
    //Get signup entries for the event
    let eventSignUpEntries = getSignUpsForEventId(paramEventId);
    if (eventSignUpEntries.length === 0) {
        let noEntriesP = document.createElement('p');
        let noEntriesText = document.createTextNode(`No one has signed up for ${eventObject['eventTitle']} yet`);
        noEntriesP.appendChild(noEntriesText);
        signUpEntriesCard.appendChild(noEntriesP);
    }
    else {
        //Create the table
        const tableColumnHeaders = ['Name', 'Email', 'Comments', 'Delete'];
        const signUpTable = createTable('sign-up-table', tableColumnHeaders);
        let tableBody = eventSignUpEntries.reduce((acc, currentEntry) => {
            const newRow = addNewRow(currentEntry);
            acc.appendChild(newRow);
            return acc;
        }, document.createElement('tbody'));
        signUpTable.appendChild(tableBody);
        signUpEntriesCard.appendChild(signUpTable);
    }
}
initializeApp('Upcoming Events', 'Manage Event');
//If the event doesn't exist, remove cards from page and add an error card
if (eventObject === null) {
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
    //Event listener for the delete button
    deleteEventButton.addEventListener('click', () => {
        //Need a way for the controller to tell the page to redirect and display message
        const buttonRow = createDeleteModal(eventObject, "Are you sure you want to delete this event?");
        if (buttonRow) {
            const noButton = buttonRow.children[0];
            const yesButton = buttonRow.children[1];
            if (yesButton) {
                yesButton.addEventListener('click', () => {
                    //Delete the log entry
                    deleteEvent(paramEventId);
                    //Close the delete modal
                    closeModal('delete-item-backdrop');
                    //Create a message saying the log entry has been deleted
                    createMessage(`Deleted event ${eventObject['eventTitle']} ${eventObject['eventDate']}`, "main-message", "delete");
                    //Figure out way to redirect to events page and display the message
                });
            }
            if (noButton) {
                noButton.addEventListener('click', () => {
                    closeModal('delete-item-backdrop');
                });
            }
        }
    });
    //Event listener to reset the form to the event data
    let resetFormButton = document.getElementById('reset');
    resetFormButton.addEventListener('click', (e) => {
        e.preventDefault();
        resetInfo(eventObject);
    });
    //Event listener to close the edit event modal
    const cancelFormButton = document.getElementById('cancel');
    cancelFormButton.addEventListener('click', () => { closeModal("edit-event-backdrop"); });
    //Event listener to submit the data to update the event
    editEventModal.addEventListener('submit', (e) => {
        e.preventDefault();
        editEventInfo();
    });
}
