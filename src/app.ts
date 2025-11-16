import { createMessage, closeModal, trapFocus, updateLocalStorage } from "./utils.js";

const inventoryLink = document.getElementById('inventory-link') as HTMLElement;
const openSignInModal = document.getElementById('open-sign-in-modal-button') as HTMLElement;
const navSignOutButton = document.getElementById('sign-out-button') as HTMLElement;
let mobileNavToggle = document.getElementById('mobile-nav-toggle') as HTMLElement;
const nav = document.querySelector('nav') as HTMLElement;
const signInModalBackdrop = document.getElementById('sign-in-backdrop') as HTMLElement;
const signInModal = document.getElementById('sign-in-modal') as HTMLFormElement;
const closeModalButton = document.getElementById('close-modal-button') as HTMLElement;
let isUserSignedIn: boolean = false;

function loadData() {
    //Get inventory data from json file and put into local storage
    fetch('src/inventory.json')
        .then(data => data.json())
        .then(jsonData => {
            //Adding current inventory data to local storage
            updateLocalStorage("currentInventory", jsonData['currentInventory']);
            //Adding incoming inventory data to local storage
            updateLocalStorage("donatedInventory", jsonData['donatedInventory']);
            //Adding outgoing inventory data to local storage
            updateLocalStorage("distributedInventory", jsonData['distributedInventory'])
        })
        .catch((error) => {
            createMessage("Error loading inventory data. Please try reloading the page", 'main-message', 'error');
            console.error(`Error loading inventory data: ${error}`);
        });
    //Get events data from json file and put into local storage
    fetch('src/events.json')
        .then(data => data.json())
        .then(jsonData => {
            //Adding events data to local storage
            updateLocalStorage("events", jsonData['upcomingEvents']);
            //Adding event sign ups to local storage
            updateLocalStorage("SignUpEntries", jsonData['SignUpEntries'])
        })
        .catch((error) => {
            createMessage("Error loading events data. Please try reloading the page", 'main-message', 'error');
            console.error(`Error loading events data: ${error}`);
        })
}

function checkForLocalStorageData() {
    //Not sure how this will work once proper data storage is implemented
    const currentInventoryLocalStorage: string | null = localStorage.getItem("currentInventory");
    if (!currentInventoryLocalStorage) {
        loadData();
    }
}

//event listener for sign in button to open sign in modal
openSignInModal.addEventListener('click', (e) => {
    e.preventDefault();
    if (nav.classList.contains('open')) {
        mobileNavToggle.innerText = 'close';
        nav.classList.remove('open');
    }
    signInModalBackdrop.style.display = 'flex';
    signInModal.classList.add('opening');
    signInModal.setAttribute('aria-modal', 'true');
    const usernameInput: HTMLElement | null = document.getElementById('username');
    if (usernameInput) usernameInput.focus();
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
    let addInventoryModalBackdrop = document.getElementById('add-inventory-backdrop');
    let distributeInventoryBackdrop = document.getElementById('distribute-inventory-backdrop');
    if (e.key === 'Escape') {
        e.preventDefault();
        if (deleteItemModalBackdrop && deleteItemModalBackdrop.style.display === 'flex') {
            closeModal("delete-item-backdrop");
        } else if (signInModalBackdrop && signInModalBackdrop.style.display === 'flex') {
            closeModal("sign-in-backdrop");
        } else if (editEventModalBackdrop && editEventModalBackdrop.style.display === 'flex') {
            closeModal("edit-event-backdrop");
        } else if (addInventoryModalBackdrop && addInventoryModalBackdrop.style.display === 'flex') {
            closeModal('add-inventory-backdrop');
        } else if (distributeInventoryBackdrop && distributeInventoryBackdrop.style.display === 'flex') {
            closeModal('distribute-inventory-backdrop');
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
    const password = signInFormData.get('password')
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
    window.location.reload();
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

//Mobile Nav toggle
mobileNavToggle.addEventListener('click', () => {
    console.log("toggling nav menu")
    //Toggle to class 'open' on nav's classList
    nav.classList.toggle('open');
    //Check if 'open' is in nav's classList
    const isOpen = nav.classList.contains('open');
    //Display proper icon in nav toggle button
    if (isOpen) {
        mobileNavToggle.innerText = 'close';
    } else {
        mobileNavToggle.innerText = 'menu';
    }
});

checkForLocalStorageData();
checkIfSignedIn();