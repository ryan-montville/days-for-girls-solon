const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries');
let SignUpEntriesData = JSON.parse(SignUpEntriesLocalStorge);

//Get event id from url
const queryString = window.location.search;
const urlParam = new URLSearchParams(queryString);
const paramEventID = urlParam.get('id');
//Get event matching eventID
const eventObject = eventsData.find(eventObject => parseInt(eventObject.eventID) === parseInt(paramEventID));

let isUserSignedIn = false;

//page elements
let editForm = document.getElementById('edit-form');
let eventTitleInput = document.getElementById('event-title');
let eventDateInput = document.getElementById('event-date');
let eventLocationInput = document.getElementById('event-location');
let eventTimeInput = document.getElementById('event-time');
let eventDescriptionInput = document.getElementById('event-description');
const resetButton = document.getElementById('reset');
const updateButton = document.getElementById('update');
let entriesTableBody = document.getElementById('entries-table-body');
let deleteCard = document.getElementById('deleteEventCard');
let deleteTitleH2 = document.getElementById('delete-title');
let deleteButton = document.getElementById('delete-button');

function resetInfo() {
    eventTitleInput.value = eventObject.eventTitle;
    let dateObj = new Date(eventObject.eventDate);
    let dateFormatted = dateObj.toISOString().split('T')[0]
    eventDateInput.value = dateFormatted;
    eventLocationInput.value = eventObject.eventLocation;
    eventTimeInput.value = eventObject.eventTime;
    eventDescriptionInput.value = eventObject.eventDescription;
}

function updateLocalStorage(itemName, data,) {
    let dataString = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}

function updateEvent() {
    let eventIndex = eventsData.findIndex(item => {
        return parseInt(item.eventID) === parseInt(paramEventID);
    });
    let updatedEvent = {
        "eventID": paramEventID,
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

function addToPersonTable(person) {
    let newRow = entriesTableBody.insertRow();
    let nameCell = newRow.insertCell();
    let name = document.createTextNode(person.fullName);
    nameCell.appendChild(name);
    let emailCell = newRow.insertCell();
    let email = document.createTextNode(person.email);
    emailCell.appendChild(email);
    let commentsCell = newRow.insertCell();
    let comments = document.createTextNode(person.comments);
    commentsCell.appendChild(comments);
}

function deleteEvent() {
    let signUpEntriesWithoutEvent = SignUpEntriesData.filter(item => parseInt(item.eventID) !== parseInt(paramEventID));
    updateLocalStorage("SignUpEntries", signUpEntriesWithoutEvent);
    let arrayWithoutEvent = eventsData.filter(item => parseInt(item.eventID) !== parseInt(paramEventID));
    updateLocalStorage("events", arrayWithoutEvent);
    window.location.href = 'events.html';
}

function checkIfSignedIn() {
    let username = localStorage.getItem('username');
    if (username) {
        isUserSignedIn = true;
    }
}

resetInfo();

let eventSignUpEntries = SignUpEntriesData.filter(person => parseInt(person.eventID) === parseInt(paramEventID));
for (let i = 0; i < eventSignUpEntries.length; i++) {
    addToPersonTable(eventSignUpEntries[i]);
}

checkIfSignedIn();
if (isUserSignedIn) {
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

