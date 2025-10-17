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

function resetInfo() {
    eventTitleInput.value = eventObject.eventTitle;
    // TODO: fix date value
    eventDateInput.value = eventObject.eventDate;
    eventLocationInput.value = eventObject.eventLocation;
    eventTimeInput.value = eventObject.eventTime;
    eventDescriptionInput.value = eventObject.eventDescription;
}

function updateEvent() {

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

resetInfo();

let eventSignUpEntries = SignUpEntriesData.filter(person => parseInt(person.eventID) === parseInt(paramEventID));
for (let i=0; i< eventSignUpEntries.length; i++) {
    addToPersonTable(eventSignUpEntries[i]);
}

resetButton.addEventListener('click', function(event) {
    event.preventDefault();
    resetInfo();
});

updateButton.addEventListener('click', function(event) {
    event.preventDefault();
});