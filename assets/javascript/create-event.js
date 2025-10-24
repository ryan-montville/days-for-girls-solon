const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);

//page elements
const createForm = document.getElementById('create-event');
const errorMessageMain = document.getElementById('mainError');

function updateLocalStorage(itemName, data, ) {
    let dataString = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}

function createErrorMessage(message, location) {
        let errorMessageP = document.createElement('p');
        errorMessageP.setAttribute('role', 'alert');
        let errorIcon = document.createElement('i');
        errorIcon.setAttribute('class', 'material-symbols-outlined')
        let iconName = document.createTextNode('error');
        errorIcon.appendChild(iconName);
        let errorMessage = document.createTextNode(message);
        errorMessageP.appendChild(errorMessage);
        if (location === 'sign-in') {
            signInError.appendChild(errorMessageP);
        } else {
            mainError.appendChild(errorMessageP);
        }
    }

//Create form submit event listener
createForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let createEventData = new FormData(createForm);
    let lastID = eventsData.reduce((previous, current) => {
        return (parseInt(previous.eventID) > parseInt(current.eventID)) ? prev : current;
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