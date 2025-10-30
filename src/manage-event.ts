import { addITemToTable, createMessage, clearMessages, fixDate, updateLocalStorage } from "./utils.js";
import { SignUpEntry, Event } from "./models.js";

const eventsLocalStorage = localStorage.getItem('events') as string;
let eventsData: Event[] = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries') as string;
let signUpEntriesData: SignUpEntry[] = JSON.parse(SignUpEntriesLocalStorge);
const editForm = document.getElementById('edit-form') as HTMLFormElement;
const resteEventInfoButton = document.getElementById('reset') as HTMLElement;
const entriesCard = document.getElementById('sign-up-entires') as HTMLElement;
const entriesTable = document.getElementById('entries-table') as HTMLElement;
const signUpEntriesCard = document.getElementById('sign-up-entires') as HTMLElement;
const deleteEventCard = document.getElementById('deleteEventCard') as HTMLElement;
const deleteEventButton = document.getElementById('delete-button') as HTMLElement;

//Get event id from url
const queryString: string = window.location.search;
const urlParams = new URLSearchParams(queryString);
const idString: string | null = urlParams.get('id');
let paramEventId: number = 0;
if (idString) {
    const parsedId: number = parseInt(idString, 10);
    if (!isNaN(parsedId)) {
        paramEventId = parsedId;
    } else {
        createMessage("Could not find event", "main-message", "error");
    }
} else {
    createMessage("Could not find event", "main-message", "error");
}
//Get event matching eventId
const eventObject: Event | undefined = eventsData.find(eventObject => eventObject['eventId'] === paramEventId);

function resetInfo(eventObject: Event) {
    //Get event title input and set the value
    let eventTitleInput = document.getElementById('event-title') as HTMLInputElement;
    eventTitleInput.value = eventObject['eventTitle'];
    //Get event date input, create a new date object, get the date, and set the value
    let eventDateInput = document.getElementById('event-date') as HTMLInputElement;
    let eventDate: Date = new Date(eventObject['eventDate']);
    eventDateInput.value = eventDate.toISOString().split('T')[0];
    //Get event location input and set the value
    let eventLocationInput = document.getElementById('event-location') as HTMLInputElement;
    eventLocationInput.value = eventObject['eventLocation'];
    //Get event time input and set the value
    let eventTimeInput = document.getElementById('event-time') as HTMLInputElement;
    eventTimeInput.value = eventObject['eventTime'];
    //Get event description textarea and set the value
    let eventDescriptionInput = document.getElementById('event-description') as HTMLInputElement
    eventDescriptionInput.value = eventObject['eventDescription'];
}

function editEventInfo() {

}

function populateEntriesTable(eventObject: Event) {
    //Get signup entries for the event
    let eventSignUpEntries: SignUpEntry[] = signUpEntriesData.filter(entry => entry['eventId'] === paramEventId);
    if (eventSignUpEntries.length === 0) {
        entriesTable.remove();
        let noEntriesP = document.createElement('p');
        let noEntriesText = document.createTextNode(`No one has signed up for ${eventObject['eventTitle']} yet`);
        noEntriesP.appendChild(noEntriesText);
        entriesCard.appendChild(noEntriesP);
    } else {
        //Create the table body and add the entries
        let tableBody = document.createElement('tbody');
        eventSignUpEntries.forEach(entry => {
            let newRow = addITemToTable(entry, 4, "SignUpEntries");
            tableBody.appendChild(newRow);
        });
        entriesTable.appendChild(tableBody);
    }
}

function deleteEvent() {
    clearMessages();
    if (eventObject) {
        let signUpEntriesWithoutEvent = signUpEntriesData.filter(item => item['eventId'] !== paramEventId);
        updateLocalStorage("SignUpEntries", signUpEntriesWithoutEvent);
        let arrayWithoutEvent = eventsData.filter(item => item['eventId'] !== paramEventId);
        updateLocalStorage("events", arrayWithoutEvent);
        createMessage(`"${eventObject['eventTitle']} has been deleted"`, "main-message", "delete");
        //Figure out how to pass the message to the events page if redirecting user
        // window.location.href = 'events.html';
    } else {
        createMessage(`The was an error deleting the event. Please go back to the events page and try again`, "main-message", "error");
        deleteEventCard.remove();
    }

}

//If the event doesn't exist, remove cards from page and add an error card
if (!eventObject) {
    createMessage("Could not find event", "main-message", "error");
    editForm.remove();
    signUpEntriesCard.remove();
    deleteEventCard.remove();
    let errorCard = document.createElement('section');
    errorCard.setAttribute('class', 'card');
    let errorH2 = document.createElement('h2');
    let errorTite = document.createTextNode("Could not find event");
    errorH2.appendChild(errorTite);
    errorCard.appendChild(errorH2);
    let errorP = document.createElement('p');
    let errorMessage = document.createTextNode('The event you were looking for does not exist or the url is incorrect. Please go back to the events page and try again.');
    errorP.appendChild(errorMessage);
    errorCard.appendChild(errorP);
    let main = document.querySelector('main');
    if (main) main.appendChild(errorCard);
} else {
    //Else, load the event data into the edit form and load the signup entries
    resetInfo(eventObject);
    populateEntriesTable(eventObject);
    //Event listener for the delete button
    deleteEventButton.addEventListener('click', () => deleteEvent());
    //Event listener for the reset form button
    resteEventInfoButton.addEventListener('click', (e) => {
        e.preventDefault();
        clearMessages();
        createMessage("Event information has been reset", "main-message", "info");
        resetInfo(eventObject);
    });
    //Event lsitener for the edit/update event form button
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearMessages();
        editEventInfo();
    });
}



