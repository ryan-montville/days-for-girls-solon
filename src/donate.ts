import { initializeApp, isUserSignedIn } from "./app.js";
import { createButton, createMessage, clearMessages } from "./utils.js";
import { getDonatePageContent, submitDonatePageContent } from "./controller.js";
import { marked } from 'marked';

initializeApp('Donate', 'Donante');

const outputCard = document.getElementById('output') as HTMLElement;
const markdownCheetSheetCard = document.getElementById('markdown-cheat-sheet') as HTMLElement;
const mainContent = document.getElementById('maincontent') as HTMLElement;
const outputButtonRow = document.getElementById('outputButtonRow') as HTMLElement;

async function loadDonateContent() {
    const pageContentSection = document.getElementById('pageContentSection') as HTMLElement;
    pageContentSection.innerHTML = '';
    let contentString = getDonatePageContent();
    if (!contentString) {
        contentString = "## No content Found";
    }
    //Use Marked.js to convert the markdown to HTML
    const contentHTML = await marked.parse(contentString);
    pageContentSection.innerHTML = contentHTML;
}

markdownCheetSheetCard.style.display = 'none';
loadDonateContent();

if (isUserSignedIn()) {
    const editButton = createButton('Edit', 'button', 'editButton', 'secondary', 'edit');
    editButton.addEventListener('click', () => {
        outputCard.style.display = 'none';
        markdownCheetSheetCard.style.display = 'block';
        const editForm = createEditForm();
        mainContent.appendChild(editForm);
    });
    outputButtonRow.appendChild(editButton);
}

function submitData() {
    clearMessages();
    const editForm = document.getElementById('editForm') as HTMLFormElement;
    if (editForm) {
        const editFormData = new FormData(editForm)
        const pageContent = editFormData.get('donateContentTextArea');
        //Validate pageContent
        if (pageContent === null || pageContent.toString().trim() === '') {
            createMessage("Please enter the content for the donate page", 'main-message', 'error');
        } else {
            submitDonatePageContent(pageContent.toString());
            editForm.remove();
            loadDonateContent();
            markdownCheetSheetCard.style.display = 'none';
            outputCard.style.display = 'block';
            createMessage("Content Sucessfully updated", 'main-message', 'check_circle');
        }
    } else {
        console.error("Form not found");
    }
}

function createEditForm() {
    const editform = document.createElement('form');
    editform.setAttribute('id', 'editForm');
    editform.setAttribute('class', 'card');
    const textArea = document.createElement('textarea');
    textArea.setAttribute('id', 'donateContentTextArea');
    textArea.setAttribute('name', 'donateContentTextArea');
    textArea.value = getDonatePageContent();
    editform.appendChild(textArea);
    const buttonRow = document.createElement('section');
    buttonRow.setAttribute('class', 'form-row');
    const cancelButton = createButton('Cancel', 'button', 'cancelButton', 'secondary');
    cancelButton.addEventListener('click', () => {
        editform.remove();
        markdownCheetSheetCard.style.display = 'none';
        outputCard.style.display = 'block';
    });
    buttonRow.appendChild(cancelButton);
    const submitButton = createButton('Submit', 'submit', 'submitButton', 'primary');
    editform.addEventListener('submit', (e) => {
        e.preventDefault();
        submitData();
    })
    buttonRow.appendChild(submitButton);
    editform.appendChild(buttonRow);
    return editform;
}

//Event listener to close the markdown cheat sheet card
const cheatSheetCloseButton = document.getElementById('cheat-sheet-close') as HTMLElement;
cheatSheetCloseButton.addEventListener('click', () => {
    markdownCheetSheetCard.style.display = 'none';
});