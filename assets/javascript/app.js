import { createErrorMessage, updateLocalStorage } from './coreFunctions.js'

function app() {
    "use strict";
    let currentInventoryLocalStorage = localStorage.getItem("currentInventory");
    let username = localStorage.getItem('username');
    let isUserSignedIn = false;
    let isPopUpOpen = false;

    //page elements
    const inventoryLink = document.getElementById('inventory-link');
    const navSignInButton = document.getElementById('sign-in-button');
    const navSignOutButton = document.getElementById('sign-out-button');
    const signInPopUp = document.getElementById('pop-up-container');
    const signInForm = document.getElementById('sign-in-pop-up');
    const closeButton = document.getElementById('close');
    const signInError = document.getElementById('sign-in-error');
    const mainError = document.getElementById('main-error');

    //event listener for sign in button to open sign in pop up
    navSignInButton.addEventListener('click', () => {
        signInPopUp.style.display = 'flex';
        isPopUpOpen = true;
        //event listen to close pop up if user clicks outside of pop up
        signInPopUp.addEventListener('click', () => {
            isPopUpOpen = false;
            signInPopUp.style.display = 'none';
        });
    });

    //event listener for the pop up close button
    closeButton.addEventListener('click', () => {
        signInPopUp.style.display = 'none';
        isPopUpOpen = false;
    });

    //event listener for the user to press escape to close the sign in pop up
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isPopUpOpen === true) {
            console.log("Esc pressed and sign in open")
            isPopUpOpen = false;
            signInPopUp.style.display = 'none';
        } else {
            console.log("Esc pressed but sign in not open?")
        }
    })

    function signIn() {
        inventoryLink.style.display = 'block';
        navSignInButton.style.display = 'none';
        navSignOutButton.style.display = 'block';
        console.log('Found username in local storage. Sign in successful');
    }

    function signOut() {
        console.log("Removing username from local storage");
        localStorage.removeItem("username");
        inventoryLink.style.display = 'none';
        navSignOutButton.style.display = 'none';
        navSignInButton.style.display = 'block';
    }

    //check if signed in
    function checkIfSignedIn() {
        if (username) {
            signIn();
            isUserSignedIn = true;
        }
    }

    //event listener to sign in
    signInForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const signInData = new FormData(signInForm);
        const username = signInData.get('username');
        const password = signInData.get('password');
        console.log(`It's not being used yet, but the passworded entered is ${password}`);
        localStorage.setItem('username', username);
        signInPopUp.style.display = 'none';
        signIn();
    });

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