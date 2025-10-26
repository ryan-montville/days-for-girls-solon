import { addItemToTable, createErrorMessage, updateLocalStorage } from './coreFunctions.js'

//Get data from local storage
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory");
let distributedInventoryData = JSON.parse(distributedInventoryLocalStorage);
let username = localStorage.getItem('username');
let isUserSignedIn = false;

//page elements
const errorMessageMain = document.getElementById('mainError');
const distributedForm = document.getElementById('distributedForm');
const previousEntriesTable = document.getElementById('previous-entries-table');
const previousEntriesTableBody = document.createElement('tbody');
previousEntriesTable.appendChild(previousEntriesTableBody);

function submitData() {
    const distributedFormData = new FormData(distributedForm);
    if (distributedFormData.get('quantity') < 1) {
        createErrorMessage("Please enter a quantity greater than 0", "main");
    } else {
        let newComponent = {
            "date": distributedFormData.get('date'),
            "componentType": distributedFormData.get('componentType'),
            "quantity": distributedFormData.get('quantity'),
            "destination": distributedFormData.get('destination')
        };
        distributedInventoryData.push(newComponent);
        updateCurrentInventory(distributedFormData.get('componentType'), distributedFormData.get('quantity'), "-");
        updateLocalStorage("outgoingInventory", distributedInventoryData);
        distributedForm.reset();
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

//Load data in previous entries table
function loadPreviousEntries() {
    if (distributedInventoryData.length < 1) {
        let noneRow = addItemToTable({}, 5);
        previousEntriesTableBody.appendChild(noneRow);
    } else {
        let l = distributedInventoryData.length - 1;
        for (let i = l; i >= 0; i--) {
            let newRow = addItemToTable( distributedInventoryData[i], 5, "distributedInventory", 'shortDate');
            previousEntriesTableBody.appendChild(newRow);
        }
    }
}

function checkIfSignedIn() {
    if (username) {
        isUserSignedIn = true;
        //Distributed form submit event listener
        distributedForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submitData();
        });

    } else {
        outgoingForm.remove();
    }
}

checkIfSignedIn();
loadPreviousEntries();