import { addItemToTable, createErrorMessage, updateLocalStorage } from './coreFunctions.js'

//Get data from local storage
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const donatedInventoryLocalStorage = localStorage.getItem("donatedInventory");
let donatedInventoryData = JSON.parse(donatedInventoryLocalStorage);
let username = localStorage.getItem('username');
let isUserSignedIn = false;

//page elements
const errorMessageMain = document.getElementById('mainError');
const donatedForm = document.getElementById('donatedForm');
const previousEntriesTable = document.getElementById('previous-entries-table');
const previousEntriesTableBody = document.createElement('tbody');
previousEntriesTable.appendChild(previousEntriesTableBody);

function submitData() {
    const donatedFormData = new FormData(donatedForm);
    if (donatedFormData.get('quantity') < 1) {
        createErrorMessage("Please enter a quantity greater than 0", "main");
    } else {
        let newComponent = {
            "date": donatedFormData.get('date'),
            "componentType": donatedFormData.get('componentType'),
            "quantity": donatedFormData.get('quantity'),
            "whoDonated": donatedFormData.get('whoDonated')
        };
        donatedInventoryData.push(newComponent);
        updateCurrentInventory(donatedFormData.get('componentType'), donatedFormData.get('quantity'), "+");
        updateLocalStorage("incomingInventory", donatedInventoryData);
    }

}

function updateCurrentInventory(componentName, quantity, mathOperator) {
    let componentIndex = currentInventoryData.findIndex(item => {
        return item.componentType === componentName;
    });
    let updatedQuantity = 0;
    if (mathOperator === "+") {
        updatedQuantity = parseInt(currentInventoryData[componentIndex].quantity) + parseInt(quantity);
    } else {
        updatedQuantity = parseInt(currentInventoryData[componentIndex].quantity) - parseInt(quantity);
    }
    currentInventoryData[componentIndex].quantity = updatedQuantity;
    updateLocalStorage("currentInventory", currentInventoryData);
    window.location.reload();
}

function loadPreviousEntries() {
    if (donatedInventoryData.length < 1) {
        let noneRow = addItemToTable({}, 5);
        previousEntriesTableBody.appendChild(noneRow);
    } else {
        let l = donatedInventoryData.length - 1
        for (let i = l; i >= 0; i--) {
            let newRow = addItemToTable(donatedInventoryData[i], 5, "donatedInventory", 'shortDate');
            previousEntriesTableBody.appendChild(newRow);
        }
    }
}

function checkIfSignedIn() {
    if (username) {
        isUserSignedIn = true;
        //donated form submit event listener
        donatedForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submitData();
            incomingForm.reset();
        });
    } else {
        incomingForm.remove();
    }
}

checkIfSignedIn();
loadPreviousEntries();