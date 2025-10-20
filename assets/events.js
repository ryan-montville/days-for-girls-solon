const mainElement = document.querySelector('main');
const eventsHeader = document.getElementById('events-header');
const eventLocalStorage = localStorage.getItem('events');
const eventData = JSON.parse(eventLocalStorage);
const errorMessageMain = document.getElementById('mainError');
let username = localStorage.getItem('username');
let isUserSignedIn = false;

function createErrorMessage(error, location) {
    if (location === "main") {
        let p = document.createElement('p');
        let errorIcon = document.createElement('i');
        errorIcon.setAttribute('class', 'material-symbols-outlined')
        let iconName = document.createTextNode('error');
        errorIcon.appendChild(iconName);
        p.appendChild(errorIcon);
        p.setAttribute('id', 'errorMessageMainP')
        let errorMessageText = document.createTextNode(error);
        p.appendChild(errorMessageText);
        errorMessageMain.appendChild(p);
    }

}

function createEventElement(eventData) {
    let newEvent = document.createElement('section');
    newEvent.setAttribute('id', eventData.eventID);
    newEvent.setAttribute('class', 'card');
    let eventH3 = document.createElement('h3');
    let eventTitle = document.createTextNode(eventData.eventTitle);
    eventH3.appendChild(eventTitle);
    newEvent.appendChild(eventH3);
    let eventDateAndTimeH4 = document.createElement('h4');
    /* I learned how to fix the date being off by one from this
    stackOverflow thread: https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off */
    let dateObj = new Date(eventData.eventDate);
    let dateTimezoneFixed = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * -60000);
    let dateFormatted = dateTimezoneFixed.toDateString();
    let eventDateAndTime = document.createTextNode(`${dateFormatted} ${eventData.eventTime}`);
    eventDateAndTimeH4.appendChild(eventDateAndTime);
    newEvent.appendChild(eventDateAndTimeH4);
    let eventLocationH4 = document.createElement('h4');
    let eventLocation = document.createTextNode(eventData.eventLocation);
    eventLocationH4.appendChild(eventLocation);
    newEvent.appendChild(eventLocationH4);
    let numberAttendingH4 = document.createElement('h4');
    let numberAttending = document.createTextNode(`Number Attending: ${eventData.numberAttending}`);
    numberAttendingH4.appendChild(numberAttending);
    newEvent.appendChild(numberAttendingH4);
    let eventDescriptionP = document.createElement('p');
    let eventDescription = document.createTextNode(eventData.eventDescription);
    eventDescriptionP.appendChild(eventDescription);
    newEvent.appendChild(eventDescriptionP);
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
    if (username) {
        isUserSignedIn = true;
        let createNewEventButton = document.createElement('a');
        createNewEventButton.setAttribute('href', 'create-new-event.html');
        createNewEventButton.setAttribute('class', 'action-button');
        createNewEventButton.textContent = "Create New Event";
        eventsHeader.appendChild(createNewEventButton);
    }
}

checkIfSignedIn();

for (let i = 0; i < eventData.length; i++) {
    createEventElement(eventData[i]);
}