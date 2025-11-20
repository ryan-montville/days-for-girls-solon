import {
    createTableRow, createTable, createMessage, createDeleteModal, clearMessages, closeModal,
    displayLoadingMessage, fixDate, populateComponteTypeSelect, trapFocus
} from "./utils.js";
import {
    addDistributedEntryLog, CheckInventoryForDistribution, deleteDistributedEntry,
    getNextDistributedEntryId, getDistributedInventoryLog
} from "./controller.js";
import { initializeApp } from "./app.js";
import { InventoryEntry } from "./models.js";

//Page Elements
const distributeInventoryModal = document.getElementById('distribute-inventory-modal') as HTMLFormElement;
const distributeInventoryBackdrop = document.getElementById('distribute-inventory-backdrop') as HTMLElement;
const previousEntriesCard = document.getElementById('previous-entries-card') as HTMLElement;

function addNewRow(newEntry: InventoryEntry) {
    //Create a new row for the table with the entry details
    const newRow = createTableRow(newEntry, 5, "distributedEntry", 'shortDate');
    //Add an event Listner to the entry's delete button
    const deleteButton = newRow.querySelector("button");
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            //Create/open the modal and get the button row to add event lsiteners
            const buttonRow = createDeleteModal(newEntry, `Are you sure you want to delete this entry?`);
            if (buttonRow) {
                const noButton = buttonRow.children[0];
                const yesButton = buttonRow.children[1];
                if (yesButton) {
                    yesButton.addEventListener('click', () => {
                        //Delete the log entry
                        deleteDistributedEntry(newEntry['entryId']);
                        //Close the delete modal
                        closeModal('delete-item-backdrop');
                        //Create a message saying the log entry has been deleted
                        createMessage(`Deleted entry ${fixDate(newEntry['entryDate'].toString(), 'shortDate')}: ${newEntry['quantity']} ${newEntry['componentType']} to ${newEntry['destination']}`, "main-message", "delete");
                        //Remove the entry from the table
                        newRow.remove();
                    });
                }
                if (noButton) {
                    noButton.addEventListener('click', () => {
                        closeModal('delete-item-backdrop');
                    });
                }
            }
        });
    }
    return newRow;
}

function loadPreviousEntries() {
    const distributedInventoryData: InventoryEntry[] = getDistributedInventoryLog();
    /*Temporary solution to clear the card when form submit. Will update submitData() to 
    add the row to the table instead of calling this function ad recreating the entire table */
    const noEntriesP = previousEntriesCard.querySelector('p');
    if (noEntriesP) noEntriesP.remove();
    const previousTable = document.getElementById('previous-entries-table');
    if (previousTable) previousTable.remove();
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
    } else {
        //Create the previous entries table
        const tableColumnHeaders: string[] = ['Date', 'Component', 'Quantity', 'Destination', 'Delete']
        const previousEntriesTable = createTable('previous-entries-table', tableColumnHeaders);
        let tableBody = distributedInventoryData.reduceRight((acc: HTMLElement, currentItem: InventoryEntry) => {
            //Create a row for the current item
            const newRow = addNewRow(currentItem)
            acc.appendChild(newRow);
            return acc;
        }, document.createElement('tbody'));
        tableBody.setAttribute('id', 'distributedTableBody');
        previousEntriesTable.appendChild(tableBody);
        loadingDiv.remove();
        previousEntriesCard.appendChild(previousEntriesTable);
    }
}

function submitData() {
    //Get the data from the form
    const distributedFormData: FormData = new FormData(distributeInventoryModal);
    //Create an object for the entry
    let newEntry: InventoryEntry = {
        entryId: 0,
        entryDate: new Date(),
        componentType: "",
        quantity: 0,
        destination: ""
    }
    //Get the next entryId. This shouldn't be needed when proper data storage is implemented
    newEntry['entryId'] = getNextDistributedEntryId();
    //Validate date input
    const dateValue = distributedFormData.get('date');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date the components are leaving", "distribute-modal-message", "error");
        return;
    } else {
        newEntry['entryDate'] = new Date(dateValue.toString());
    }
    //Validate component type selected input
    const componentTypeValue = distributedFormData.get('componentType');
    if (componentTypeValue === null || componentTypeValue.toString().trim() === '') {
        createMessage("Please select what component you are distributing", "distribute-modal-message", "error");
        return;
    } else {
        newEntry['componentType'] = componentTypeValue.toString()
    }

    //Validate quantity input
    const quantityValue = distributedFormData.get('quantity');
    if (quantityValue === null) {
        createMessage("Please enter the quantity of the components being distributed", "distribute-modal-message", "error");
        return;
    } else {
        const quantity: number = +quantityValue;
        const checkInventory = CheckInventoryForDistribution(newEntry['componentType'], quantity);
        if (quantity < 1) {
            createMessage("Please enter a quantity greater that 0", "distribute-modal-message", "error");
            return;
        } else if (!checkInventory.hasEnough) {
            createMessage(`Error: There are only ${checkInventory.quantity} ${newEntry['componentType']} currently in inventory`, "distribute-modal-message", "error");
            return;
        } else {
            newEntry['quantity'] = quantity;
        }
    }
    //Validate destination input
    const destinationValue = distributedFormData.get('destination');
    if (destinationValue === null || destinationValue.toString().trim() === '') {
        createMessage("Please enter the destination", "distribute-modal-message", "error");
        return;
    } else {
        newEntry['destination'] = destinationValue.toString();
    }
    //Submit the entry
    addDistributedEntryLog(newEntry);
    closeModal('distribute-inventory-backdrop');
    createMessage("The inventory has successfully been updated", "main-message", "check_circle");
    //Get the distributed log table body
    const distributedTableBody = document.getElementById('distributedTableBody');
    if (distributedTableBody) {
        //If the table body exists, add the new row to the top of the table
        const newRow = addNewRow(newEntry);
        distributedTableBody.prepend(newRow);
    } else {
        //If the table body does not exist, create/load the table
        loadPreviousEntries();
    }

}

initializeApp('Inventory', 'Distributed Inventory');

//Event listener for distribute inventory form submit
distributeInventoryModal.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});

//Event listener to open the distribute inventory modal
const openModalButton = document.getElementById('open-distribute-modal-button') as HTMLElement;
openModalButton.addEventListener('click', () => {
    populateComponteTypeSelect('componentType');
    distributeInventoryBackdrop.style.display = 'flex';
    distributeInventoryModal.setAttribute('aria-modal', 'true');
    const dateInput = document.getElementById('date') as HTMLInputElement;
    dateInput.focus();
    trapFocus(distributeInventoryModal, distributeInventoryBackdrop);
});

//Event listener to close the distribute inventory modal
const closeModalButton = document.getElementById('cancel') as HTMLElement;
closeModalButton.addEventListener('click', () => closeModal('distribute-inventory-backdrop'));

loadPreviousEntries();