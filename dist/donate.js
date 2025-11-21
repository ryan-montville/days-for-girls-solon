import { initializeApp, isUserSignedIn } from "./app.js";
import { createButton } from "./utils.js";
initializeApp('Donate', 'Donante');
const outputCard = document.getElementById('output');
const mainContent = document.getElementById('maincontent');
const outputButtonRow = document.getElementById('outputButtonRow');
if (isUserSignedIn()) {
    const editButton = createButton('Edit', 'button', 'editButton', 'secondary', 'edit');
    editButton.addEventListener('click', () => {
        outputCard.style.display = 'none';
        const editForm = createEditForm();
        mainContent.appendChild(editForm);
    });
    outputButtonRow.appendChild(editButton);
}
function createEditForm() {
    const editform = document.createElement('form');
    editform.setAttribute('id', 'editForm');
    editform.setAttribute('class', 'card');
    const textArea = document.createElement('textarea');
    //Put page content in text area
    editform.appendChild(textArea);
    const buttonRow = document.createElement('section');
    buttonRow.setAttribute('class', 'form-row');
    const cancelButton = createButton('Cancel', 'button', 'cancelButton', 'secondary');
    cancelButton.addEventListener('click', () => {
        editform.remove();
        outputCard.style.display = 'block';
    });
    buttonRow.appendChild(cancelButton);
    const submitButton = createButton('Submit', 'submit', 'submitButton', 'primary');
    //Add event listner here?
    buttonRow.appendChild(submitButton);
    editform.appendChild(buttonRow);
    return editform;
}
