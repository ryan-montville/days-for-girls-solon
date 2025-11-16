import { addITemToTable, createTable, createMessage, clearMessages, closeModal, displayLoadingMessage, 
    populateComponteTypeSelect, trapFocus, updateItemTotal, updateLocalStorage } from "./utils.js";
import { ComponentItem, InventoryEntry } from "./models.js";

//Get data from local storage
const donateInventoryLocalStorage = localStorage.getItem('donatedInventory') as string;
let donateInventoryData: InventoryEntry[] = JSON.parse(donateInventoryLocalStorage);
const addInventoryModalBackdrop = document.getElementById('add-inventory-backdrop') as HTMLElement;
const addInventoryModal = document.getElementById('add-inventory-modal') as HTMLFormElement;
const previousEntriesCard = document.getElementById('previous-entries-card') as HTMLElement;

function loadPreviousEntries() {
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
            const newRow = addITemToTable(currentItem, 5, "distributedInventory", 'shortDate');
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
    newEntry['entryId'] = donateInventoryData[donateInventoryData.length - 1]['entryId'] + 1;
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
    //Add the new entry to the array
    donateInventoryData.push(newEntry);
    //Update current inventory count for component
    updateItemTotal(newEntry, "updateCounts");
    //Update local storage. Will change 
    updateLocalStorage("donatedInventory", donateInventoryData);
    //Close the modal
    closeModal('add-inventory-backdrop');
    //Clear the form
    addInventoryModal.reset();
    createMessage("The inventory has successfully been updated", "main-message", "check_circle");
    loadPreviousEntries();
}

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