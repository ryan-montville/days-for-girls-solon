//Get data from local storage
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const outgoingInventoryLocalStorage = localStorage.getItem("outgoingInventory");
let outgoingInventoryData = JSON.parse(outgoingInventoryLocalStorage);
let username = localStorage.getItem('username');
let isUserSignedIn = false;

//page elements
const previousEntriesTable = document.getElementById('previous-entries-table');
const previousEntriesTableBody = document.createElement('tbody');
previousEntriesTable.appendChild(previousEntriesTableBody);
const previousEntriesCard = document.getElementById('outgoing-form');
const outgoingForm = document.getElementById('outgoing-form');
const dateInput = document.getElementById('date');
const componentNameInput = document.getElementById('component-name');
const quantityInput = document.getElementById('quantity');
const destinationInput = document.getElementById('destination');
const clearButton = document.getElementById('clear');
const submitButton = document.getElementById('submit');

function addItemToTable(component, tableName) {
    if (tableName === "outgoingInventory") {
        let newRow = document.createElement('tr');
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
        previousEntriesTableBody.appendChild(newRow);
    } else {
        console.log(`tableName param not right: ${tableName}`);
    }
}

function submitData() {
    let newComponent = {
        "date": dateInput.value,
        "componentType": componentNameInput.value,
        "quantity": quantityInput.value,
        "destination": destinationInput.value
    };
    outgoingInventoryData.push(newComponent);
    updateCurrentInventory(componentNameInput.value, quantityInput.value, "-");
    updateLocalStorage("outgoingInventory", outgoingInventoryData);
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
for (let i = outgoingInventoryData.length - 1; i >= 0; i--) {
    addItemToTable(outgoingInventoryData[i], "outgoingInventory");
}

function checkIfSignedIn() {
    if (username) {
        isUserSignedIn = true;
        //event listener to submit new inventory distribution
        submitButton.addEventListener('click', function (event) {
            event.preventDefault();
            submitData();
            outgoingForm.reset();
        });

        //event listener to clear the form
        clearButton.addEventListener('click', function (event) {
            event.preventDefault();
            outgoingForm.reset();
        });
    } else {
        outgoingForm.remove();
    }
}

checkIfSignedIn();