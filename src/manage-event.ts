import { addITemToTable, createMessage, clearMessages, closeModal, deleteItem, fixDate, updateLocalStorage } from "./utils.js";
import { SignUpEntry, Event } from "./models.js";

const eventsLocalStorage = localStorage.getItem('events') as string;
let eventsData: Event[] = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries') as string;
let signUpEntriesData: SignUpEntry[] = JSON.parse(SignUpEntriesLocalStorge);
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
//Get modal backdrop elements
const editModalBackdrop = document.getElementById('edit-event-backdrop') as HTMLElement;
const editEventModal = document.getElementById('edit-event-modal') as HTMLFormElement;
const deleteEventModalBackdrop = document.getElementById('delete-item-backdrop') as HTMLElement;

function displayEventInfo(eventObject: Event) {
    const eventInfoCard = document.getElementById('event-info') as HTMLElement;
    eventInfoCard.innerHTML = '';
    const eventH2: HTMLElement = document.createElement('h2');
    const eventTitle: Text = document.createTextNode(eventObject['eventTitle']);
    eventH2.appendChild(eventTitle);
    eventInfoCard.appendChild(eventH2);
    const eventDateAndTimeH3: HTMLElement = document.createElement('h3');
    const eventDateAndTime: Text = document.createTextNode(`${fixDate(eventObject['eventDate'].toString(), 'longDate')} ${eventObject['eventTime']}`);
    eventDateAndTimeH3.appendChild(eventDateAndTime);
    eventInfoCard.appendChild(eventDateAndTimeH3);
    const eventLocationH3: HTMLElement = document.createElement('h3');
    const eventLocation: Text = document.createTextNode(eventObject['eventLocation']);
    eventLocationH3.appendChild(eventLocation);
    eventInfoCard.appendChild(eventLocationH3);
    const numberAttendingH3: HTMLElement = document.createElement('h3');
    const numberAttending: Text = document.createTextNode(`Number Attending: ${eventObject['numberAttending']}`);
    numberAttendingH3.appendChild(numberAttending);
    eventInfoCard.appendChild(numberAttendingH3);
    const eventDescriptionP: HTMLElement = document.createElement('p');
    const eventDescription: Text = document.createTextNode(eventObject['eventDescription']);
    eventDescriptionP.appendChild(eventDescription);
    eventInfoCard.appendChild(eventDescriptionP);
    const buttonRow: HTMLElement = document.createElement('section');
    buttonRow.setAttribute('class', 'form-row');
    const editButton = document.createElement('button');
    editButton.setAttribute('class', 'primary');
    editButton.setAttribute('type', 'button');
    const editIcon = document.createElement('span');
    editIcon.setAttribute('class', 'material-symbols-outlined');
    const editIconName = document.createTextNode('edit');
    editIcon.appendChild(editIconName);
    editButton.appendChild(editIcon);
    const editButtonText = document.createTextNode('Edit Event Info');
    editButton.appendChild(editButtonText);
    editButton.addEventListener('click', () => {
        //Open the edit event modal
        editModalBackdrop.style.display = 'flex';
        editEventModal.setAttribute('aria-modal', 'true');
    });
    buttonRow.appendChild(editButton);
    eventInfoCard.appendChild(buttonRow);

}

function resetInfo(eventObject: Event) {
    //Get event title input and set the value
    let eventTitleInput = document.getElementById('eventTitle') as HTMLInputElement;
    eventTitleInput.value = eventObject['eventTitle'];
    //Get event date input, create a new date object, get the date, and set the value
    let eventDateInput = document.getElementById('eventDate') as HTMLInputElement;
    let eventDate: Date = new Date(eventObject['eventDate']);
    eventDateInput.value = eventDate.toISOString().split('T')[0];
    //Get event location input and set the value
    let eventLocationInput = document.getElementById('eventLocation') as HTMLInputElement;
    eventLocationInput.value = eventObject['eventLocation'];
    //Get event time input and set the value
    let eventTimeInput = document.getElementById('eventTime') as HTMLInputElement;
    eventTimeInput.value = eventObject['eventTime'];
    //Get event description textarea and set the value
    let eventDescriptionInput = document.getElementById('eventDescription') as HTMLInputElement
    eventDescriptionInput.value = eventObject['eventDescription'];
}

function editEventInfo() {
    let formData: FormData = new FormData(editEventModal);
    //Create an object for the updated event
    let updatedEvent: Event = {
        eventId: paramEventId,
        eventTitle: "",
        eventDate: new Date(),
        eventLocation: "",
        eventTime: "",
        eventDescription: "",
        numberAttending: 0
    }
    //Validate the event title input
    let TitleValue = formData.get('eventTitle');
    if (TitleValue === null || TitleValue.toString().trim() === '') {
        createMessage("Please enter the title of the event", "main-message", "error");
        return;
    } else {
        updatedEvent['eventTitle'] = TitleValue.toString();
    }
    //Validate the event date input
    const dateValue = formData.get('eventDate');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date of the event", "main-message", "error");
        return;
    }
    else {
        updatedEvent['eventDate'] = new Date(dateValue.toString());
    }
    //Validate event location input
    let locationValue = formData.get('eventLocation');
    if (locationValue === null || locationValue.toString().trim() === '') {
        createMessage("Please enter the location of the event", "main-message", "error");
        return;
    } else {
        updatedEvent['eventLocation'] = locationValue.toString();
    }
    //Validate event time input
    let timeValue = formData.get('eventTime');
    if (timeValue === null || timeValue.toString().trim() === '') {
        createMessage("Please enter the time of the event", "main-message", "error");
        return;
    } else {
        updatedEvent['eventTime'] = timeValue.toString();
    }
    //Get the event description from the textarea, validate, and turn it into a string
    let eventDescriptionValue = formData.get('eventDescription');
    if (eventDescriptionValue === null || eventDescriptionValue.toString().trim() === '') {
        createMessage("Please enter a description for the event", "main-message", "error");
        return;
    } else {
        updatedEvent['eventDescription'] = eventDescriptionValue.toString();
    }
    //Get index of event object in array for local storage
    //This will probably change with proper data storage
    let eventObjIndex: number = eventsData.findIndex(item => item['eventId'] === paramEventId);
    eventsData[eventObjIndex] = updatedEvent;
    updateLocalStorage("events", eventsData);
    displayEventInfo(updatedEvent);
    closeModal("edit-event-backdrop");
    createMessage("The event was successfully updated", "main-message", "check_circle");
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
        deleteItem("events", "eventId", eventObject['eventId']);
    } else {
        createMessage(`The was an error deleting the event. Please go back to the events page and try again`, "main-message", "error");
        deleteEventCard.remove();
    }

}

//If the event doesn't exist, remove cards from page and add an error card
if (!eventObject) {
    createMessage("Could not find event", "main-message", "error");
    editEventModal.remove();
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
    displayEventInfo(eventObject);
    //Event listener for the delete button
    deleteEventButton.addEventListener('click', () => {
        //Need a way to see if deleteItem() in utils closes the modal, change boolean back to false
        deleteEvent();
    });
    //Event listener to reset the form to the event data
    let resetFormButton = document.getElementById('reset') as HTMLElement;
    resetFormButton.addEventListener('click', (e) => {
        e.preventDefault();
        resetInfo(eventObject);
    });
    //Event listener to close the edit event modal
    const cancelFormButton = document.getElementById('cancel') as HTMLElement;
    cancelFormButton.addEventListener('click', () => { closeModal("edit-event-backdrop"); })
    //Event listener to submit the data to update the event
    editEventModal.addEventListener('submit', (e) => {
        e.preventDefault();
        editEventInfo();
    });   
}