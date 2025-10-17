const eventLocalStorage = localStorage.getItem('events');
const eventData = JSON.parse(eventLocalStorage);
let signUpHeader = document.getElementById('sign-up-header');
//Get event id from url
const queryString = window.location.search;
const urlParam = new URLSearchParams(queryString);
const paramEventID = urlParam.get('id');
//Get event matching eventID
const eventObject = eventData.find(eventObject => parseInt(eventObject.eventID) === parseInt(paramEventID));

function setEventInfo() {
    let signUpTitleH2 = document.createElement('h2')
    let signUpTitle = document.createTextNode(`Sign up for ${eventObject.eventTitle}`);
    signUpTitleH2.appendChild(signUpTitle);
    signUpHeader.appendChild(signUpTitleH2);
    let dateTimeH3 = document.createElement('h3');
    let dateTime = document.createTextNode(`${eventObject.eventDate} ${eventObject.eventTime}`);
    dateTimeH3.appendChild(dateTime);
    signUpHeader.appendChild(dateTimeH3)
    let eventLocationH3 = document.createElement('h3');
    let eventLocation = document.createTextNode(eventObject.eventLocation);
    eventLocationH3.appendChild(eventLocation);
    signUpHeader.appendChild(eventLocationH3);
}

setEventInfo();