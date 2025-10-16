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

async function loadJsonData() {
    try {
        let response = await fetch('assets/inventory.json');
        if (!response.ok) {
            createErrorMessage(`Error loading the data. Status: ${response.status}`);
            throw new Error(`Error loading data. Status: ${response.status}`);
        }
        let data = await response.json();
        console.log(`Fetched data`);
        //Adding current inventory data to local storage
        let dataCurrentInventory = data.currentInventory;
        let currentInventoryString = JSON.stringify(dataCurrentInventory);
        localStorage.setItem("currentInventory", currentInventoryString);
        //Adding incoming inventory data to local storage
        let dataIncomingInventory = data.incomingInventory;
        let incomingInventoryString = JSON.stringify(dataIncomingInventory);
        localStorage.setItem("incomingInventory", incomingInventoryString);
        //Adding outgoing inventory data to local storage
        let dataOutgoingInventory = data.outgoingInventory;
        let outgoingInventoryString = JSON.stringify(dataOutgoingInventory);
        localStorage.setItem("outgoingInventory", outgoingInventoryString);

        //Add the current inventory to the table
        for (let i = 0; i < data.length; i++) {
            addItemToTable(data[i], "currentInventory");
        }
    } catch (error) {
        createErrorMessage(error);
        console.error("Failed to load data: ", error);
    }
}
//check to see if the user is signed in, if not remove links to manage inventory and generate reports
let localStorageUser = localStorage.getItem("username");
if (!localStorageUser) {
    manageInventoryButtons.remove();
    inventoryReport.remove();
}

//Check to see if current inventory data is in local storage. If not, load the data from the json file and save to local storage
if (!currentInventoryLocalStorage) {
    console.log("current inventory not found in local storage");
    loadJsonData();
} else {
    console.log("Current inventory found in local storage.");
    let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
    for (let i = 0; i < currentInventoryData.length; i++) {
        addItemToTable(currentInventoryData[i], "currentInventory");
    }
}