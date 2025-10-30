import { clearMessages, createMessage, updateLocalStorage } from "./utils.js";
const createForm = document.getElementById('create-event');
const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);
function submitData() {
    //Get the data from the form
    let formData = new FormData(createForm);
    //Create an object for the new event
    let newEvent = {
        eventId: 0,
        eventTitle: "",
        eventDate: new Date(),
        eventLocation: "",
        eventTime: "",
        eventDescription: "",
        numberAttending: 0
    };
    //This shouldn't be needed when proper data storage is implemented
    newEvent['eventId'] = eventsData[eventsData.length - 1]['eventId'] + 1;
    //Validate the event title input
    let TitleValue = formData.get('eventTitle');
    if (TitleValue === null || TitleValue.toString().trim() === '') {
        createMessage("Please enter the title of the event", "main-message", "error");
        return;
    }
    else {
        newEvent['eventTitle'] = TitleValue.toString();
    }
    //Validate the event date input
    const dateValue = formData.get('eventDate');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date of the event", "main-message", "error");
        return;
    }
    else {
        newEvent['eventDate'] = new Date(dateValue.toString());
    }
    //Validate event location input
    let locationValue = formData.get('eventLocation');
    if (locationValue === null || locationValue.toString().trim() === '') {
        createMessage("Please enter the location of the event", "main-message", "error");
        return;
    }
    else {
        newEvent['eventLocation'] = locationValue.toString();
    }
    //Validate event time input
    let timeValue = formData.get('eventTime');
    if (timeValue === null || timeValue.toString().trim() === '') {
        createMessage("Please enter the time of the event", "main-message", "error");
        return;
    }
    else {
        newEvent['eventTime'] = timeValue.toString();
    }
    //Get the event description from the textarea, validate, and turn it into a string
    let eventDescription = "";
    let eventDescriptionValue = formData.get('eventDescription');
    if (eventDescriptionValue === null || eventDescriptionValue.toString().trim() === '') {
        createMessage("Please enter a description for the event", "main-message", "error");
        return;
    }
    else {
        newEvent['eventDescription'] = eventDescriptionValue.toString();
    }
    eventsData.push(newEvent);
    updateLocalStorage("events", eventsData);
    //Create a message saying event was sucessfully created
    window.location.href = 'events.html';
}
//Create form submit event listener
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});
