const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const incomingInventoryLocalStorage = localStorage.getItem("incomingInventory");
let incomingInventoryData = JSON.parse(incomingInventoryLocalStorage);
const outgoingInventoryLocalStorage = localStorage.getItem("outgoingInventory");
let outgoingInventoryData = JSON.parse(outgoingInventoryLocalStorage);

//page elements
const errorMessage = document.getElementById('error');
const currentInventoryTableBody = document.getElementById('current-inventory-body');
const manageInventoryButtons = document.getElementById('manage-inventory');
const inventoryReportCard = document.getElementById('inventory-report-card');
const generateForm = document.getElementById('generate-form');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const generateButton = document.getElementById('generate-button');



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
    } else {
        console.log(`tableName param not right: ${tableName}`);
    }
}

function loadCurrentInventory() {
    for (let i = 0; i < currentInventoryData.length; i++) {
        addItemToTable(currentInventoryData[i], "currentInventory");
    }
}

function filterDateRange(startDate, endDate) {
    let filteredIncoming = incomingInventoryData.filter(item => startDate <= new Date(item.date) <= endDate);
    let filteredOutgoing = outgoingInventoryData.filter(item => startDate <= new Date(item.date) <= endDate);
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
    return filteredResults;
}

function calculateInventoryTotals(filteredArray) {
    let uniqueComponents = [];
    for (let i=0; i<currentInventoryData.length; i++) {
        let currentComponent = {
            "componentType": currentInventoryData[i].componentType,
            "quantityDonated": 0,
            "quantityDistributed": 0
        }
        for (let i=0; i<filteredArray.length; i++) {
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
    const summaryBodyRow = document.createElement('tr');
    const donatedCell = document.createElement('td');
    const distributedCell = document.createElement('td');
    const newLineTag = document.createElement('br');
    for (let i=0; i<entriesSummary.length; i++) {
        let donatedLine = document.createTextNode(`${entriesSummary[i].componentType}: ${entriesSummary[i].quantityDonated}`);
        donatedCell.appendChild(donatedLine);
        donatedCell.appendChild(newLineTag);
        let distributedLine = document.createTextNode(`${entriesSummary[i].componentType}: ${entriesSummary[i].quantityDistributed}`);
        distributedCell.appendChild(distributedLine);
        distributedCell.appendChild(newLineTag);
    }
    summaryBodyRow.appendChild(donatedCell);
    summaryBodyRow.appendChild(distributedCell);
    summaryBody.appendChild(summaryBodyRow);
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
    for (let i=0; i<filteredResults.length; i++) {
        const entryRow = document.createElement('tr');
        const dateCell = document.createElement('td');
        const date = document.createTextNode(filteredResults[i].date);
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

function generateReport() {
    let reportContainer = document.createElement('div');
    //Create inventory report h3 with date range
    /* I learned how to fix the date being off by one from these
    stackOverflow threads: https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off
    and https://stackoverflow.com/questions/2035699/how-to-convert-a-full-date-to-a-short-date-in-javascript */
    let startDate = new Date(startDateInput.value);
    let startDateTimezoneFixed = new Date(startDate.getTime() - startDate.getTimezoneOffset() * -60000);
    let startDateFormatted = startDateTimezoneFixed.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    let endDate = new Date(endDateInput.value);
    let endDateTimezoneFixed = new Date(endDate.getTime() - endDate.getTimezoneOffset() * -60000);
    let endDateFormatted = endDateTimezoneFixed.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    let reportTitleH3 = document.createElement('h3');
    let reportTitle = document.createTextNode(`Inventory report for ${startDateFormatted} to ${endDateFormatted}`);
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

//check to see if the user is signed in, if not remove links to manage inventory and generate reports
let localStorageUser = localStorage.getItem("username");
if (!localStorageUser) {
    manageInventoryButtons.remove();
    inventoryReportCard.remove();
}

loadCurrentInventory();

generateButton.addEventListener('click', function (event) {
    event.preventDefault();
    generateReport();
    generateForm.reset();
    generateForm.style.display = 'none';
});