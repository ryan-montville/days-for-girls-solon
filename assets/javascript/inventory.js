import { createErrorMessage, fixDate } from './coreFunctions.js'

const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const incomingInventoryLocalStorage = localStorage.getItem("incomingInventory");
let incomingInventoryData = JSON.parse(incomingInventoryLocalStorage);
const outgoingInventoryLocalStorage = localStorage.getItem("outgoingInventory");
let outgoingInventoryData = JSON.parse(outgoingInventoryLocalStorage);
let username = localStorage.getItem('username');
let isUserSignedIn = false;

//page elements
const errorMessageMain = document.getElementById('mainError');
const currentInventoryTableBody = document.getElementById('current-inventory-body');
const manageInventoryButtons = document.getElementById('manage-inventory');
const inventoryReportCard = document.getElementById('inventory-report-card');
const generateForm = document.getElementById('generate-form');

function addItemToTable(component, tableName) {
    let newRow = currentInventoryTableBody.insertRow();
        let componentNameCell = newRow.insertCell();
        let componentName = document.createTextNode(component.componentType);
        componentNameCell.appendChild(componentName);
        let componentQuantityCell = newRow.insertCell();
        let componentQuantity = document.createTextNode(component.quantity);
        componentQuantityCell.appendChild(componentQuantity);
}

function loadCurrentInventory() {
    let l = currentInventoryData.length;
    for (let i = 0; i < l; i++) {
        addItemToTable(currentInventoryData[i], "currentInventory");
    }
}

function filterDateRange(startDate, endDate) {
    let filteredIncoming = incomingInventoryData.filter(item => {
        return new Date(item.date) >= startDate && new Date(item.date) <= endDate;
    });
    let filteredOutgoing = outgoingInventoryData.filter(item => {
        return new Date(item.date) >= startDate && new Date(item.date) <= endDate;
    });
    //combine incoming and outgoing items, convert quantity to positive number for incoming and negative number for outgoing
    let filteredResults = [];
    for (let i = 0; i < filteredIncoming.length; i++) {
        let currentItem = filteredIncoming[i];
        let newItem = {
            "date": currentItem.date,
            "componentType": currentItem.componentType,
            "quantity": currentItem.quantity,
            "context": currentItem.whoDonated
        };
        filteredResults.push(newItem);
    }
    for (let i = 0; i < filteredOutgoing.length; i++) {
        let currentItem = filteredOutgoing[i];
        let newItem = {
            "date": currentItem.date,
            "componentType": currentItem.componentType,
            "quantity": currentItem.quantity * -1,
            "context": currentItem.destination
        };
        filteredResults.push(newItem);
    }
    let filteredSorted = filteredResults.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    return filteredSorted;
}

function calculateInventoryTotals(filteredArray) {
    let uniqueComponents = [];
    for (let i = 0; i < currentInventoryData.length; i++) {
        let currentComponent = {
            "componentType": currentInventoryData[i].componentType,
            "quantityDonated": 0,
            "quantityDistributed": 0
        }
        for (let i = 0; i < filteredArray.length; i++) {
            let currentEntry = filteredArray[i];
            if (currentEntry.componentType === currentComponent.componentType) {
                if (currentEntry.quantity > 0) {
                    currentComponent.quantityDonated += currentEntry.quantity;
                } else {
                    currentComponent.quantityDistributed += (currentEntry.quantity * -1);
                }
            }
        }
        uniqueComponents.push(currentComponent);
    }
    return uniqueComponents;
}

function createSummaryTable(entriesSummary) {
    const summaryTable = document.createElement('table');
    //table header
    const summaryThead = document.createElement('thead');
    const summaryHeaderRow = document.createElement('tr');
    const donatedHeader = document.createElement('th');
    const donatedHeaderText = document.createTextNode("Total Donated");
    donatedHeader.appendChild(donatedHeaderText);
    summaryHeaderRow.appendChild(donatedHeader);
    const distributedHeader = document.createElement('th');
    const distributedHeaderText = document.createTextNode("Total Distributed")
    distributedHeader.appendChild(distributedHeaderText);
    summaryHeaderRow.appendChild(distributedHeader);
    summaryThead.appendChild(summaryHeaderRow)
    summaryTable.appendChild(summaryThead);
    //table body
    const summaryBody = document.createElement('tbody');
    for (let i = 0; i < entriesSummary.length; i++) {
        let newRow = document.createElement('tr');
        let donatedCell = document.createElement('td');
        let donated = document.createTextNode(`${entriesSummary[i].componentType}: ${entriesSummary[i].quantityDonated}`);
        donatedCell.appendChild(donated);
        newRow.appendChild(donatedCell);
        let distributedCell = document.createElement('td');
        let distributed = document.createTextNode(`${entriesSummary[i].componentType}: ${entriesSummary[i].quantityDistributed}`);
        distributedCell.appendChild(distributed);
        newRow.appendChild(distributedCell);
        summaryBody.appendChild(newRow);
    }
    summaryTable.appendChild(summaryBody);
    return summaryTable;
}

function createEntriesTable(filteredResults) {
    const entriesTable = document.createElement('table');
    //table header
    const entriesThead = document.createElement('thead');
    const entiresHeaderRow = document.createElement('tr');
    const dateHeader = document.createElement('th');
    const dateHeaderText = document.createTextNode("Date");
    dateHeader.appendChild(dateHeaderText);
    entiresHeaderRow.appendChild(dateHeader);
    const entryHeader = document.createElement('th');
    const entryHeaderText = document.createTextNode("Entry");
    entryHeader.appendChild(entryHeaderText);
    entiresHeaderRow.appendChild(entryHeader);
    entriesThead.appendChild(entiresHeaderRow);
    entriesTable.appendChild(entriesThead);
    //table body
    const entiresBody = document.createElement('tbody');
    for (let i = 0; i < filteredResults.length; i++) {
        const entryRow = document.createElement('tr');
        const dateCell = document.createElement('td');
        const date = document.createTextNode(fixDate(filteredResults[i].date));
        dateCell.appendChild(date);
        entryRow.appendChild(dateCell);
        const entryCell = document.createElement('td');
        if (filteredResults[i].quantity > 0) {
            const entry = document.createTextNode(`${filteredResults[i].quantity} ${filteredResults[i].componentType} donated by ${filteredResults[i].context}`);
            entryCell.appendChild(entry);
        } else {
            const entry = document.createTextNode(`${filteredResults[i].quantity * -1} ${filteredResults[i].componentType} distributed to ${filteredResults[i].context}`);
            entryCell.appendChild(entry);
        }
        entryRow.appendChild(entryCell);
        entiresBody.appendChild(entryRow);
    }
    entriesTable.appendChild(entiresBody);
    return entriesTable;

}

function generateReport(startDate, endDate) {
    //Remove the error message if it exosts
    if (document.getElementById('errorMessageMainP')) {
        let errorMessageP = document.getElementById('errorMessageMainP');
        errorMessageP.remove();
    }
     
    let reportContainer = document.createElement('div');
    //Create inventory report h3 with date range
    let reportTitleH3 = document.createElement('h3');
    let reportTitle = document.createTextNode(`Inventory report for ${fixDate(startDate)} to ${fixDate(endDate)}`);
    reportTitleH3.appendChild(reportTitle);
    reportContainer.appendChild(reportTitleH3);
    //Create list of entries within date range
    let filteredResults = filterDateRange(startDate, endDate);
    //Generate donated and distributed totals within date range
    let entriesSummary = calculateInventoryTotals(filteredResults);
    //create table to summarize all entries
    const summaryTable = createSummaryTable(entriesSummary);
    reportContainer.appendChild(summaryTable);
    //Generate table for all entries in date range
    const entriesTable = createEntriesTable(filteredResults);
    reportContainer.appendChild(entriesTable);
    //Create button to generate new inventory report
    const formRow = document.createElement('div');
    formRow.setAttribute('class', 'form-row');
    const newReportButton = document.createElement('button')
    newReportButton.setAttribute('class', 'button-full');
    newReportButton.textContent = "Generate New Report";
    newReportButton.addEventListener('click', () => {
        reportContainer.remove();
        generateForm.style.display = 'block';
    });
    formRow.appendChild(newReportButton);
    reportContainer.appendChild(formRow);
    inventoryReportCard.appendChild(reportContainer);
}



function checkIfSignedIn() {
    if (!username) {
        manageInventoryButtons.remove();
        inventoryReportCard.remove();
    } else {
        //Generate form submit event listener
        generateForm.addEventListener('submit', function (event) {
            event.preventDefault();
            let isValidInputs = true;
            const generateFormData = new FormData(generateForm);
            let startDate = new Date(generateFormData.get('startDate'));
            let endDate = new Date(generateFormData.get('endDate'));
            console.log(`Start: ${startDate} - End: ${endDate}`);
            if (startDate > endDate) {
                isValidInputs = false;
            }
            if (isValidInputs) {
                generateReport(startDate, endDate);
                generateForm.reset();
                generateForm.style.display = 'none';
            } else {
                createErrorMessage("Please enter a valid date range", "main");
            }

        });
    }
}

checkIfSignedIn();
loadCurrentInventory();