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
            let response = await fetch('assets/inventory.json');
            if (!response.ok) {
                createErrorMessage(`Error loading the data. Status: ${response.status}`);
                throw new Error(`Error loading data. Status: ${response.status}`);
            }
            let data = await response.json();
            console.log(`Fetched data`);
            //Adding current inventory data to local storage
            let dataCurrentInventory = data.currentInventory;
            let currentInventoryString = JSON.stringify(dataCurrentInventory);
            localStorage.setItem("currentInventory", currentInventoryString);
            //Adding incoming inventory data to local storage
            let dataIncomingInventory = data.incomingInventory;
            let incomingInventoryString = JSON.stringify(dataIncomingInventory);
            localStorage.setItem("incomingInventory", incomingInventoryString);
            //Adding outgoing inventory data to local storage
            let dataOutgoingInventory = data.outgoingInventory;
            let outgoingInventoryString = JSON.stringify(dataOutgoingInventory);
            localStorage.setItem("outgoingInventory", outgoingInventoryString);

            //Add the current inventory to the table
            for (let i = 0; i < data.length; i++) {
                addItemToTable(data[i], "currentInventory");
            }
        } catch (error) {
            createErrorMessage(error);
            console.error("Failed to load data: ", error);
        }
    }
    loadJsonData();
}



app();