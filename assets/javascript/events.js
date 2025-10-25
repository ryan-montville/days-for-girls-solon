import { createErrorMessage, fixDate, updateLocalStorage } from "./coreFunctions.js";

const mainElement = document.querySelector('main');
const eventsHeader = document.getElementById('events-header');
const eventLocalStorage = localStorage.getItem('events');
const eventsData = JSON.parse(eventLocalStorage);
const errorMessageMain = document.getElementById('mainError');
let username = localStorage.getItem('username');
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
    let eventDateAndTime = document.createTextNode(`${fixDate(eventData.eventDate, false)} ${eventData.eventTime}`);
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

function loadEvents() {
    const eventsListSorted = eventsData.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    let l = eventsListSorted.length
    for (let i = 0; i < l; i++) {
        createEventElement(eventsListSorted[i]);
    }
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
loadEvents();