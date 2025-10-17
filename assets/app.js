function app() {
    "use strict";

    //page elements
    const navSignInButton = document.getElementById('sign-in-button');
    const navSignOutButton = document.getElementById('sign-out-button');
    const inventoryLink = document.getElementById('inventory-link');
    const signInPopUp = document.getElementById('pop-up-container');
    const closeButton = document.getElementById('close');
    const formSignInButton = document.getElementById('form-sign-in-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    //event listener for sign in button to open sign in pop up
    navSignInButton.addEventListener('click', () => {
        signInPopUp.style.display = 'flex';
    });

    //event listener for the pop up close button
    closeButton.addEventListener('click', () => {
        signInPopUp.style.display = 'none';
    });

    function signIn() {
        console.log('found username in local storage');
        inventoryLink.style.display = 'block';
        navSignInButton.style.display = 'none';
        navSignOutButton.style.display = 'block';
    }

    function signOut() {
        console.log("Removing username from local storage");
        localStorage.removeItem("username");
        inventoryLink.style.display = 'none';
        navSignOutButton.style.display = 'none';
        navSignInButton.style.display = 'block';
    }

    //check if signed in
    let storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        signIn();
    }

    //temporary event listeners to simulate sign in and sign out
    formSignInButton.addEventListener('click', () => {
        if (usernameInput.value.length > 0 && passwordInput.value.length > 0) {
            signInPopUp.style.display = 'none';
            console.log('sign in successful');
            localStorage.setItem("username", usernameInput.value);
            signIn();
            window.location.reload();
        } else {
            alert('Please enter username and password.');
        }
    });
    navSignOutButton.addEventListener('click', () => {
        signOut();
        window.location.reload();
    })
    async function loadJsonData() {
        try {
            //Fetch inventory data from inventory.json
            let response = await fetch('assets/inventory.json');
            if (!response.ok) {
                createErrorMessage(`Error loading the data. Status: ${response.status}`);
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
                createErrorMessage(`Error loading the data. Status: ${response.status}`);
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
            createErrorMessage(error);
            console.error("Failed to load data: ", error);
        }        
    }
    //check to see if current inventory is in local storage
    let currentInventoryLocalStorage = localStorage.getItem("currentInventory");
    if (!currentInventoryLocalStorage) {
        loadJsonData();
    }
}



app();