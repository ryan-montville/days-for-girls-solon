function app() {
    "use strict";
    let currentInventoryLocalStorage = localStorage.getItem("currentInventory");
    let username = localStorage.getItem('username');
    let isUserSignedIn = false;

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
    });

    //event listener for the pop up close button
    closeButton.addEventListener('click', () => {
        signInPopUp.style.display = 'none';
    });

    function signIn() {
        console.log('');
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

    function createErrorMessage(message, location) {
        let errorMessageP = document.createElement('p');
        let errorMessage = document.createTextNode(message);
        errorMessageP.appendChild(errorMessage);
        if (location === 'sign-in') {
            signInError.appendChild(errorMessageP);
        } else {
            mainError.appendChild(errorMessageP);
        }
    }

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
            let currentInventoryString = JSON.stringify(data.currentInventory);
            localStorage.setItem("currentInventory", currentInventoryString);
            //Adding incoming inventory data to local storage
            let incomingInventoryString = JSON.stringify(data.incomingInventory);
            localStorage.setItem("incomingInventory", incomingInventoryString);
            //Adding outgoing inventory data to local storage
            let outgoingInventoryString = JSON.stringify(data.outgoingInventory);
            localStorage.setItem("outgoingInventory", outgoingInventoryString);
            //fetch events data from events.json
            response = await fetch('assets/events.json');
            if (!response.ok) {
                createErrorMessage(`Error loading the data. Status: ${response.status}`, 'main');
                throw new Error(`Error loading data. Status: ${response.status}`);
            }
            data = await response.json();
            console.log(`Fetched events data`);
            //Adding events data to local storage
            let eventsString = JSON.stringify(data.upcomingEvents);
            localStorage.setItem("events", eventsString);
            let signUpEntriesString = JSON.stringify(data.SignUpEntries);
            localStorage.setItem("SignUpEntries", signUpEntriesString);

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