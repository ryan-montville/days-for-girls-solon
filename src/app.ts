import { createMessage, closeModal, storeMessage, retrieveMessage, trapFocus, updateLocalStorage } from "./utils.js";
import { signInWithGooglePopup, getCurrentUser, signOutUser } from "./authService.js";
import { auth } from "./firebase.js";

const pageWrapper = document.getElementById('page-wrapper') as HTMLElement;
let mobileNavToggle = document.getElementById('mobile-nav-toggle') as HTMLElement;
const githubTemplateBaseURL = "https://raw.githubusercontent.com/ryan-montville/days-for-girls-solon/refs/heads/main/";

//Global DOM elements
let nav: HTMLElement;
let signInButton: HTMLElement;
let signOutButton: HTMLElement;
let inventoryLink: HTMLElement;
let signInModalBackdrop: HTMLElement;
let signInModal: HTMLFormElement;
let closeModalButton: HTMLElement;

function setUpAuthListener() {
    auth.onAuthStateChanged(user => {
        //Don't continue if these elements haven't loaded
        if (!inventoryLink || !signInButton || !signOutButton) return;

        if (user) {
            //User is signed in
            console.log("User is signed in");
            //Hide the sign in button and show the sign out button
            signInButton.style.display = 'none';
            signOutButton.style.display = 'block';
            //Close the sign in modal if it is open
            closeModal('sign-in-backdrop');
        } else {
            //User is not signed in
            console.log("User is not signed in");
            //Hide the inventory link
            inventoryLink.style.display = 'none';
            //Make sure the sign in button is displayed and the sign out button is not displayed
            signInButton.style.display = 'block';
            signOutButton.style.display = 'none';
        }
    });
}

export async function initializeApp(partentPage: string, currentPage: string) {
    //Wait for the DOM to load
    await new Promise<void>(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
        } else {
            resolve();
        }
    });

    //Load the header and wait for it to be added to the DOM
    await loadHeader(partentPage, currentPage);
    //Load the footer
    await loadFooter();
    //Load the modals
    await loadModals();
    //Set the page elemenets once the header, footer, and modals are loaded and added to the DOM
    nav = document.querySelector('nav') as HTMLElement;
    inventoryLink = document.getElementById('inventory-link') as HTMLElement;
    signInButton = document.getElementById('open-sign-in-modal-button') as HTMLElement;
    signOutButton = document.getElementById('sign-out-button') as HTMLElement;
    signInModalBackdrop = document.getElementById('sign-in-backdrop') as HTMLElement;
    signInModal = document.getElementById('sign-in-modal') as HTMLFormElement;
    closeModalButton = document.getElementById('close-modal-button') as HTMLElement;
    await checkForLocalStorageData();//Remove ?

    //User Authentication check
    setUpAuthListener();

    //Check to see if there is a message waiting to be displayed
    retrieveMessage();

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

    //event listener for sign in button to open sign in modal
    signInButton.addEventListener('click', (e) => {
        e.preventDefault();
        //Change the mobile nav button back to the menu icon
        if (nav.classList.contains('open')) {
            mobileNavToggle.innerText = 'menu';
            nav.classList.remove('open');
        }
        //Dynamically generate/load the content of the sign in modal to handle registration?
        //Display th sign in modal
        signInModalBackdrop.style.display = 'flex';
        signInModal.classList.add('opening');
        signInModal.setAttribute('aria-modal', 'true');
        const usernameInput: HTMLElement | null = document.getElementById('username');
        if (usernameInput) usernameInput.focus();
        trapFocus(signInModal, signInModalBackdrop);
    });

    //event listener to sign in - Should this stay or only log in with Google?
    // signInModal.addEventListener('submit', (event) => {
    //     event.preventDefault();
    //     const signInFormData = new FormData(signInModal);
    //     const username = signInFormData.get('username');
    //     const password = signInFormData.get('password')
    //     if (username === null || username?.toString().trim() === '') {
    //         createMessage("Username must not be empty", "sign-in-message", "error");
    //         return;
    //     }
    //     if (password === null || password.toString().trim() === '') {
    //         createMessage("PAssword must not be empty", "sign-in-message", "error");
    //     }
    //     localStorage.setItem('username', username?.toString());
    //     signInModalBackdrop.style.display = 'none';
    //     signIn();
    //     storeMessage("Sign In Successful", "main-message", "check_circle");
    //     window.location.reload();
    // });

    //Event listener to sign in with Google
    const googleSignInButton = document.getElementById('google-login-button') as HTMLElement;
    googleSignInButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const googleMessage = document.getElementById('google-message') as HTMLElement;
        googleMessage.textContent = "Opening Google window...";
        try {
            await signInWithGooglePopup();
            //If sucessful sign in with Google, close the modal and display the message
            //closeModal('sign-in-backdrop'); I don't think this is needed here, it should be handled in setupAuthListener
            const user = getCurrentUser();
            if (user) {
                createMessage(`Welcome ${user.displayName}`, 'main-message', 'check_circle');
                //window.location.reload(); maybe not needed anymore. Check events page once it works again
            }
        } catch (error: any) {
            let errorMessage = "Sign-In failed.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Sign-In window closed.";
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = "Sign-In request already in progress.";
            } else {
                errorMessage = `Error: ${error.message}`;
            }
            googleMessage.textContent = errorMessage;
            createMessage(errorMessage, 'sign-in-message', 'error');
            console.error("Google sign-in error details:", error);
        }
    });

    //event listener to sign out
    signOutButton.addEventListener('click', () => {
        signOut();
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
        let manageInventoryBackdrop = document.getElementById("manage-inventory-backdrop");
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
            } else if (manageInventoryBackdrop && manageInventoryBackdrop.style.display === 'flex') {
                closeModal('manage-inventory-backdrop');
            }
            else {
                console.log("No modals are open");
            }
        }
    });

}

async function loadData() {
    await Promise.all([
        //Get inventory data from json file and put into local storage
        fetch('https://raw.githubusercontent.com/ryan-montville/days-for-girls-solon/refs/heads/main/src/inventory.json')
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
            }),
        //Get events data from json file and put into local storage
        fetch('https://raw.githubusercontent.com/ryan-montville/days-for-girls-solon/refs/heads/main/src/events.json')
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
    ]);
}

async function loadHeader(partentPage: string, currentPage: string): Promise<void> {
    const headerPlaceholder = document.getElementById('header-placeholder') as HTMLElement;
    try {
        //Get the header html from the header file. Using a relative path broke on GitHub pages
        const response = await fetch(githubTemplateBaseURL + 'header.html');
        if (!response.ok) {
            console.error(`${response.status}: ${response.statusText}`);
            throw new Error("Error fetching header");
        }
        //Wait while the app converts the data to a string to pass to innerHTML
        const headerData = await response.text();
        //Create the header element and set the header HTML
        let header = document.createElement('header');
        header.innerHTML = headerData;
        //Replace the header placeholder with the header
        pageWrapper.replaceChild(header, headerPlaceholder);
        //Set aria-current=page for the current page
        const nav = document.querySelector('nav') as HTMLElement;
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            if (link.textContent === partentPage) {
                link.setAttribute('aria-current', 'page');
            }
        });
    } catch (error) {
        console.error(`Failed to load the header: ${error}`);
    }
}

async function loadFooter(): Promise<void> {
    const footerPlaceholder = document.getElementById('footer-placeholder') as HTMLElement;
    try {
        //Get the footer html from the footer file. Using a relative path broke on GitHub pages
        const response = await fetch(githubTemplateBaseURL + 'footer.html');
        if (!response.ok) {
            console.error(`${response.status}: ${response.statusText}`);
            throw new Error("Error fetching footer");
        }
        //Wait while the app converts the data to a string to pass to innerHTML
        const footerData = await response.text();
        //Create the footer element and set the footer HTML
        const footer = document.createElement('footer');
        footer.innerHTML = footerData;
        //Replace the placeholder with the footer
        pageWrapper.replaceChild(footer, footerPlaceholder);
    } catch (error) {
        console.error(`Failed to load the footer: ${error}`);
    }
}

async function loadModals() {
    const body = document.querySelector('body') as HTMLElement;
    const modalPlaceholder = document.getElementById('modal-placeholder') as HTMLElement;
    try {
        //Get the modal html from the modal file. Using a relative path broke on GitHub pages
        const response = await fetch(githubTemplateBaseURL + 'modal.html');
        if (!response.ok) {
            console.error(`${response.status}: ${response.statusText}`);
            throw new Error("Error fetching modals");
        }
        //Wait while the app converts the data to a string to pass to innerHTML
        const modalData = await response.text();
        //Create the modals container
        const modalsContainer = document.createElement('div');
        modalsContainer.innerHTML = modalData;
        //Replace the placeholder with the modals
        body.replaceChild(modalsContainer, modalPlaceholder);
    } catch (error) {
        console.error(`Failed to load the modals: ${error}`);
    }
}

async function checkForLocalStorageData() {
    //Not sure how this will work once proper data storage is implemented
    const currentInventoryLocalStorage: string | null = localStorage.getItem("currentInventory");
    if (!currentInventoryLocalStorage) {
        await loadData();
    }
}

//Is this needed?
// function signIn() {
//     const inventoryLink = document.getElementById('inventory-link') as HTMLElement;
//     const openSignInModal = document.getElementById('open-sign-in-modal-button') as HTMLElement;
//     const navSignOutButton = document.getElementById('sign-out-button') as HTMLElement;
//     inventoryLink.style.display = 'block';
//     openSignInModal.style.display = 'none';
//     navSignOutButton.style.display = 'block';
// }

function signOut() {
    //Shouldn't need any of this, should be handled by setupAuthListener()
    // const inventoryLink = document.getElementById('inventory-link') as HTMLElement;
    // const navSignOutButton = document.getElementById('sign-out-button') as HTMLElement;
    // inventoryLink.style.display = 'none';
    // navSignOutButton.style.display = 'none';
    signOutUser();
    storeMessage("Signed Out Successfully", 'main-message', 'check_circle');
    // window.location.reload(); maybe not needed anymore. Check events page once it works again

}

//check if user is signed in
function checkIfSignedIn() {
    const inventoryLink = document.getElementById('inventory-link') as HTMLElement;
    const authState = auth.onAuthStateChanged(user => {
        if (user) {
        const signInButton = document.getElementById('open-sign-in-modal-button') as HTMLElement;
        const SignOutButton = document.getElementById('sign-out-button') as HTMLElement;
        console.log("user is signed in");
        signInButton.style.display = 'none';
        SignOutButton.style.display = 'block';
    } else {
        inventoryLink.style.display = 'none';
        console.log("user is not signed in");
    }
    });
}

function showSignInModal() {

}

function showRegisterModal() {

}