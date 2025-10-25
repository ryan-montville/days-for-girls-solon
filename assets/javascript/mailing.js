import { createErrorMessage } from './coreFunctions.js'

//page elements
const errorMessageMain = document.getElementById('mainError');
const mailingListForm = document.getElementById('mailing-list');
const nameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone-number');
const checkboxes = document.querySelectorAll('input[name="volunteer-type"]')
const clearButton = document.getElementById('clear');
const submitButton = document.getElementById('submit');

function submitData() {
    const mailingFormData = new FormData(mailingListForm);
    let newSignUp = {
        "fullName": mailingFormData.get('fullName'),
        "email": mailingFormData.get('email'),
        "phone": mailingFormData.get('phoneNumber'),
        "volunteerType": mailingFormData.get('volunteerType')
    }
    alert(`The following info would be emailed/stored\nName: ${mailingFormData.get('fullName')}\nemail: ${mailingFormData.get('email')}\nphone: ${mailingFormData.get('phoneNumber')}\nvolunteer: ${mailingFormData.get('volunteerType')}`)
    console.log(newSignUp);
    mailingListForm.reset();
    window.location.href='index.html';
}

mailingListForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitData();
});