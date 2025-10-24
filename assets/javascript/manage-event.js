//Get event id from url
const queryString = window.location.search;
const urlParam = new URLSearchParams(queryString);
const paramEventID = urlParam.get('id');
//Get data from local storage
let username = localStorage.getItem('username');
let isUserSignedIn = false;
const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries');
let SignUpEntriesData = JSON.parse(SignUpEntriesLocalStorge);
//Get event and sign up entries matching eventID
const eventObject = eventsData.find(eventObject => parseInt(eventObject.eventID) === parseInt(paramEventID));
let eventSignUpEntries = SignUpEntriesData.filter(person => parseInt(person.eventID) === parseInt(paramEventID));
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

function addToPersonTable(person, empty) {
    let newRow = document.createElement('tr');
    if (!empty) {
        let nameCell = document.createElement('td');
        let name = document.createTextNode(person.fullName);
        nameCell.appendChild(name);
        newRow.appendChild(nameCell);
        let emailCell = document.createElement('td');
        let email = document.createTextNode(person.email);
        emailCell.appendChild(email);
        newRow.appendChild(emailCell);
        let commentsCell = document.createElement('td');
        let comments = document.createTextNode(person.comments);
        commentsCell.appendChild(comments);
        newRow.appendChild(commentsCell);
    } else {
        let noneCell = document.createElement('td');
        noneCell.setAttribute('colspan', '3');
        let noneText = document.createTextNode("No sign up entires for this event");
        noneCell.appendChild(noneText);
        newRow.appendChild(noneCell);
    }
    
    entriesTableBody.appendChild(newRow);
}

function deleteEvent() {
    let signUpEntriesWithoutEvent = SignUpEntriesData.filter(item => parseInt(item.eventID) !== parseInt(paramEventID));
    updateLocalStorage("SignUpEntries", signUpEntriesWithoutEvent);
    let arrayWithoutEvent = eventsData.filter(item => parseInt(item.eventID) !== parseInt(paramEventID));
    updateLocalStorage("events", arrayWithoutEvent);
    window.location.href = 'events.html';
}

function populateEntiresTable() {
    if (eventSignUpEntries.length === 0) {
        addToPersonTable('', true);
    } else {
        let l = eventSignUpEntries.length;
        for (let i = 0; i < l; i++) {
            addToPersonTable(eventSignUpEntries[i], false);
        }
    }
}

checkIfSignedIn();
resetInfo();
populateEntiresTable();