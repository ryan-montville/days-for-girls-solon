import { Timestamp } from "firebase/firestore";
import { clearMessages, createMessage, storeMessage } from "./utils.js";
import { initializeApp } from "./app.js";
import { createNewEvent, getNextEventId } from "./controller.js";
import { addEvent } from "./firebaseService.js";
import { Event } from "./models";

const createForm = document.getElementById('create-event') as HTMLFormElement;

function submitData() {
    //Get the data from the form
    let formData: FormData = new FormData(createForm);
    //Create an object for the new event
    let newEvent: Event = {
        eventId: 0,
        eventTitle: "",
        eventDate: Timestamp.fromDate(new Date(0)),
        eventLocation: "",
        eventTime: "",
        eventDescription: "",
        numberAttending: 0
    }
    //This shouldn't be needed when proper data storage is implemented
    newEvent['eventId'] = getNextEventId();
    //Validate the event title input
    let TitleValue = formData.get('eventTitle');
    if (TitleValue === null || TitleValue.toString().trim() === '') {
        createMessage("Please enter the title of the event", "main-message", "error");
        return;
    } else {
        newEvent['eventTitle'] = TitleValue.toString();
    }
    //Validate the event date input
    const dateValue = formData.get('eventDate');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date of the event", "main-message", "error");
        return;
    }
     else {
        //Converting dateValue to a js date object 
        const jsDate = new Date(dateValue.toString());
        newEvent['eventDate'] = Timestamp.fromDate(jsDate);
     }
     //Validate event location input
     let locationValue = formData.get('eventLocation');
     if (locationValue === null || locationValue.toString().trim() === '') {
        createMessage("Please enter the location of the event", "main-message", "error");
        return;
     } else {
        newEvent['eventLocation'] = locationValue.toString();
     }
     //Validate event time input
     let timeValue = formData.get('eventTime');
     if (timeValue === null || timeValue.toString().trim() === '') {
        createMessage("Please enter the time of the event", "main-message", "error");
        return;
     } else {
        newEvent['eventTime'] = timeValue.toString();
     }
    //Get the event description from the textarea, validate, and turn it into a string
    let eventDescription: string = "";
    let eventDescriptionValue = formData.get('eventDescription');
    if (eventDescriptionValue === null || eventDescriptionValue.toString().trim() === '') {
        createMessage("Please enter a description for the event", "main-message", "error");
        return;
    } else {
        newEvent['eventDescription'] = eventDescriptionValue.toString();
    }
    addEvent(newEvent);
    //Create a message saying event was sucessfully created and store it to be displayed on events page
    storeMessage(`Sucessfully created event '${newEvent['eventTitle']}'`, 'main-message', 'check_circle');
    //Redirect to the events page
    window.location.href = 'events.html';
}

initializeApp('Upcoming Events', 'Create Event');

//Create form submit event listener
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});