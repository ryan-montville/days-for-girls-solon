import { clearMessages, createMessage, storeMessage } from "./utils.js";
import { initializeApp } from "./app.js";
import { addEvent } from "./firebaseService.js";
import { Timestamp } from "firebase/firestore";
import { Event } from "./models.js";

const createForm = document.getElementById('create-event') as HTMLFormElement;

async function submitData() {
    //Clear any messages
    clearMessages();
    //Get the data from the form
    const formData: FormData = new FormData(createForm);
    //Create an object for the new event
    let newEventData: Omit<Event, 'eventId'> = {
        eventTitle: "",
        eventDate: Timestamp.fromDate(new Date(0)),
        eventLocation: "",
        eventTime: "",
        eventDescription: "",
        numberAttending: 0
    };

    //Validate and set the event title
    let TitleValue = formData.get('eventTitle');
    if (TitleValue === null || TitleValue.toString().trim() === '') {
        createMessage("Please enter the title of the event", "main-message", "error");
        return;
    } else {
        newEventData['eventTitle'] = TitleValue.toString();
    }
    //Validate and set the event data
    const dateValue = formData.get('eventDate');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date of the event", "main-message", "error");
        return;
    } else {
        const jsDate = new Date(dateValue.toString());
        newEventData.eventDate = Timestamp.fromDate(jsDate);
    }
    //Validate and set the event location
    const locationValue = formData.get('eventLocation');
    if (locationValue === null || locationValue.toString().trim() === '') {
        createMessage("Please enter the location of the event", "main-message", "error");
        return;
    } else {
        newEventData['eventLocation'] = locationValue.toString();
    }
    //Validate and set the event time
    const timeValue = formData.get('eventTime');
    if (timeValue === null || timeValue.toString().trim() === '') {
        createMessage("Please enter the time of the event", "main-message", "error");
        return;
    } else {
        newEventData['eventTime'] = timeValue.toString();
    }
    //Validate and set the event description
    const eventDescriptionValue = formData.get('eventDescription');
    if (eventDescriptionValue === null || eventDescriptionValue.toString().trim() === '') {
        createMessage("Please enter a description for the event", "main-message", "error");
        return;
    } else {
        newEventData['eventDescription'] = eventDescriptionValue.toString();
    }
    //Add the event to the firestore
    try {
        await addEvent(newEventData);
        /* Create a message saying event was successfully created and store it.
        It will be displayed on events page */
        storeMessage(`Successfully created event '${newEventData.eventTitle}'`, 'main-message', 'check_circle');
        // Redirect to the events page
        window.location.href = 'events.html';
    } catch (error) {
        createMessage("Failed to create event. Please try again.", 'main-message', 'error');
    }
}

initializeApp('Upcoming Events', 'Create Event');

//Create form submit event listener
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});