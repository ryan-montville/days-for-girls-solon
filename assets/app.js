function app() {
    "use strict";

    //page elements
    let navSignInButton = document.getElementById('sign-in-button');
    let navSignOutButton = document.getElementById('sign-out-button');
    let inventoryLink = document.getElementById('inventory-link');
    let signInPopUp = document.getElementById('pop-up-container');
    let closeButton = document.getElementById('close');
    let formSignInButton = document.getElementById('form-sign-in-button');
    let usernameInput = document.getElementById('username');
    let passwordInput = document.getElementById('password');
    let nav = document.querySelector('nav');
    let navLinks = nav.querySelectorAll('a');

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

    //TODO: work on sign out function

    //check if signed in
    let storedUsername = localStorage.getItem("username");
    if (storedUsername) {
        signIn();
    }

    //temporary event listener to simulate sign in
    formSignInButton.addEventListener('click', () => {
        if (usernameInput.value.length > 0 && passwordInput.value.length > 0) {
            signInPopUp.style.display = 'none';
            console.log('sign in successful');
            localStorage.setItem("username", usernameInput.value);
            signIn();
        } else {
            alert('Please enter username and password.');
        }
    });
    navSignOutButton.addEventListener('click', () => {
        signOut();
    })
}

app();