import { createErrorMessage, trapFocus, updateLocalStorage } from './coreFunctions.js'

function app() {
    "use strict";
    let currentInventoryLocalStorage = localStorage.getItem("currentInventory");
    let username = localStorage.getItem('username');
    let isUserSignedIn = false;
    let isSignInModalOpen = false;

    //page elements
    const inventoryLink = document.getElementById('inventory-link');
    const openSignInModal = document.getElementById('open-sign-in-modal-button');
    const navSignOutButton = document.getElementById('sign-out-button');
    const signInModalBackdrop = document.getElementById('backdrop');
    const signInModal = document.getElementById('sign-in-modal');
    const signInLabel = document.getElementById('dialog-label');
    const closeModalButton = document.getElementById('close-modal-button');
    const signInError = document.getElementById('sign-in-error');
    const mainError = document.getElementById('main-error');

    //event listener for sign in button to open sign in modal
    openSignInModal.addEventListener('click', (e) => {
        e.preventDefault();
        signInModalBackdrop.style.display = 'flex';
        signInModal.setAttribute('aria-modal', 'true');
        const usernameInput = document.getElementById('username');
        usernameInput.focus();
        isSignInModalOpen = true;
        trapFocus(signInModal, signInModalBackdrop);
        
    });

    //event listener for the sign in modal close button
    closeModalButton.addEventListener('click', (e) => {
        e.preventDefault();
        signInModal.reset();
        signInModalBackdrop.style.display = 'none';
        signInModal.setAttribute('aria-modal', 'false');
        isSignInModalOpen = false;
    });

    //event listener for the user to press escape to close the sign in modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSignInModalOpen === true) {
            e.preventDefault();
            signInModal.reset();
            isSignInModalOpen = false;
            signInModalBackdrop.style.display = 'none';
            signInModal.setAttribute('aria-modal', 'false');
        }
    });

    //event listener to sign in
    signInModal.addEventListener('submit', (event) => {
        event.preventDefault();
        const modalFormData = new FormData(signInModal);
        const username = modalFormData.get('username');
        const password = modalFormData.get('password');
        console.log(`It's not being used yet, but the passworded entered is ${password}`);
        localStorage.setItem('username', username);
        backdrop.style.display = 'none';
        signIn();
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
        if (username) {
            signIn();
            isUserSignedIn = true;
        }
    }

    

    //event listener to sign out
    navSignOutButton.addEventListener('click', () => {
        signOut();
        window.location.reload();
    });

    async function loadJsonData() {
        try {
            //Fetch inventory data from inventory.json
            let response = await fetch('assets/inventory.json');
            if (!response.ok) {
                createErrorMessage(`Error loading the data. Status: ${response.status}`, 'main');
                throw new Error(`Error loading data. Status: ${response.status}`);
            }
            let data = await response.json();
            console.log(`Fetched inventory data`);
            //Adding current inventory data to local storage
            updateLocalStorage("currentInventory", data.currentInventory);
            //Adding incoming inventory data to local storage
            updateLocalStorage("incomingInventory", data.incomingInventory);
            //Adding outgoing inventory data to local storage
            updateLocalStorage("outgoingInventory", data.outgoingInventory)
            //fetch events data from events.json
            response = await fetch('assets/events.json');
            if (!response.ok) {
                createErrorMessage(`Error loading the data. Status: ${response.status}`, 'main');
                throw new Error(`Error loading data. Status: ${response.status}`);
            }
            data = await response.json();
            console.log(`Fetched events data`);
            //Adding events and sign up data to local storage
            updateLocalStorage("events", data.upcomingEvents);
            updateLocalStorage("SignUpEntries", data.SignUpEntries)

        } catch (error) {
            createErrorMessage(error, 'main');
            console.error("Failed to load data: ", error);
        }
    }
    //check to see if current inventory is in local storage
    if (!currentInventoryLocalStorage) {
        loadJsonData();
    }

    checkIfSignedIn();
}

app();