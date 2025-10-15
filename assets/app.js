function app() {
    "use strict";

    //page elements
    let navSignInButton = document.getElementById('sign-in-button');
    let signInPopUp = document.getElementById('pop-up-container');
    let closeButton = document.getElementById('close');
    let formSignInButton = document.getElementById('form-sign-in-button');
    let usernameInput = document.getElementById('username');
    let passwordInput = document.getElementById('password');
    let nav = document.querySelector('nav');
    let navLinks = nav.querySelectorAll('a');
    let donateButton = navLinks[3];

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
        let inventoryLink = document.createElement('a');
        let inventoryLinkText = document.createTextNode("Inventory");
        inventoryLink.appendChild(inventoryLinkText);
        inventoryLink.href = "inventory.html";
        nav.insertBefore(inventoryLink, donateButton);
    }

    //TODO: work on sign out function

    //check if signed in
    let storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        signIn();
    }

    //temporary event listener to simulate sign in
    formSignInButton.addEventListener('click', () => {
        if (usernameInput.value.length > 0 && passwordInput.value.length > 0) {
            console.log('sign in successful');
            localStorage.setItem("username", usernameInput.value);
            signIn();
        } else {
            alert('Please enter username and password.');
        }
    });
}

app();