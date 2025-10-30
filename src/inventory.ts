import { addITemToTable, createMessage, clearMessages, fixDate } from "./utils.js";
import { InventoryEntry, ComponentItem } from "./models.js";

const currentInventoryLocalStorage = localStorage.getItem("currentInventory") as string;
let currentInventoryData: ComponentItem[] = JSON.parse(currentInventoryLocalStorage);
const incomingInventoryLocalStorage = localStorage.getItem("incomingInventory") as string;
let incomingInventoryData: InventoryEntry[] = JSON.parse(incomingInventoryLocalStorage);
const outgoingInventoryLocalStorage = localStorage.getItem("outgoingInventory") as string;
let outgoingInventoryData: InventoryEntry[] = JSON.parse(outgoingInventoryLocalStorage);
let inventoryReportCard = document.getElementById('inventory-report-card') as HTMLElement;
let generateForm = document.getElementById('generateForm') as HTMLFormElement;
let username = localStorage.getItem('username') as string;
let isUserSignedIn: boolean = false;

//Maybe modify addToTable in utils.ts to include the current inventory table
function addComponentToTable(component: ComponentItem): HTMLElement {
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
    let currentInventoryTable = document.getElementById('current-inventory-table') as HTMLElement;
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

function filterDateRange(startDate: Date, endDate: Date) {
    //WIP
    //Possibly add context?: string to InventoryEntry model
}

function calculateInventoryTotals(filteredArray: InventoryEntry[]) {
    //WIP
}

function createSummaryTable(entriesSummary: any) {
    //WIP
    //Change entriesSummary param type
}

function createEntriesTable(filteredResults: InventoryEntry[]) {
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