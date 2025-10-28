import { fixDate } from "./utils.js";
let isUserSignedIn = false;
function addEventToPage(eventData) {
    let newEvent = document.createElement('article');
    newEvent.setAttribute('id', eventData['eventId'].toString());
    newEvent.setAttribute('class', 'card');
    let eventH3 = document.createElement('h3');
    let eventTitle = document.createTextNode(eventData['eventTitle']);
    eventH3.appendChild(eventTitle);
    newEvent.appendChild(eventH3);
    let eventDateAndTimeH4 = document.createElement('h4');
    let eventDateAndTime = document.createTextNode(`${fixDate(eventData.eventDate, 'longDate')} ${eventData.eventTime}`);
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
    let buttonRow = document.createElement('section');
    buttonRow.setAttribute('class', 'button-row left');
    let button = document.createElement('a');
    button.setAttribute('class', 'secondary');
    if (isUserSignedIn) {
        //Add manage event button
        button.setAttribute('href', `manage-event.html?id=${eventData.eventId}`);
        button.textContent = 'Manage Event';
    }
    else {
        //Add sign up button
        button.setAttribute('href', `event-sign-up.html?id=${eventData.eventId}`);
        button.textContent = 'Sign Up';
    }
    buttonRow.appendChild(button);
    newEvent.appendChild(buttonRow);
    let main = document.getElementById('maincontent');
    main.appendChild(newEvent);
}
function loadEvents() {
    const eventsData = localStorage.getItem("events");
    let eventsList = [];
    if (eventsData) {
        eventsList = JSON.parse(eventsData);
    }
    const sortedEvents = eventsList.sort((a, b) => {
        const dateA = new Date(a['eventDate']).getTime();
        const dateB = new Date(b['eventDate']).getTime();
        return dateA - dateB;
    });
    const eventsListLength = sortedEvents.length;
    for (let i = 0; i < eventsListLength; i++) {
        addEventToPage(sortedEvents[i]);
    }
}
function checkIfSignedIn() {
    let username = localStorage.getItem("username");
    if (username) {
        isUserSignedIn = true;
        let createNewEventButton = document.createElement('a');
        createNewEventButton.setAttribute('href', 'create-new-event.html');
        createNewEventButton.setAttribute('class', 'secondary');
        createNewEventButton.textContent = "Create New Event";
        let eventsHeader = document.getElementById('events-header');
        eventsHeader.appendChild(createNewEventButton);
    }
}
checkIfSignedIn();
loadEvents();
