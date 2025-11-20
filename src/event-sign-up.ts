import { createMessage, clearMessages, fixDate } from "./utils.js";
import { addSignUpEntry, getEvent, getNextSignUpId } from "./controller.js";
import { initializeApp } from "./app.js";
import { SignUpEntry, Event } from "./models.js";


//Page Elements
const signUpForm = document.getElementById('sign-up-form') as HTMLFormElement;

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
const eventObject: Event | null = getEvent(paramEventId);

function setEventInfo(eventInfo: Event) {
    let signUpHeader = document.getElementById('sign-up-header') as HTMLElement;
    let signUpTitleH2 = document.createElement('h2')
    let signUpTitle = document.createTextNode(`Sign up for ${eventInfo['eventTitle']}`);
    signUpTitleH2.appendChild(signUpTitle);
    signUpHeader.appendChild(signUpTitleH2);
    let dateTimeH3 = document.createElement('h3');
    let dateTime = document.createTextNode(`${fixDate(eventInfo['eventDate'].toString(), 'longDate')} ${eventInfo['eventTime']}`);
    dateTimeH3.appendChild(dateTime);
    signUpHeader.appendChild(dateTimeH3)
    let eventLocationH3 = document.createElement('h3');
    let eventLocation = document.createTextNode(eventInfo['eventLocation']);
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
    let fullNameValue = signUpFormData.get('fullName');
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
    let emailValue = signUpFormData.get('email');
    if (emailValue === null || emailValue.toString().trim() === '') {
        createMessage("Please enter your email", "main-message", "error");
        return;
    } else {
        //Should I change the input to text so I can check and control the validation for proper email address?
        newSignUp['email'] = emailValue.toString();
    }
    //Get any comments entered
    let commentsValue = signUpFormData.get('comments');
    if (commentsValue) {
        newSignUp['comments'] = commentsValue.toString();
    }
    //Submit the sign up entry
    addSignUpEntry(newSignUp);
    //window.location.href = 'events.html';
    //Find a way to pass this message to the events page after the redirect
    createMessage("You have sucessfully signed up for the event", "main-message", "check_circle");
}

if (!eventObject) {
    createMessage("Could not find event", "main-message", "error");
    signUpForm.remove();
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
    setEventInfo(eventObject);
}

initializeApp('Upcoming Events', 'Event Sign Up');

signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});