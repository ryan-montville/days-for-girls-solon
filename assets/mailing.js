//page elements
const errorMessageMain = document.getElementById('mainError');
const mailingListForm = document.getElementById('mailing-list');
const nameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone-number');
const checkboxes = document.querySelectorAll('input[name="volunteer-type"]')
const clearButton = document.getElementById('clear');
const submitButton = document.getElementById('submit');

function createErrorMessage(error, location) {
    if (location === "main") {
        let p = document.createElement('p');
        let errorIcon = document.createElement('i');
        errorIcon.setAttribute('class', 'material-symbols-outlined')
        let iconName = document.createTextNode('error');
        errorIcon.appendChild(iconName);
        p.appendChild(errorIcon);
        p.setAttribute('id', 'errorMessageMainP')
        let errorMessageText = document.createTextNode(error);
        p.appendChild(errorMessageText);
        errorMessageMain.appendChild(p);
    }

}

function submitData() {
    const volunteerTypes = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            volunteerTypes.push(checkbox.value);
        }
    });
    let newSignUp = {
        "fullName": nameInput.value,
        "email": emailInput.value,
        "phone": phoneInput.value,
        "volunteerTypes": volunteerTypes
    }
    alert(`The following info would be emailed/stored\nName: ${nameInput.value}\nemail: ${emailInput.value}\nphone: ${phoneInput.value}\nvolunteer: ${volunteerTypes}`)
    console.log(newSignUp);
    mailingListForm.reset();
    window.location.href='index.html';
}

clearButton.addEventListener('click', function(event) {
    event.preventDefault();
    mailingListForm.reset();
});

submitButton.addEventListener('click', function(event) {
    event.preventDefault();
    submitData();
});