const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);

//page elements
let createForm = document.getElementById('create-event');
let eventTitleInput = document.getElementById('event-title');
let eventDateInput = document.getElementById('event-date');
let eventLocationInput = document.getElementById('event-location');
let eventTimeInput = document.getElementById('event-time');
let eventDescriptionInput = document.getElementById('event-description');
const clearButton = document.getElementById('clear');
const submitButton = document.getElementById('submit');

function updateLocalStorage(itemName, data, ) {
    let dataString = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}

function createEvent() {
    let lastID = eventsData.reduce((prev, current) => {
        return (parseInt(prev.eventID) > parseInt(current.eventID)) ? prev : current;
    });
    let newEvent = {
        "eventID": lastID.eventID + 1,
        "eventTitle": eventTitleInput.value,
        "eventDate": eventDateInput.value,
        "eventLocation": eventLocationInput.value,
        "eventTime": eventTimeInput.value,
        "eventDescription": eventDescriptionInput.value,
        "numberAttending": 0
    }
    eventsData.push(newEvent);
    updateLocalStorage("events", eventsData);
    window.location.href = 'events.html';
}

submitButton.addEventListener('click', function(event) {
    event.preventDefault();
    createEvent();
});

clearButton.addEventListener('click', function(event) {
    event.preventDefault();
    createForm.reset();
});