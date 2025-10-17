const eventsLocalStorage = localStorage.getItem('events');
let eventsData = JSON.parse(eventsLocalStorage);
const SignUpEntriesLocalStorge = localStorage.getItem('SignUpEntries');
let SignUpEntriesData = JSON.parse(SignUpEntriesLocalStorge);

//Get event id from url
const queryString = window.location.search;
const urlParam = new URLSearchParams(queryString);
const paramEventID = urlParam.get('id');
//Get event matching eventID
const eventObject = eventsData.find(eventObject => parseInt(eventObject.eventID) === parseInt(paramEventID));

//page elements
let signUpHeader = document.getElementById('sign-up-header');
let signUpForm = document.getElementById('sign-up-form');
let fullNameInput = document.getElementById('full-name');
let emailInput = document.getElementById('email');
let commentsInput = document.getElementById('comments');
const clearButton = document.getElementById('clear');
const submitButton = document.getElementById('submit');

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

function updateLocalStorage(itemName, data, ) {
    let dataString = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}

function submitData() {
    let newSignUp = {
        "eventID": paramEventID,
        "fullName": fullNameInput.value,
        "email": emailInput.value,
        "comments": commentsInput.value
    }
    SignUpEntriesData.push(newSignUp);
    updateSignUpCount();
    updateLocalStorage("SignUpEntries", SignUpEntriesData);
    window.location.href = 'events.html';
}

function updateSignUpCount() {
    let eventIndex = eventsData.findIndex(item => {
        return parseInt(item.eventID) === parseInt(paramEventID);
    });
    console.log(`count before: ${eventsData[eventIndex].numberAttending}`);
    eventsData[eventIndex].numberAttending = parseInt(eventObject.numberAttending) + 1;
    console.log(`count after: ${eventsData[eventIndex].numberAttending}`);
    console.log(JSON.stringify(eventsData));
    updateLocalStorage("events", eventsData);
}

//event listener for the submit button
submitButton.addEventListener('click', function(event) {
    event.preventDefault();
    submitData();
})

//event listener for the clear button
clearButton.addEventListener('click', function(event) {
    event.preventDefault();
    signUpForm.reset();

});

setEventInfo();