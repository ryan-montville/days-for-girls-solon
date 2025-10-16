//page elements
const errorMessage = document.getElementById('error');
const currentInventoryTableBody = document.getElementById('current-inventory-body');
const manageInventoryButtons = document.getElementById('manage-inventory');
const inventoryReport = document.getElementById('inventory-report');
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
const incomingInventoryLocalStorage = localStorage.getItem("incomingInventory");
const outgoingInventoryLocalStorage = localStorage.getItem("outgoingInventory");

function createErrorMessage(error) {
    let p = document.createElement('p');
    let errorMessageText = document.createTextNode(error);
    p.appendChild(errorMessageText);
    errorMessage.appendChild(p);
}

function addItemToTable(component, tableName) {
    if (tableName === "currentInventory") {
        let newRow = currentInventoryTableBody.insertRow();
        let componentNameCell = newRow.insertCell();
        let componentName = document.createTextNode(component.componentType);
        componentNameCell.appendChild(componentName);
        let componentQuantityCell = newRow.insertCell();
        let componentQuantity = document.createTextNode(component.quantity);
        componentQuantityCell.appendChild(componentQuantity);
    } else if (tableName === "incomingInventory") {
        
    } else if (tableName === "outgoingInventory") {

    } else {
        console.log(`tableName param not right: ${tableName}`);
    }
}

function loadCurrentInventory() {
    let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
    for (let i = 0; i < currentInventoryData.length; i++) {
        addItemToTable(currentInventoryData[i], "currentInventory");
    }
}

//check to see if the user is signed in, if not remove links to manage inventory and generate reports
let localStorageUser = localStorage.getItem("username");
if (!localStorageUser) {
    manageInventoryButtons.remove();
    inventoryReport.remove();
}

loadCurrentInventory();