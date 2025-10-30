import { addITemToTable, createMessage } from "./utils.js";
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const incomingInventoryLocalStorage = localStorage.getItem("incomingInventory");
let incomingInventoryData = JSON.parse(incomingInventoryLocalStorage);
const outgoingInventoryLocalStorage = localStorage.getItem("outgoingInventory");
let outgoingInventoryData = JSON.parse(outgoingInventoryLocalStorage);
let inventoryReportCard = document.getElementById('inventory-report-card');
let generateForm = document.getElementById('generateForm');
let username = localStorage.getItem('username');
let isUserSignedIn = false;
//Maybe modify addToTable in utils.ts to include the current inventory table
function addComponentToTable(component) {
    let newRow = document.createElement('tr');
    //Component Type
    let componentNameCell = document.createElement('td');
    let componentName = document.createTextNode(component['componentType']);
    componentNameCell.appendChild(componentName);
    newRow.appendChild(componentNameCell);
    //Component quantity in inventory
    let componentQuantityCell = document.createElement('td');
    let componentQuantity = document.createTextNode(component['quantity'].toString());
    componentQuantityCell.appendChild(componentQuantity);
    newRow.appendChild(componentQuantityCell);
    return newRow;
}
function loadCurrentInventory() {
    let currentInventoryTable = document.getElementById('current-inventory-table');
    let tableBody = document.createElement('tbody');
    currentInventoryTable.appendChild(tableBody);
    if (currentInventoryData.length === 0) {
        let noInventoryRow = addITemToTable({}, 2);
        tableBody.appendChild(noInventoryRow);
        inventoryReportCard.remove();
    }
    currentInventoryData.forEach(item => {
        let componentRow = addComponentToTable(item);
        tableBody.appendChild(componentRow);
    });
}
function filterDateRange(startDate, endDate) {
    //WIP
    //Possibly add context?: string to InventoryEntry model
}
function calculateInventoryTotals(filteredArray) {
    //WIP
}
function createSummaryTable(entriesSummary) {
    //WIP
    //Change entriesSummary param type
}
function createEntriesTable(filteredResults) {
    //WIP
}
function generateReport() {
    createMessage("Generate Report functionality coming soon", "report-message", "info");
}
//Maybe add check if logged in, else remove report card
loadCurrentInventory();
generateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    generateReport();
});
