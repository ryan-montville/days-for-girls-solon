import { updateLocalStorage } from "./utils.js";
const createForm = document.getElementById('create-event');
const eventsLocalStorage = localStorage.getItem('events');
let eventsData = [];
if (eventsLocalStorage) {
    eventsData = JSON.parse(eventsLocalStorage);
}
//Create form submit event listener
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let formData = new FormData(createForm);
    //This shouldn't be needed when proper data storage is implemented
    let lastEvent = eventsData.reduce((previous, current) => {
        return (previous['eventId'] > current['eventId']) ? previous : current;
    });
    let lastId = lastEvent['eventId'];
    //Get the event description from the textarea and turn it into a string
    let eventDescription = "";
    let eventDescriptionValue = formData.get('eventDescription');
    if (eventDescriptionValue !== null) {
        eventDescription = eventDescriptionValue;
    }
    let newEvent = {
        eventId: lastId + 1,
        eventTitle: formData.get('eventTitle'),
        eventDate: formData.get('eventDate'),
        eventLocation: formData.get('eventLocation'),
        eventTime: formData.get('eventTime'),
        eventDescription: eventDescription,
        numberAttending: 0
    };
    eventsData.push(newEvent);
    updateLocalStorage("events", eventsData);
    //Create a message saying event was sucessfully created
    window.location.href = 'events.html';
});
