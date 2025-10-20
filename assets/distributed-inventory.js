//Get data from local storage
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const outgoingInventoryLocalStorage = localStorage.getItem("outgoingInventory");
let outgoingInventoryData = JSON.parse(outgoingInventoryLocalStorage);
let username = localStorage.getItem('username');
let isUserSignedIn = false;

//page elements
const mainError = document.getElementById('main-error');
const distributedForm = document.getElementById('distributedForm');
const previousEntriesTable = document.getElementById('previous-entries-table');
const previousEntriesTableBody = document.createElement('tbody');
previousEntriesTable.appendChild(previousEntriesTableBody);
const previousEntriesCard = document.getElementById('outgoing-form');

function addItemToTable(component, empty) {
    let newRow = document.createElement('tr');
    if (!empty) {
        
        let dateCell = document.createElement('td');
        let dateOBJ = new Date(component.date);
        let startDateTimezoneFixed = new Date(dateOBJ.getTime() - dateOBJ.getTimezoneOffset() * -60000);
        let dateFormatted = startDateTimezoneFixed.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        let date = document.createTextNode(dateFormatted);
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
        let destinationCell = document.createElement('td');
        let destination = document.createTextNode(component.destination);
        destinationCell.appendChild(destination);
        newRow.appendChild(destinationCell);
        
    } else {
        let noneCell = document.createElement('td');
        noneCell.setAttribute('colspan', '3');
        let noneText = document.createTextNode("No sign up entires for this event");
        noneCell.appendChild(noneText);
        newRow.appendChild(noneCell);
    }
    previousEntriesTableBody.appendChild(newRow);
}

function createErrorMessage(message, location) {
    let errorMessageP = document.createElement('p');
    let errorMessage = document.createTextNode(message);
    errorMessageP.appendChild(errorMessage);
    if (location === 'sign-in') {
        signInError.appendChild(errorMessageP);
    } else {
        mainError.appendChild(errorMessageP);
    }
}

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
        outgoingInventoryData.push(newComponent);
        updateCurrentInventory(distributedFormData.get('componentType'), distributedFormData.get('quantity'), "-");
        updateLocalStorage("outgoingInventory", outgoingInventoryData);
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

function updateLocalStorage(itemName, data,) {
    let dataString = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}

//Load data in previous entries table
function loadPreviousEntries() {
    if (outgoingInventoryData.length < 1) {
        addItemToTable('', true);
    } else {
        for (let i = outgoingInventoryData.length - 1; i >= 0; i--) {
            addItemToTable(outgoingInventoryData[i], false);
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