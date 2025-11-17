import { addITemToTable, createTable, createMessage, clearMessages, closeModal, CheckInventoryForDistribution, displayLoadingMessage, populateComponteTypeSelect, trapFocus } from "./utils.js";
import { addDistributedEntryLog, getNextDistributedEntryId, getDistributedInventoryLog } from "./controller.js";
//Page Elements
const distributeInventoryModal = document.getElementById('distribute-inventory-modal');
const distributeInventoryBackdrop = document.getElementById('distribute-inventory-backdrop');
const previousEntriesCard = document.getElementById('previous-entries-card');
function loadPreviousEntries() {
    const distributedInventoryData = getDistributedInventoryLog();
    console.log(distributedInventoryData.length);
    /*Temporary solution to clear the card when form submit. Will update submitData() to
    add the row to the table instead of calling this function ad recreating the entire table */
    const noEntriesP = previousEntriesCard.querySelector('p');
    if (noEntriesP)
        noEntriesP.remove();
    const previousTable = document.getElementById('previous-entries-table');
    if (previousTable)
        previousTable.remove();
    /* End of temporary solution */
    //Display loading message
    const loadingDiv = displayLoadingMessage();
    previousEntriesCard.appendChild(loadingDiv);
    if (distributedInventoryData.length === 0) {
        //Display no previous entries message
        let noEntriesP = document.createElement('p');
        let noEntries = document.createTextNode("No previous entries");
        noEntriesP.appendChild(noEntries);
        loadingDiv.remove();
        previousEntriesCard.appendChild(noEntriesP);
    }
    else {
        //Create the previous entries table
        const tableColumnHeaders = ['Date', 'Component', 'Quantity', 'Destination', 'Delete'];
        const previousEntriesTable = createTable('previous-entries-table', tableColumnHeaders);
        let tableBody = distributedInventoryData.reduceRight((acc, currentItem) => {
            const newRow = addITemToTable(currentItem, 5, "distributedEntry", 'shortDate');
            acc.appendChild(newRow);
            return acc;
        }, document.createElement('tbody'));
        previousEntriesTable.appendChild(tableBody);
        loadingDiv.remove();
        previousEntriesCard.appendChild(previousEntriesTable);
    }
}
function submitData() {
    //Get the data from the form
    const distributedFormData = new FormData(distributeInventoryModal);
    //Create an object for the entry
    let newEntry = {
        entryId: 0,
        entryDate: new Date(),
        componentType: "",
        quantity: 0,
        destination: ""
    };
    //Get the next entryId. This shouldn't be needed when proper data storage is implemented
    newEntry['entryId'] = getNextDistributedEntryId();
    //Validate date input
    const dateValue = distributedFormData.get('date');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date the components are leaving", "distribute-modal-message", "error");
        return;
    }
    else {
        newEntry['entryDate'] = new Date(dateValue.toString());
    }
    //Validate component type selected input
    const componentTypeValue = distributedFormData.get('componentType');
    if (componentTypeValue === null || componentTypeValue.toString().trim() === '') {
        createMessage("Please select what component you are distributing", "distribute-modal-message", "error");
        return;
    }
    else {
        newEntry['componentType'] = componentTypeValue.toString();
    }
    //Validate quantity input
    const quantityValue = distributedFormData.get('quantity');
    if (quantityValue === null) {
        createMessage("Please enter the quantity of the components being distributed", "distribute-modal-message", "error");
        return;
    }
    else {
        const quantity = +quantityValue;
        const checkInventory = CheckInventoryForDistribution(newEntry['componentType'], quantity);
        if (quantity < 1) {
            createMessage("Please enter a quantity greater that 0", "distribute-modal-message", "error");
            return;
        }
        else if (!checkInventory.hasEnough) {
            createMessage(`Error: There are only ${checkInventory.quantity} ${newEntry['componentType']} currently in inventory`, "distribute-modal-message", "error");
            return;
        }
        else {
            newEntry['quantity'] = quantity;
        }
    }
    //Validate destination input
    const destinationValue = distributedFormData.get('destination');
    if (destinationValue === null || destinationValue.toString().trim() === '') {
        createMessage("Please enter the destination", "distribute-modal-message", "error");
        return;
    }
    else {
        newEntry['destination'] = destinationValue.toString();
    }
    //Submit the entry
    addDistributedEntryLog(newEntry);
    closeModal('distribute-inventory-backdrop');
    createMessage("The inventory has successfully been updated", "main-message", "check_circle");
    loadPreviousEntries();
}
//Event listener for distribute inventory form submit
distributeInventoryModal.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});
//Event listener to open the distribute inventory modal
const openModalButton = document.getElementById('open-distribute-modal-button');
openModalButton.addEventListener('click', () => {
    populateComponteTypeSelect('componentType');
    distributeInventoryBackdrop.style.display = 'flex';
    distributeInventoryModal.setAttribute('aria-modal', 'true');
    const dateInput = document.getElementById('date');
    dateInput.focus();
    trapFocus(distributeInventoryModal, distributeInventoryBackdrop);
});
//Event listener to close the distribute inventory modal
const closeModalButton = document.getElementById('cancel');
closeModalButton.addEventListener('click', () => closeModal('distribute-inventory-backdrop'));
loadPreviousEntries();
