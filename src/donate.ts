import { initializeApp } from "./app.js";
import { createButton, createMessage, fixDate } from "./utils.js";
import { auth } from "./firebase.js";
import { addDonatePageContent, updateDonatePageContent, getDonatePageContent } from "./firebaseService.js";
import { DonatePageContent } from "./models.js";
import { marked } from 'marked';
import { getUserRole } from "./authService.js";

const outputCard = document.getElementById('output') as HTMLElement;
const markdownCheetSheetCard = document.getElementById('markdown-cheat-sheet') as HTMLElement;
const mainContent = document.getElementById('maincontent') as HTMLElement;
const outputButtonRow = document.getElementById('outputButtonRow') as HTMLElement;
let hasDonateContent: boolean;
let pageContentString: string = "";

async function loadDonateContent() {
    const pageContentSection = document.getElementById('pageContentSection') as HTMLElement;
    pageContentSection.innerHTML = '';
    let pageContentObject: DonatePageContent | null = null;
    try {
        pageContentObject = await getDonatePageContent();
    } catch (error: any) {
        createMessage(error, 'main-message', 'error');
    }
    let lastUpdated: string = "";
    if (!pageContentObject) {
        pageContentString = "## No content Found";
        hasDonateContent = false;
    } else {
        hasDonateContent = true;
        pageContentString = pageContentObject['content'];
        lastUpdated = fixDate(pageContentObject['lastUpdated'], 'longDate');
    }
    //Use Marked.js to convert the markdown to HTML
    const contentHTML = await marked.parse(pageContentString);
    pageContentSection.innerHTML = contentHTML;
    const lastUpdatedP = document.createElement('p');
    const lastUpdatedText = document.createTextNode(`Last updated: ${lastUpdated}`);
    lastUpdatedP.appendChild(lastUpdatedText);
    const loadingCard = document.getElementById('loading');
    if (loadingCard) loadingCard.remove();
    outputCard.classList.remove('hide');
    pageContentSection.appendChild(lastUpdatedP);
}

async function submitData() {
    //Close the cheat sheet card
    markdownCheetSheetCard.classList.add('hide');
    //Create a submitting data message while the app validates and submits the data
    createMessage("Submitting data to update page content...", 'main-message', 'info');
    const editForm = document.getElementById('editForm') as HTMLFormElement;
    if (editForm) {
        const editFormData = new FormData(editForm)
        const pageContent = editFormData.get('donateContentTextArea');
        //Validate pageContent
        if (pageContent === null || pageContent.toString().trim() === '') {
            createMessage("Please enter the content for the donate page", 'main-message', 'error');
        } else {
            try {
                if (hasDonateContent) {
                    await updateDonatePageContent(pageContent.toString());
                } else {
                    await addDonatePageContent(pageContent.toString());
                }
                editForm.remove();
                loadDonateContent();
                outputCard.classList.remove('hide');
                createMessage("Content Sucessfully updated", 'main-message', 'check_circle');
            } catch (error: any) {
                outputCard.classList.remove('hide');
                createMessage(error, 'main-message', 'error');
            }
        }
    } else {
        console.error("Form not found");
    }
}

async function createEditForm(contentString: string) {
    const editform = document.createElement('form');
    editform.setAttribute('id', 'editForm');
    editform.setAttribute('class', 'card');
    const textArea = document.createElement('textarea');
    textArea.setAttribute('id', 'donateContentTextArea');
    textArea.setAttribute('name', 'donateContentTextArea');
    textArea.value = contentString
    editform.appendChild(textArea);
    const buttonRow = document.createElement('section');
    buttonRow.setAttribute('class', 'form-row');
    const cancelButton = createButton('Cancel', 'button', 'cancelButton', 'secondary');
    cancelButton.addEventListener('click', () => {
        editform.remove();
        markdownCheetSheetCard.classList.add('hide');
        outputCard.classList.remove('hide');
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

initializeApp('Donate', 'Donate').then(response => {
    loadDonateContent();
    auth.onAuthStateChanged(async user => {
        //Only admins can edit the contents of the donate page
        if (user) {
            let userRole = await getUserRole(user.uid);
            if (userRole === "admin") {
                const editButton = createButton('Edit', 'button', 'editButton', 'secondary', 'edit');
                editButton.addEventListener('click', async () => {
                    outputCard.classList.add('hide');
                    markdownCheetSheetCard.classList.remove('hide');
                    const editForm = createEditForm(pageContentString);
                    mainContent.appendChild(await editForm);
                });
                outputButtonRow.appendChild(editButton);
                //Event listener to close the markdown cheat sheet card
                const cheatSheetCloseButton = document.getElementById('cheat-sheet-close') as HTMLElement;
                cheatSheetCloseButton.addEventListener('click', () => {
                    markdownCheetSheetCard.classList.add('hide');
                });
            }

        } else {
            const editButton = document.getElementById('editButton');
            if (editButton) editButton.remove();
        }
    });
});

