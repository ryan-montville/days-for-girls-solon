const mainElement = document.querySelector('main');
const eventsHeader = document.getElementById('events-header');
const eventLocalStorage = localStorage.getItem('events');
const eventData = JSON.parse(eventLocalStorage);
let isUserSignedIn = false;

function createEventElement(eventData) {
    let newEvent = document.createElement('section');
    newEvent.setAttribute('id', eventData.eventID);
    newEvent.setAttribute('class', 'card');
    let eventH3 = document.createElement('h3');
    let eventTitle = document.createTextNode(eventData.eventTitle);
    eventH3.appendChild(eventTitle);
    newEvent.appendChild(eventH3);
    let eventDateAndTimeH4 = document.createElement('h4');
    let eventDateAndTime = document.createTextNode(`${eventData.eventDate} ${eventData.eventTime}`);
    eventDateAndTimeH4.appendChild(eventDateAndTime);
    newEvent.appendChild(eventDateAndTimeH4);
    let eventLocationH4 = document.createElement('h4');
    let eventLocation = document.createTextNode(eventData.eventLocation);
    eventLocationH4.appendChild(eventLocation);
    newEvent.appendChild(eventLocationH4);
    let numberAttendingH4 = document.createElement('h4');
    let numberAttending = document.createTextNode(`(what to call this): ${eventData.numberAttending}`);
    numberAttendingH4.appendChild(numberAttending);
    newEvent.appendChild(numberAttendingH4);
    let eventDiscriptionP = document.createElement('p');
    let eventDiscription = document.createTextNode(eventData.eventDiscription);
    eventDiscriptionP.appendChild(eventDiscription);
    newEvent.appendChild(eventDiscriptionP);
    let button = document.createElement('a');
    button.setAttribute('class', 'action-button');
    if (isUserSignedIn) {
        //Add manage event button
        button.setAttribute('href', `manage-event.html?id=${eventData.eventID}`);
        button.textContent = 'Manage Event';
        
    } else {
        //Add sign up button
        button.setAttribute('href', `event-sign-up.html?id=${eventData.eventID}`);
        button.textContent = 'Sign Up';

    }
    newEvent.appendChild(button);
    mainElement.appendChild(newEvent);
}

function checkIfSignedIn() {
    let username = localStorage.getItem('username');
    if(username) {
        isUserSignedIn = true;
    }
}

checkIfSignedIn();

if (isUserSignedIn) {
    let createNewEventButton = document.createElement('a');
    createNewEventButton.setAttribute('href', 'create-new-event.html');
    createNewEventButton.setAttribute('class', 'action-button');
    createNewEventButton.textContent = "Create New Event";
    eventsHeader.appendChild(createNewEventButton);
}
for (let i=0; i<eventData.length; i++) {
    createEventElement(eventData[i]);
}