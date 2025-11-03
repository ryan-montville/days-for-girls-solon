import { createMessage, closeModal, trapFocus, updateLocalStorage } from "./utils.js";
async function loadData() {
    //This will change when proper data storage is implemented
    console.log("Fetching data from JSON and putting in local storage");
    try {
        //Fetch inventory data from inventory.json
        let response = await fetch('src/inventory.json');
        if (!response.ok) {
            createMessage(`Error loading the data. Status: ${response.status}`, 'main-message', 'error');
        }
        let data = await response.json();
        console.log(`Fetched inventory data`);
        //Adding current inventory data to local storage
        updateLocalStorage("currentInventory", data['currentInventory']);
        //Adding incoming inventory data to local storage
        updateLocalStorage("donatedInventory", data['donatedInventory']);
        //Adding outgoing inventory data to local storage
        updateLocalStorage("distributedInventory", data['distributedInventory']);
        //fetch events data from events.json
        response = await fetch('src/events.json');
        if (!response.ok) {
            createMessage(`Error loading the data. Status: ${response.status}`, 'main-message', 'error');
        }
        data = await response.json();
        console.log(`Fetched events data`);
        //Adding events and sign up data to local storage
        updateLocalStorage("events", data['upcomingEvents']);
        updateLocalStorage("SignUpEntries", data['SignUpEntries']);
    }
    catch (error) {
        createMessage(error, 'main-message', 'error');
    }
}
function checkForLocalStorageData() {
    //Not sure how this will work once proper data storage is implemented
    const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
    if (!currentInventoryLocalStorage) {
        loadData();
    }
}
const inventoryLink = document.getElementById('inventory-link');
const openSignInModal = document.getElementById('open-sign-in-modal-button');
const navSignOutButton = document.getElementById('sign-out-button');
const signInModalBackdrop = document.getElementById('sign-in-backdrop');
const signInModal = document.getElementById('sign-in-modal');
const closeModalButton = document.getElementById('close-modal-button');
let isUserSignedIn = false;
//event listener for sign in button to open sign in modal
openSignInModal.addEventListener('click', (e) => {
    e.preventDefault();
    signInModalBackdrop.style.display = 'flex';
    signInModal.classList.add('opening');
    signInModal.setAttribute('aria-modal', 'true');
    const usernameInput = document.getElementById('username');
    if (usernameInput)
        usernameInput.focus();
    trapFocus(signInModal, signInModalBackdrop);
});
//event listener for the sign in modal close button
closeModalButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal("sign-in-backdrop");
});
//event listener for the user to press escape to close any modal that is open
document.addEventListener('keydown', (e) => {
    let deleteItemModalBackdrop = document.getElementById('delete-item-backdrop');
    let signInModalBackdrop = document.getElementById('sign-in-backdrop');
    let editEventModalBackdrop = document.getElementById('edit-event-backdrop');
    if (e.key === 'Escape') {
        e.preventDefault();
        if (deleteItemModalBackdrop && deleteItemModalBackdrop.style.display === 'flex') {
            closeModal("delete-item-backdrop");
        }
        else if (signInModalBackdrop && signInModalBackdrop.style.display === 'flex') {
            closeModal("sign-in-backdrop");
        }
        else if (editEventModalBackdrop && editEventModalBackdrop.style.display === 'flex') {
            closeModal("edit-event-backdrop");
        }
        else {
            console.log("No modals are open");
        }
    }
});
//event listener to sign in
signInModal.addEventListener('submit', (event) => {
    event.preventDefault();
    const signInFormData = new FormData(signInModal);
    const username = signInFormData.get('username');
    const password = signInFormData.get('password');
    if (username === null || username?.toString().trim() === '') {
        createMessage("Username must not be empty", "sign-in-message", "error");
        return;
    }
    if (password === null || password.toString().trim() === '') {
        createMessage("PAssword must not be empty", "sign-in-message", "error");
    }
    localStorage.setItem('username', username?.toString());
    signInModalBackdrop.style.display = 'none';
    createMessage("Sign In Successful", "main-message", "check_circle");
    signIn();
});
//event listener to sign out
navSignOutButton.addEventListener('click', () => {
    signOut();
    window.location.reload();
});
function signIn() {
    inventoryLink.style.display = 'block';
    openSignInModal.style.display = 'none';
    navSignOutButton.style.display = 'block';
    console.log('Found username in local storage. Sign in successful');
}
function signOut() {
    console.log("Removing username from local storage");
    localStorage.removeItem("username");
    inventoryLink.style.display = 'none';
    navSignOutButton.style.display = 'none';
    openSignInModal.style.display = 'block';
}
//check if signed in
function checkIfSignedIn() {
    let username = localStorage.getItem("username");
    if (username) {
        signIn();
        isUserSignedIn = true;
    }
}
checkForLocalStorageData();
checkIfSignedIn();
