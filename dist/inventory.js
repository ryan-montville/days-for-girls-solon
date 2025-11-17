import { createTable, createMessage, clearMessages, closeModal, fixDate, trapFocus } from "./utils.js";
import { addComponentTypeToInventory, getCurrentInventory, getDistributedInventoryLog, getDoantedInventoryLog, getNextCurrentInventoryId } from "./controller.js";
//Page elements
const generateForm = document.getElementById('generateForm');
const mainContent = document.getElementById('maincontent');
const currentInventoryCard = document.getElementById('current-inventory-card');
const manageInventoryBackdrop = document.getElementById('manage-inventory-backdrop');
const manageInventoryModal = document.getElementById('manage-inventory-modal');
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
    const currrentInventoryArray = getCurrentInventory();
    if (currrentInventoryArray.length === 0) {
        //Display no inventory message
        const noInventoryP = document.createElement('p');
        const noInventory = document.createTextNode("There are not items currently in the inventory.");
        noInventoryP.appendChild(noInventory);
        currentInventoryCard.appendChild(noInventoryP);
    }
    else {
        //Temporary message about deleting items
        const comingSoonP = document.createElement('p');
        const comingSoon = document.createTextNode('*NOTE: The ability to delete comonent items from the inventory is coming soon.*');
        comingSoonP.appendChild(comingSoon);
        currentInventoryCard.appendChild(comingSoonP);
        //Create the current inventory table
        const tableColumnHeaders = ['Component', 'Quantity', 'Delete'];
        const currentInventoryTable = createTable('current-inventory-table', tableColumnHeaders);
        const tableBody = currrentInventoryArray.reduce((acc, currentComponent) => {
            //Ability to delete Components from inventory coming soon
            /* This function will turn into the addITemToTable() once the logic is updated to remove components and
            all their log entries */
            const newComponent = addComponentToTable(currentComponent);
            acc.appendChild(newComponent);
            return acc;
        }, document.createElement('tbody'));
        currentInventoryTable.appendChild(tableBody);
        currentInventoryCard.appendChild(currentInventoryTable);
    }
}
function filterDateRange(startDate, endDate) {
    const donatedEntryLog = getDoantedInventoryLog();
    const distribtedInventoryLog = getDistributedInventoryLog();
    //Combine all donated and distributed entries into a single array
    let allEntries = donatedEntryLog.concat(distribtedInventoryLog);
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
//Takes an array of inventory log entries and summarizes the array
function calculateInventoryTotals(filteredArray) {
    const currrentInventoryArray = getCurrentInventory();
    const uniqueComponents = currrentInventoryArray.reduce((acc, currentComponent) => {
        const newComponent = {
            "componentType": currentComponent['componentType'],
            "quantityDonated": 0,
            "quantityDistributed": 0
        };
        const currentComponentEntries = filteredArray.filter(item => item['componentType'] === newComponent['componentType']);
        currentComponentEntries.forEach(entry => {
            if (entry['whoDonated']) {
                newComponent['quantityDonated'] += entry['quantity'];
            }
            else {
                newComponent['quantityDistributed'] += entry['quantity'];
            }
        });
        acc.push(newComponent);
        return acc;
    }, []);
    return uniqueComponents;
}
function createSummaryTable(entriesSummary) {
    //Create the table
    const summaryTable = createTable('summary-table', ['Total Donated', 'Total Distributed']);
    //table body
    const summaryBody = entriesSummary.reduce((acc, currentItem) => {
        let newRow = document.createElement('tr');
        let donatedCell = document.createElement('td');
        let donated = document.createTextNode(`${currentItem['componentType']}: ${currentItem['quantityDonated']}`);
        donatedCell.appendChild(donated);
        newRow.appendChild(donatedCell);
        let distributedCell = document.createElement('td');
        let distributed = document.createTextNode(`${currentItem['componentType']}: ${currentItem['quantityDistributed']}`);
        distributedCell.appendChild(distributed);
        newRow.appendChild(distributedCell);
        acc.appendChild(newRow);
        return acc;
    }, document.createElement('tbody'));
    summaryTable.appendChild(summaryBody);
    return summaryTable;
}
function createEntriesTable(filteredResults) {
    //Create the table
    const entriesTable = createTable('entries-table', ['Date', 'Entry']);
    //table body
    const entiresBody = filteredResults.reduce((acc, currentEntry) => {
        const entryRow = document.createElement('tr');
        const dateCell = document.createElement('td');
        const date = document.createTextNode(fixDate(currentEntry['entryDate'].toString(), 'shortDate'));
        dateCell.appendChild(date);
        entryRow.appendChild(dateCell);
        const entryCell = document.createElement('td');
        if (currentEntry['whoDonated']) {
            const entryText = document.createTextNode(`${currentEntry['quantity']} ${currentEntry['componentType']} donated by ${currentEntry['whoDonated']}`);
            entryCell.appendChild(entryText);
        }
        else {
            const entryText = document.createTextNode(`${currentEntry['quantity']} ${currentEntry['componentType']} distributed to ${currentEntry['destination']}`);
            entryCell.appendChild(entryText);
        }
        entryRow.appendChild(entryCell);
        acc.appendChild(entryRow);
        return acc;
    }, document.createElement('tbody'));
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
function addNewComponentType(formData) {
    const newComponentName = formData.get('nameInput');
    if (newComponentName === null || newComponentName.toString().trim() === '') {
        createMessage("Please enter the name of the new component type", "manage-inventory-message", "error");
        return;
    }
    else {
        const newComponent = {
            componentId: getNextCurrentInventoryId(),
            componentType: newComponentName.toString().trim(),
            quantity: 0
        };
        addComponentTypeToInventory(newComponent);
        createMessage(`Added '${newComponent['componentType']}' to inventory`, "main-message", "check_circle");
        //Update current inventory table
        closeModal('manage-inventory-backdrop');
    }
}
//Event listener for button to open Manage Inventory Modal
const openMangeInventoryButton = document.getElementById('add-new-type');
openMangeInventoryButton.addEventListener('click', () => {
    manageInventoryModal.innerHTML = '';
    //Create the form to add a new component type
    const addNewComponentTypeForm = document.createElement('form');
    const formHeaderH2 = document.createElement('h2');
    const formHeader = document.createTextNode("Add a New Component Type");
    formHeaderH2.appendChild(formHeader);
    addNewComponentTypeForm.appendChild(formHeaderH2);
    const nameInputRow = document.createElement('section');
    nameInputRow.setAttribute('class', 'form-row');
    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'nameInput');
    const nameText = document.createTextNode("Name of new component type:");
    nameLabel.appendChild(nameText);
    nameInputRow.appendChild(nameLabel);
    const nameInput = document.createElement("input");
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('id', 'nameInput');
    nameInput.setAttribute('name', 'nameInput');
    nameInputRow.appendChild(nameInput);
    addNewComponentTypeForm.appendChild(nameInputRow);
    const buttonRow = document.createElement('section');
    buttonRow.setAttribute('class', 'form-row');
    const cancelButton = document.createElement('button');
    cancelButton.setAttribute('type', 'button');
    cancelButton.setAttribute('class', 'secondary');
    const cancelText = document.createTextNode("Cancel");
    cancelButton.appendChild(cancelText);
    cancelButton.addEventListener('click', () => {
        //Close the modal
        closeModal('manage-inventory-backdrop');
    });
    buttonRow.appendChild(cancelButton);
    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('class', 'primary');
    const submitText = document.createTextNode("Submit");
    submitButton.appendChild(submitText);
    buttonRow.appendChild(submitButton);
    addNewComponentTypeForm.appendChild(buttonRow);
    addNewComponentTypeForm.addEventListener('submit', (e) => {
        clearMessages();
        e.preventDefault();
        const data = new FormData(addNewComponentTypeForm);
        addNewComponentType(data);
    });
    //Add the form to the modal
    manageInventoryModal.appendChild(addNewComponentTypeForm);
    //Open the modal
    manageInventoryBackdrop.style.display = 'flex';
    manageInventoryModal.classList.add('opening');
    manageInventoryModal.setAttribute('aria-modal', 'true');
    //Trap keyboard focus to modal form
    nameInput.focus();
    trapFocus(addNewComponentTypeForm, manageInventoryBackdrop);
});
