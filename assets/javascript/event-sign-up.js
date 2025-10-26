import { createErrorMessage, fixDate, updateLocalStorage } from './coreFunctions.js'

const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries');
let SignUpEntriesData = JSON.parse(SignUpEntriesLocalStorge);

//Get event id from url
const queryString = window.location.search;
const urlParam = new URLSearchParams(queryString);
const parameventId = urlParam.get('id');
//Get event matching eventId
const eventObject = eventsData.find(eventObject => parseInt(eventObject.eventId) === parseInt(parameventId));

//page elements
let signUpHeader = document.getElementById('sign-up-header');
let eventSignUpForm = document.getElementById('sign-up-form');
const errorMessageMain = document.getElementById('mainError');

function setEventInfo() {
    let signUpTitleH2 = document.createElement('h2')
    let signUpTitle = document.createTextNode(`Sign up for ${eventObject.eventTitle}`);
    signUpTitleH2.appendChild(signUpTitle);
    signUpHeader.appendChild(signUpTitleH2);
    let dateTimeH3 = document.createElement('h3');
    let dateTime = document.createTextNode(`${fixDate(eventObject.eventDate, false)} ${eventObject.eventTime}`);
    dateTimeH3.appendChild(dateTime);
    signUpHeader.appendChild(dateTimeH3)
    let eventLocationH3 = document.createElement('h3');
    let eventLocation = document.createTextNode(eventObject.eventLocation);
    eventLocationH3.appendChild(eventLocation);
    signUpHeader.appendChild(eventLocationH3);
}

function updateSignUpCount() {
    let eventIndex = eventsData.findIndex(item => {
        return parseInt(item.eventId) === parseInt(parameventId);
    });
    eventsData[eventIndex].numberAttending = parseInt(eventObject.numberAttending) + 1;
    updateLocalStorage("events", eventsData);
}

//Event Sign up Form Submit event listener
eventSignUpForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let eventSignUpData = new FormData(eventSignUpForm);
    let newSignUp = {
        "eventId": parameventId,
        "fullName": eventSignUpData.get('fullName'),
        "email": eventSignUpData.get('email'),
        "comments": eventSignUpData.get('comments')
    }
    SignUpEntriesData.push(newSignUp);
    updateSignUpCount();
    updateLocalStorage("SignUpEntries", SignUpEntriesData);
    window.location.href='events.html';
});

setEventInfo();