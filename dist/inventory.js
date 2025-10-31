import { addITemToTable, createMessage, clearMessages, fixDate } from "./utils.js";
const currentInventoryLocalStorage = localStorage.getItem("currentInventory");
let currentInventoryData = JSON.parse(currentInventoryLocalStorage);
const donatedInventoryLocalStorage = localStorage.getItem("donatedInventory");
let donatedInventoryData = JSON.parse(donatedInventoryLocalStorage);
const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory");
let distributedInventoryData = JSON.parse(distributedInventoryLocalStorage);
//Page elements
let generateForm = document.getElementById('generateForm');
let mainContent = document.getElementById('maincontent');
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
    }
    currentInventoryData.forEach(item => {
        let componentRow = addComponentToTable(item);
        tableBody.appendChild(componentRow);
    });
}
function filterDateRange(startDate, endDate) {
    //Combine all donated and distributed entries into a single array
    let allEntries = donatedInventoryData.concat(distributedInventoryData);
    //Filter allEntries array for entries within date range
    let filteredEntries = allEntries.filter(item => {
        return new Date(item['entryDate']) >= startDate && new Date(item['entryDate']) <= endDate;
    });
    //Sort filteredEntries array by date
    let filteredEntriesSorted = filteredEntries.sort((a, b) => {
        return new Date(a['entryDate']).getTime() - new Date(b['entryDate']).getTime();
    });
    return filteredEntriesSorted;
}
function calculateInventoryTotals(filteredArray) {
    let uniqueComponents = [];
    for (let i = 0; i < currentInventoryData.length; i++) {
        let currentComponent = {
            "componentType": currentInventoryData[i]['componentType'],
            "quantityDonated": 0,
            "quantityDistributed": 0
        };
        for (let i = 0; i < filteredArray.length; i++) {
            let currentEntry = filteredArray[i];
            if (currentEntry['componentType'] === currentComponent['componentType']) {
                if (currentEntry['whoDonated']) {
                    currentComponent['quantityDonated'] += currentEntry['quantity'];
                }
                else {
                    currentComponent['quantityDistributed'] += (currentEntry['quantity']);
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
    const distributedHeaderText = document.createTextNode("Total Distributed");
    distributedHeader.appendChild(distributedHeaderText);
    summaryHeaderRow.appendChild(distributedHeader);
    summaryThead.appendChild(summaryHeaderRow);
    summaryTable.appendChild(summaryThead);
    //table body
    const summaryBody = document.createElement('tbody');
    entriesSummary.forEach((summary) => {
        let newRow = document.createElement('tr');
        let donatedCell = document.createElement('td');
        let donated = document.createTextNode(`${summary['componentType']}: ${summary['quantityDonated']}`);
        donatedCell.appendChild(donated);
        newRow.appendChild(donatedCell);
        let distributedCell = document.createElement('td');
        let distributed = document.createTextNode(`${summary['componentType']}: ${summary['quantityDistributed']}`);
        distributedCell.appendChild(distributed);
        newRow.appendChild(distributedCell);
        summaryBody.appendChild(newRow);
    });
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
    filteredResults.forEach(entryItem => {
        const entryRow = document.createElement('tr');
        const dateCell = document.createElement('td');
        const date = document.createTextNode(fixDate(entryItem['entryDate'].toString(), 'shortDate'));
        dateCell.appendChild(date);
        entryRow.appendChild(dateCell);
        const entryCell = document.createElement('td');
        if (entryItem['whoDonated']) {
            const entryText = document.createTextNode(`${entryItem['quantity']} ${entryItem['componentType']} donated by ${entryItem['whoDonated']}`);
            entryCell.appendChild(entryText);
        }
        else {
            const entryText = document.createTextNode(`${entryItem['quantity']} ${entryItem['componentType']} distributed to ${entryItem['destination']}`);
            entryCell.appendChild(entryText);
        }
        entryRow.appendChild(entryCell);
        entiresBody.appendChild(entryRow);
    });
    entriesTable.appendChild(entiresBody);
    return entriesTable;
}
function generateReport() {
    let formData = new FormData(generateForm);
    let startDateValue = formData.get('startDate');
    let endDateValue = formData.get('endDate');
    //Validate date range
    if (startDateValue && endDateValue) {
        if (new Date(startDateValue.toString()) > new Date(endDateValue.toString())) {
            //Checking that the end date is a later date than the start date
            createMessage("Please make sure the end date is a later date than the start date", "main-message", "error");
            return;
        }
    }
    else if (!startDateValue && !endDateValue) {
        //Checking if both date inputs are not filled in
        createMessage("Please select start and end dates", "main-message", "error");
        return;
    }
    else if (!startDateValue && endDateValue) {
        //Checking if only the start date is not filled in
        createMessage("Please select a start date", "main-message", "error");
        return;
    }
    else if (startDateValue && !endDateValue) {
        //Checking if only the end date is not filled in
        createMessage("Please select an end date", "main-message", "error");
        return;
    }
    //Hide the form
    generateForm.style.display = 'none';
    //Create the report card element
    if (startDateValue && endDateValue) {
        let startDate = new Date(startDateValue.toString());
        let endDate = new Date(endDateValue.toString());
        let reportCard = document.createElement('article');
        reportCard.setAttribute('class', 'card');
        //Create list of entries within date range
        let filteredResults = filterDateRange(startDate, endDate);
        if (filteredResults.length === 0) {
            //No results
            let noResultsH2 = document.createElement('h2');
            let noResults = document.createTextNode("No results");
            noResultsH2.appendChild(noResults);
            reportCard.appendChild(noResultsH2);
            let noResultsP = document.createElement('p');
            let noresultsText = document.createTextNode(`No items where donated or distributed ${fixDate(startDateValue.toString(), 'shortDate')} to ${fixDate(endDateValue.toString(), 'shortDate')}`);
            noResultsP.appendChild(noresultsText);
            reportCard.appendChild(noResultsP);
        }
        else {
            let reportH2 = document.createElement('h2');
            let reportTitle = document.createTextNode(`${fixDate(startDateValue.toString(), 'shortDate')} to ${fixDate(endDateValue.toString(), 'shortDate')} Report`);
            reportH2.appendChild(reportTitle);
            reportCard.appendChild(reportH2);
            //Generate donated and distributed totals within date range
            let entriesSummary = calculateInventoryTotals(filteredResults);
            //create table to summarize all entries
            const summaryTable = createSummaryTable(entriesSummary);
            reportCard.appendChild(summaryTable);
            //Generate table for all entries in date range
            const entriesTable = createEntriesTable(filteredResults);
            reportCard.appendChild(entriesTable);
        }
        //Create button to generate new inventory report
        const formRow = document.createElement('div');
        formRow.setAttribute('class', 'form-row');
        const newReportButton = document.createElement('button');
        newReportButton.setAttribute('class', 'primary full');
        newReportButton.textContent = "Generate New Report";
        newReportButton.addEventListener('click', () => {
            reportCard.remove();
            generateForm.style.display = 'block';
        });
        formRow.appendChild(newReportButton);
        reportCard.appendChild(formRow);
        mainContent.appendChild(reportCard);
    }
}
//Maybe add check if logged in, else remove report card
loadCurrentInventory();
generateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    generateReport();
});
