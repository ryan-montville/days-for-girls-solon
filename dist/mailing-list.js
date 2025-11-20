import { createMessage, clearMessages } from "./utils.js";
import { initializeApp } from "./app.js";
let mailingListForm = document.getElementById('mailing-list-form');
function submitData() {
    clearMessages();
    let mailingFormData = new FormData(mailingListForm);
    //Create contact entry object
    let newContactEntry = {
        contactId: 0,
        fullName: "",
        email: "",
        volunteerType: ""
    };
    //Validate full name input
    let fullNameValue = mailingFormData.get('fullName');
    if (fullNameValue === null || fullNameValue.toString().trim() === '') {
        createMessage("Please enter your name", "main-message", "error");
        return;
    }
    else {
        let firstLastCheck = fullNameValue.toString().split(" ");
        if (firstLastCheck.length < 2) {
            createMessage("Please enter your first and last name", "main-message", "error");
            return;
        }
        else {
            newContactEntry['fullName'] = fullNameValue.toString();
        }
    }
    //Validate email
    let emailValue = mailingFormData.get('email');
    if (emailValue === null || emailValue.toString().trim() === '') {
        createMessage("Please enter your email", "main-message", "error");
        return;
    }
    else {
        newContactEntry['email'] = emailValue.toString();
    }
    //Validate phone if entered
    let phoneValue = mailingFormData.get('phoneNumber');
    if (phoneValue !== null && phoneValue.toString().replace(/\D/g, '') !== '') {
        let parsedPhone = parseInt(phoneValue.toString().replace(/\D/g, ''));
        if (isNaN(parsedPhone)) {
            createMessage("Please enter a valid phone number", "main-message", "error");
            return;
        }
        else {
            let lengthCheck = String(Math.abs(parsedPhone)).length;
            if (lengthCheck < 10 || lengthCheck > 11) {
                createMessage("Please enter a valid phone number", "main-message", "error");
                return;
            }
            else {
                newContactEntry['phone'] = +phoneValue.toString().replace(/\D/g, '');
            }
        }
    }
    //Validate volunteer type
    let volunteerTypeValue = mailingFormData.get('volunteerType');
    if (volunteerTypeValue === null) {
        createMessage("Please select what kind of emails you would like to receive", "main-message", "error");
        return;
    }
    else {
        newContactEntry['volunteerType'] = volunteerTypeValue.toString();
    }
    //Not sure where to send this data yet. Still don't know if the app will use this form or the Google Form
    if (newContactEntry['phone']) {
        let alertMessage = `This form does not currently send this data anywhere\nName: ${newContactEntry['fullName']}\nEmail: ${newContactEntry['email']}\nPhone: ${newContactEntry.phone}\nType: ${newContactEntry['volunteerType']}`;
        alert(alertMessage);
    }
    else {
        let alertMessage = `This form does not currently send this data anywhere\nName: ${newContactEntry['fullName']}\nEmail: ${newContactEntry['email']}\nType: ${newContactEntry['volunteerType']}`;
        alert(alertMessage);
    }
}
initializeApp('Mailing List', 'Mailing List');
mailingListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});
