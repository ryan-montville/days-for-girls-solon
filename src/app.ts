import { createErrorMessage, trapFocus, updateLocalStorage } from "./utils.js";

async function loadData() {
    //This will change when proper data storage is implemented
    console.log("Fetching data from JSON and putting in local storage");
    try {
        //Fetch inventory data from inventory.json
        let response = await fetch('src/inventory.json');
        if (!response.ok) {
            createErrorMessage(`Error loading the data. Status: ${response.status}`, 'main');
            throw new Error(`Error loading data. Status: ${response.status}`);
        }
        let data = await response.json();
        console.log(`Fetched inventory data`);
        //Adding current inventory data to local storage
        updateLocalStorage("currentInventory", data['currentInventory']);
        //Adding incoming inventory data to local storage
        updateLocalStorage("donatedInventory", data['donatedInventory']);
        //Adding outgoing inventory data to local storage
        updateLocalStorage("distributedInventory", data['distributedInventory'])
        //fetch events data from events.json
        response = await fetch('src/events.json');
        if (!response.ok) {
            createErrorMessage(`Error loading the data. Status: ${response.status}`, 'main');
            throw new Error(`Error loading data. Status: ${response.status}`);
        }
        data = await response.json();
        console.log(`Fetched events data`);
        //Adding events and sign up data to local storage
        updateLocalStorage("events", data['upcomingEvents']);
        updateLocalStorage("SignUpEntries", data['SignUpEntries'])
    } catch (error: any) {
        createErrorMessage(error, 'main');
        console.error("Failed to load data: ", error);
    }
}

function checkForLocalStorageData() {
    //Not sure how this will work once proper data storage is implemented
    const currentInventoryLocalStorage: string | null = localStorage.getItem("currentInventory");
    if (!currentInventoryLocalStorage) {
        loadData();
    }
}

const inventoryLink = document.getElementById('inventory-link') as HTMLElement;
const openSignInModal = document.getElementById('open-sign-in-modal-button') as HTMLElement;
const navSignOutButton = document.getElementById('sign-out-button') as HTMLElement;
const signInModalBackdrop = document.getElementById('backdrop') as HTMLElement;
const signInModal = document.getElementById('sign-in-modal') as HTMLFormElement;
const signInLabel = document.getElementById('dialog-label') as HTMLElement;
const closeModalButton = document.getElementById('close-modal-button') as HTMLElement;
let isSignInModalOpen: boolean = false;
let isUserSignedIn: boolean = false;

//event listener for sign in button to open sign in modal
openSignInModal.addEventListener('click', (e) => {
    e.preventDefault();
    signInModalBackdrop.style.display = 'flex';
    signInModal.setAttribute('aria-modal', 'true');
    const usernameInput: HTMLElement | null = document.getElementById('username');
    if (usernameInput) usernameInput.focus();
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
        if (typeof username === 'string' && username.trim() !== '') {
            localStorage.setItem('username', username?.toString());
        } else {
            createErrorMessage("Username must not be empty", "signin");
        }
        signInModalBackdrop.style.display = 'none';
        signIn();
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

checkForLocalStorageData();
checkIfSignedIn();