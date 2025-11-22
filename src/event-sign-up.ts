import { createMessage, storeMessage, clearMessages, fixDate } from "./utils.js";
import { addSignUpEntry, getEvent, getNextSignUpId } from "./controller.js";
import { initializeApp } from "./app.js";
import { SignUpEntry, Event } from "./models.js";


//Page Elements
const signUpForm = document.getElementById('sign-up-form') as HTMLFormElement;

//Get event id from url
const urlParams = new URLSearchParams(window.location.search);
const idString: string | null = urlParams.get('id');
const paramEventId: number = idString ? parseInt(idString) : 0;
const idIsInvalid: boolean = paramEventId === 0 || isNaN(paramEventId);

initializeApp('Upcoming Events', 'Event Sign Up');

//Get event matching eventId
const eventObject: Event | null = getEvent(paramEventId);
//If id is invalid
if (idIsInvalid || eventObject === null) {
    createMessage("Could not find event", "main-message", "error");
}

function setEventInfo(eventInfo: Event) {
    const signUpHeader = document.getElementById('sign-up-header') as HTMLElement;
    const signUpTitleH2 = document.createElement('h2')
    const signUpTitle = document.createTextNode(`Sign up for ${eventInfo['eventTitle']}`);
    signUpTitleH2.appendChild(signUpTitle);
    signUpHeader.appendChild(signUpTitleH2);
    const dateTimeH3 = document.createElement('h3');
    const dateTime = document.createTextNode(`${fixDate(eventInfo['eventDate'].toString(), 'longDate')} ${eventInfo['eventTime']}`);
    dateTimeH3.appendChild(dateTime);
    signUpHeader.appendChild(dateTimeH3)
    const eventLocationH3 = document.createElement('h3');
    const eventLocation = document.createTextNode(eventInfo['eventLocation']);
    eventLocationH3.appendChild(eventLocation);
    signUpHeader.appendChild(eventLocationH3);
}

function submitData() {
    //Get the form data
    const signUpFormData: FormData = new FormData(signUpForm);
    //Create an object for the entry
    let newSignUp: SignUpEntry = {
        entryId: 0,
        eventId: paramEventId,
        fullName: "",
        email: ""
    }
    //Get the next entryId. This shouldn't be needed when proper data storage is implemented
    newSignUp['entryId'] = getNextSignUpId();
    //Validate full name input
    const fullNameValue = signUpFormData.get('fullName');
    if (fullNameValue === null || fullNameValue.toString().trim() === '') {
        createMessage("Please enter your name", "main-message", "error");
        return;
    } else {
        let firstLastCheck = fullNameValue.toString().split(" ");
        if (firstLastCheck.length < 2) {
            createMessage("Please enter your first and last name", "main-message", "error");
            return;
        } else {
            newSignUp['fullName'] = fullNameValue.toString();
        }
    }
    //Validate email
    const emailValue = signUpFormData.get('email');
    if (emailValue === null || emailValue.toString().trim() === '') {
        createMessage("Please enter your email", "main-message", "error");
        return;
    } else {
        //Should I change the input to text so I can check and control the validation for proper email address?
        newSignUp['email'] = emailValue.toString();
    }
    //Get any comments entered
    const commentsValue = signUpFormData.get('comments');
    if (commentsValue) {
        newSignUp['comments'] = commentsValue.toString();
    }
    //Submit the sign up entry
    addSignUpEntry(newSignUp);
    //Store the message to be displayed on the events page
    if (eventObject) {
        storeMessage(`You have sucessfully signed up for the event '${eventObject['eventTitle']}'`, "main-message", "check_circle");
    }
    //Redirect to the events page
    window.location.href = 'events.html';
}

if (!eventObject) {
    createMessage("Could not find event", "main-message", "error");
    signUpForm.remove();
    const errorCard = document.createElement('section');
    errorCard.setAttribute('class', 'card');
    const errorH2 = document.createElement('h2');
    const errorTite = document.createTextNode("Could not find event");
    errorH2.appendChild(errorTite);
    errorCard.appendChild(errorH2);
    const errorP = document.createElement('p');
    const errorMessage = document.createTextNode('The event you were looking for does not exist or the url is incorrect. Please go back to the events page and try again.');
    errorP.appendChild(errorMessage);
    errorCard.appendChild(errorP);

    const main = document.querySelector('main');
    if (main) main.appendChild(errorCard);
} else {
    setEventInfo(eventObject);
}

signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});