import { initializeApp } from "./app.js";
import { createMessage, fixDate } from "./utils.js";
import { getEventsList } from "./controller.js";
import { Event } from "./models.js";

let isUserSignedIn: boolean = false;
let main = document.getElementById('maincontent') as HTMLElement;

function addEventToPage(eventData: Event) {
    let newEvent: HTMLElement = document.createElement('article');
    newEvent.setAttribute('id', eventData['eventId'].toString());
    newEvent.setAttribute('class', 'card');
    let eventH3: HTMLElement = document.createElement('h3');
    let eventTitle: Text = document.createTextNode(eventData['eventTitle']);
    eventH3.appendChild(eventTitle);
    newEvent.appendChild(eventH3);
    let eventDateAndTimeH4: HTMLElement = document.createElement('h4');
    let eventDateAndTime: Text = document.createTextNode(`${fixDate(eventData['eventDate'].toString(), 'longDate')} ${eventData['eventTime']}`);
    eventDateAndTimeH4.appendChild(eventDateAndTime);
    newEvent.appendChild(eventDateAndTimeH4);
    let eventLocationH4: HTMLElement = document.createElement('h4');
    let eventLocation: Text = document.createTextNode(eventData['eventLocation']);
    eventLocationH4.appendChild(eventLocation);
    newEvent.appendChild(eventLocationH4);
    let numberAttendingH4: HTMLElement = document.createElement('h4');
    let numberAttending: Text = document.createTextNode(`Number Attending: ${eventData['numberAttending']}`);
    numberAttendingH4.appendChild(numberAttending);
    newEvent.appendChild(numberAttendingH4);
    let eventDescriptionP: HTMLElement = document.createElement('p');
    let eventDescription: Text = document.createTextNode(eventData['eventDescription']);
    eventDescriptionP.appendChild(eventDescription);
    newEvent.appendChild(eventDescriptionP);
    let buttonRow: HTMLElement = document.createElement('section');
    buttonRow.setAttribute('class', 'button-row left');
    let button: HTMLElement = document.createElement('a');
    button.setAttribute('class', 'secondary');
    if (isUserSignedIn) {
        //Add manage event button
        button.setAttribute('href', `manage-event.html?id=${eventData['eventId']}`);
        button.textContent = 'Manage Event';
    } else {
        //Add sign up button
        button.setAttribute('href', `event-sign-up.html?id=${eventData['eventId']}`);
        button.textContent = 'Sign Up';

    }
    buttonRow.appendChild(button);
    newEvent.appendChild(buttonRow);
    return newEvent;
}

function loadEvents() {
    //Get events list
    let eventsList: Event[] = getEventsList();
    if (eventsList.length === 0) {
        //Display no events message
        const noEventsCard = document.createElement('section');
        noEventsCard.setAttribute('id', 'no-events-card');
        noEventsCard.setAttribute('class', 'card');
        const noEventsP = document.createElement('p');
        const noEvents = document.createTextNode("There are currently no upcoming events. Please check back later.");
        noEventsP.appendChild(noEvents);
        noEventsCard.appendChild(noEventsP);
        main.appendChild(noEventsCard);
    } else {
        //Display all upcoming events
        const events = eventsList.reduce((acc: HTMLElement, currentEvent: Event) => {
            const newEvent = addEventToPage(currentEvent);
            acc.appendChild(newEvent);
            return acc;
        }, document.createElement('section'));
        events.setAttribute('id', 'events-list');
        main.appendChild(events);
    }
}

function checkIfSignedIn() {
    let username = localStorage.getItem("username");
    if (username) {
        isUserSignedIn = true;
        let createNewEventButton = document.createElement('a');
        createNewEventButton.setAttribute('href', 'create-new-event.html');
        createNewEventButton.setAttribute('class', 'secondary');
        let createEventIcon = document.createElement('span');
        createEventIcon.setAttribute('class', 'material-symbols-outlined');
        let iconName = document.createTextNode('calendar_add_on');
        createEventIcon.appendChild(iconName);
        createNewEventButton.appendChild(createEventIcon);
        let createEventButtonText = document.createTextNode('Create New Event')
        createNewEventButton.appendChild(createEventButtonText);
        let eventsHeader = document.getElementById('events-header') as HTMLElement;
        eventsHeader.appendChild(createNewEventButton);
    }
}

initializeApp('Upcoming Events', 'Upcoming Events');

checkIfSignedIn();
loadEvents();