import { createErrorMessage, updateLocalStorage } from './coreFunctions.js'

const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);

//page elements
const createForm = document.getElementById('create-event');
const errorMessageMain = document.getElementById('mainError');

//Create form submit event listener
createForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let createEventData = new FormData(createForm);
    let lastID = eventsData.reduce((previous, current) => {
        return (parseInt(previous.eventID) > parseInt(current.eventID)) ? previous : current;
    });
    let eventDescription = "";
    if (createEventData.get('eventDescription')) {
        eventDescription = createEventData.get('eventDescription');
    }
    let newEvent = {
        "eventID": lastID.eventID + 1,
        "eventTitle": createEventData.get('eventTitle'),
        "eventDate": createEventData.get('eventDate'),
        "eventLocation": createEventData.get('eventLocation'),
        "eventTime": createEventData.get('eventTime'),
        "eventDescription": eventDescription,
        "numberAttending": 0
    }
    eventsData.push(newEvent);
    updateLocalStorage("events", eventsData);
    window.location.href = 'events.html';
});