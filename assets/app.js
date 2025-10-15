function app() {
    "use strict";

    //event listener for sign in button to open sign in pop up
    let navSignInButton = document.getElementById('sign-in-button');
    let signInPopUp = document.getElementById('pop-up-container');
    navSignInButton.addEventListener('click', () => {
        signInPopUp.style.display = 'flex';
    });

    //event listener for the pop up close button
    let closeButton = document.getElementById('close');
    closeButton.addEventListener('click', () => {
        signInPopUp.style.display = 'none';
    });
}

app();