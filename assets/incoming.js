//page elements
const previousEntriesTableBody = document.getElementById('previous-entries-body');
const previousEntriesCard = document.getElementById('outgoing-form');
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const incomingInventoryLocalStorage = localStorage.getItem("incomingInventory");
let incomingInventoryData = JSON.parse(incomingInventoryLocalStorage);

const incomingForm = document.getElementById('incoming-form');
const dateInput = document.getElementById('date');
const componentNameInput = document.getElementById('component-name');
const quantityInput = document.getElementById('quantity');
const whoDonatedInput = document.getElementById('who-donated');
const clearButton = document.getElementById('clear');
const submitButton = document.getElementById('submit');

function addItemToTable(component, tableName) {
    if (tableName === "incomingInventory") {
        let newRow = previousEntriesTableBody.insertRow();
        let dateCell = newRow.insertCell();
        let date = document.createTextNode(component.date);
        dateCell.appendChild(date);
        let componentNameCell = newRow.insertCell();
        let componentName = document.createTextNode(component.componentType);
        componentNameCell.appendChild(componentName);
        let componentQuantityCell = newRow.insertCell();
        let componentQuantity = document.createTextNode(component.quantity);
        componentQuantityCell.appendChild(componentQuantity);
        let whoDonatedCell = newRow.insertCell()
        let whoDonated = document.createTextNode(component.whoDonated);
        whoDonatedCell.appendChild(whoDonated);
    } else {
        console.log(`tableName param not right: ${tableName}`);
    }
}

function submitData() {
    let newComponent = {
        "date": dateInput.value,
            "componentType": componentNameInput.value,
            "quantity": quantityInput.value,
            "whoDonated": whoDonatedInput.value
    };
    incomingInventoryData.push(newComponent);
    updateCurrentInventory(componentNameInput.value, quantityInput.value, "+");
    updateLocalStorage("incomingInventory", incomingInventoryData);
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

function updateLocalStorage(itemName, data, ) {
    let dataString = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}

//Load data in previous entries table
for (let i=incomingInventoryData.length-1; i>=0; i--) {
    addItemToTable(incomingInventoryData[i], "incomingInventory");
}

//check to see if user is signed in
if (localStorage.getItem("username")) {
    //event listener to submit data to outgoing inventory log
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        submitData();
        incomingForm.reset();
    });

    //event listener to clear the form
    clearButton.addEventListener('click', function(event) {
        event.preventDefault();
        incomingForm.reset();
    });
} else {
    incomingForm.remove();
}