import {
    createTableRow, createTable, createMessage, createDeleteModal, clearMessages, closeModal, displayLoadingMessage,
    fixDate, populateComponteTypeSelect, trapFocus
} from "./utils.js";
import { addDonatedEntryLog, deleteDonatedEntry, getDoantedInventoryLog, getNextDonatedEntryId } from "./controller.js";
import { initializeApp } from "./app.js";
import { InventoryEntry } from "./models.js";

//Page Elements
const addInventoryModalBackdrop = document.getElementById('add-inventory-backdrop') as HTMLElement;
const addInventoryModal = document.getElementById('add-inventory-modal') as HTMLFormElement;
const previousEntriesCard = document.getElementById('previous-entries-card') as HTMLElement;

function addNewRow(newEntry: InventoryEntry) {
    //Create a new row for the table with the entry details
    const newRow = createTableRow(newEntry, 5, "donatedEntry", 'shortDate');
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
                        deleteDonatedEntry(newEntry['entryId']);
                        //Close the delete modal
                        closeModal('delete-item-backdrop');
                        //Create a message saying the log entry has been deleted
                        createMessage(`Deleted entry ${fixDate(newEntry['entryDate'].toString(), 'shortDate')}: ${newEntry['quantity']} ${newEntry['componentType']} from ${newEntry['whoDonated']}`, "main-message", "delete");
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
    const donateInventoryData: InventoryEntry[] = getDoantedInventoryLog();
    /*Temporary solution to clear the card when form submit. Will update submitData() to 
    add the row to the table instead of calling this function ad recreating the entire table */
    const noEntriesP = previousEntriesCard.querySelector('p');
    if (noEntriesP) noEntriesP.remove();
    const previousTable = document.getElementById('previous-entries-table');
    if (previousTable) previousTable.remove();
    /* End of temporary solution */
    //Display loading message
    const loadingDiv = displayLoadingMessage();
    if (donateInventoryData.length === 0) {
        let noEntriesP = document.createElement('p');
        let noEntries = document.createTextNode("No previous entries");
        noEntriesP.appendChild(noEntries);
        loadingDiv.remove();
        previousEntriesCard.appendChild(noEntriesP);
    } else {
        const tableColumnHeaders: string[] = ['Date', 'Component', 'Quantity', 'Destination', 'Delete']
        const previousEntriesTable = createTable('previous-entries-table', tableColumnHeaders);
        let tableBody = donateInventoryData.reduceRight((acc: HTMLElement, currentItem: InventoryEntry) => {
            const newRow = addNewRow(currentItem);
            acc.appendChild(newRow);
            return acc;
        }, document.createElement('tbody'));
        tableBody.setAttribute('id', 'donatedTableBody');
        previousEntriesTable.appendChild(tableBody);
        loadingDiv.remove();
        previousEntriesCard.appendChild(previousEntriesTable);
    }
}

function submitData() {
    //Get the data from the form
    const donatedFormData: FormData = new FormData(addInventoryModal);
    //Create an object for the entry
    let newEntry = {
        entryId: 0,
        entryDate: new Date(),
        componentType: "",
        quantity: 0,
        whoDonated: ""
    }
    //Get the next entryId. This shouldn't be needed when proper data storage is implemented
    newEntry['entryId'] = getNextDonatedEntryId();
    //Validate date input
    const dateValue = donatedFormData.get('date');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date the components were donated", "donate-modal-message", "error");
        return;
    } else {
        newEntry['entryDate'] = new Date(dateValue.toString());
    }
    //Validate component type selected input
    const componentTypeValue = donatedFormData.get('componentType');
    if (componentTypeValue === null || componentTypeValue.toString().trim() === '') {
        createMessage("Please select what component you are donating", "donate-modal-message", "error");
        return;
    } else {
        newEntry['componentType'] = componentTypeValue.toString()
    }
    //Validate quantity input
    const quantityValue = donatedFormData.get('quantity');
    if (quantityValue === null) {
        createMessage("Please enter the quantity of the components being donated", "donate-modal-message", "error");
        return;
    } else {
        const quantity: number = +quantityValue;
        if (quantity < 1) {
            createMessage("Please enter a quantity greater that 0", "donate-modal-message", "error");
            return;
        } else {
            newEntry['quantity'] = quantity;
        }
    }
    //Validate who donated input
    const whoDonatedValue = donatedFormData.get('whoDonated');
    if (whoDonatedValue === null || whoDonatedValue.toString().trim() === '') {
        createMessage("Please enter who donated the components", "donate-modal-message", "error");
        return;
    } else {
        newEntry['whoDonated'] = whoDonatedValue.toString();
    }
    //Submit the entry
    addDonatedEntryLog(newEntry);
    //Close the modal
    closeModal('add-inventory-backdrop');
    //Clear the form
    addInventoryModal.reset();
    createMessage("The inventory has successfully been updated", "main-message", "check_circle");
    //Get the donated log table body
    const donatedTableBody = document.getElementById('donatedTableBody');
    if (donatedTableBody) {
        //If the table body exists, add the new row to the top of the table
        const newRow = addNewRow(newEntry);
        donatedTableBody.prepend(newRow);
    } else {
        //If the table body does not exist, create/load the table
        loadPreviousEntries();
    }
}

initializeApp('Inventory', 'Donated Inventory');

//Event listener for add inventory form submit
addInventoryModal.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});

//Event listener to open the add inventory modal
const addInventoryButton = document.getElementById('add-inventory-button') as HTMLElement;
addInventoryButton.addEventListener('click', () => {
    populateComponteTypeSelect('componentType');
    addInventoryModalBackdrop.style.display = 'flex';
    addInventoryModal.setAttribute('aria-modal', 'true');
    const dateInput = document.getElementById('date') as HTMLInputElement;
    dateInput.focus();
    trapFocus(addInventoryModal, addInventoryModalBackdrop);
});

//Event listener to close the add inventory modal
const closeModalButton = document.getElementById('cancel') as HTMLElement;
closeModalButton.addEventListener('click', () => {
    closeModal('add-inventory-backdrop');
});


loadPreviousEntries();