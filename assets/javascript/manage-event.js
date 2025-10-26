import { addItemToTable, createErrorMessage, updateLocalStorage } from './coreFunctions.js'

//Get event id from url
const queryString = window.location.search;
const urlParam = new URLSearchParams(queryString);
const parameventId = urlParam.get('id');
//Get data from local storage
let username = localStorage.getItem('username');
let isUserSignedIn = false;
const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries');
let SignUpEntriesData = JSON.parse(SignUpEntriesLocalStorge);
//Get event and sign up entries matching eventId
const eventObject = eventsData.find(eventObject => parseInt(eventObject.eventId) === parseInt(parameventId));
let eventSignUpEntries = SignUpEntriesData.filter(person => parseInt(person.eventId) === parseInt(parameventId));
//page elements
const editForm = document.getElementById('edit-form');
let eventTitleInput = document.getElementById('event-title');
let eventDateInput = document.getElementById('event-date');
let eventLocationInput = document.getElementById('event-location');
let eventTimeInput = document.getElementById('event-time');
let eventDescriptionInput = document.getElementById('event-description');
const resetButton = document.getElementById('reset');
const updateButton = document.getElementById('update');
const entriesTable = document.getElementById('entries-table');
const entriesTableBody = document.createElement('tbody');
entriesTable.appendChild(entriesTableBody);
const deleteCard = document.getElementById('deleteEventCard');
const deleteTitleH2 = document.getElementById('delete-title');
const deleteButton = document.getElementById('delete-button');

function checkIfSignedIn() {
    if (username) {
        let deleteTitle = document.createTextNode(`Delete "${eventObject.eventTitle}"`);
        deleteTitleH2.appendChild(deleteTitle);

        resetButton.addEventListener('click', function (event) {
            event.preventDefault();
            resetInfo();
        });

        updateButton.addEventListener('click', function (event) {
            event.preventDefault();
            updateEvent();
        });

        deleteButton.addEventListener('click', () => {
            deleteEvent();
        });
    } else {
        editForm.remove();
        deleteCard.remove();
        window.location.href = 'events.html';
    }
}

function resetInfo() {
    eventTitleInput.value = eventObject.eventTitle;
    let dateObj = new Date(eventObject.eventDate);
    let dateFormatted = dateObj.toISOString().split('T')[0]
    eventDateInput.value = dateFormatted;
    eventLocationInput.value = eventObject.eventLocation;
    eventTimeInput.value = eventObject.eventTime;
    eventDescriptionInput.value = eventObject.eventDescription;
}

function updateEvent() {
    //Update this when data storage is implemented
    let eventIndex = eventsData.findIndex(item => {
        return parseInt(item.eventId) === parseInt(parameventId);
    });
    let updatedEvent = {
        "eventId": parameventId,
        "eventTitle": eventTitleInput.value,
        "eventDate": eventDateInput.value,
        "eventLocation": eventLocationInput.value,
        "eventTime": eventTimeInput.value,
        "eventDescription": eventDescriptionInput.value,
        "numberAttending": eventObject.numberAttending
    }
    eventsData[eventIndex] = updatedEvent;
    updateLocalStorage("events", eventsData);
    window.location.reload();
}

function deleteEvent() {
    let signUpEntriesWithoutEvent = SignUpEntriesData.filter(item => parseInt(item.eventId) !== parseInt(parameventId));
    updateLocalStorage("SignUpEntries", signUpEntriesWithoutEvent);
    let arrayWithoutEvent = eventsData.filter(item => parseInt(item.eventId) !== parseInt(parameventId));
    updateLocalStorage("events", arrayWithoutEvent);
    window.location.href = 'events.html';
}

function populateEntiresTable() {
    //entriesTableBody
    let entiresLength = eventSignUpEntries.length;
    if (entiresLength === 0) {
        let noneRow = addItemToTable({}, 4);
        entriesTableBody.appendChild(noneRow);
    } else {
        for (let i = 0; i < entiresLength; i++) {
            let newRow = addItemToTable(eventSignUpEntries[i], 4, "SignUpEntries");
            entriesTableBody.appendChild(newRow);
        }
    }
}

checkIfSignedIn();
resetInfo();
populateEntiresTable();