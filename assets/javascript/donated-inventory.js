import { createErrorMessage, fixDate, updateLocalStorage } from './coreFunctions.js'

//Get data from local storage
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const incomingInventoryLocalStorage = localStorage.getItem("incomingInventory");
let incomingInventoryData = JSON.parse(incomingInventoryLocalStorage);
let username = localStorage.getItem('username');
let isUserSignedIn = false;

//page elements
const errorMessageMain = document.getElementById('mainError');
const donatedForm = document.getElementById('donatedForm');
const previousEntriesTable = document.getElementById('previous-entries-table');
const previousEntriesTableBody = document.createElement('tbody');
previousEntriesTable.appendChild(previousEntriesTableBody);
const previousEntriesCard = document.getElementById('outgoing-form');

function addItemToTable(component, empty) {
    let newRow = document.createElement('tr');
    if (!empty) {
        let dateCell = document.createElement('td');
        let date = document.createTextNode(fixDate(component.date, true));
        dateCell.appendChild(date);
        newRow.appendChild(dateCell);
        let componentNameCell = document.createElement('td');
        let componentName = document.createTextNode(component.componentType);
        componentNameCell.appendChild(componentName);
        newRow.appendChild(componentNameCell);
        let componentQuantityCell = document.createElement('td');
        let componentQuantity = document.createTextNode(component.quantity);
        newRow.appendChild(componentQuantityCell);
        componentQuantityCell.appendChild(componentQuantity);
        let whoDonatedCell = document.createElement('td');
        let whoDonated = document.createTextNode(component.whoDonated);
        whoDonatedCell.appendChild(whoDonated);
        newRow.appendChild(whoDonatedCell);
    } else {
        let noneCell = document.createElement('td');
        noneCell.setAttribute('colspan', '3');
        let noneText = document.createTextNode("No sign up entires for this event");
        noneCell.appendChild(noneText);
        newRow.appendChild(noneCell);
    }
    previousEntriesTableBody.appendChild(newRow);
}

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
        incomingInventoryData.push(newComponent);
        updateCurrentInventory(donatedFormData.get('componentType'), donatedFormData.get('quantity'), "+");
        updateLocalStorage("incomingInventory", incomingInventoryData);
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
    if (incomingInventoryData.length < 1) {
        addItemToTable('', true);
    } else {
        let l = incomingInventoryData.length - 1
        for (let i = l; i >= 0; i--) {
            addItemToTable(incomingInventoryData[i], false);
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