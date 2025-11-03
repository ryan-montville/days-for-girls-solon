import { addITemToTable, createMessage, clearMessages, closeModal, trapFocus, updateItemTotal, updateLocalStorage } from "./utils.js";
//Get data from local storage
const donateInventoryLocalStorage = localStorage.getItem('donatedInventory');
let donateInventoryData = JSON.parse(donateInventoryLocalStorage);
const addInventoryModalBackdrop = document.getElementById('add-inventory-backdrop');
const addInventoryModal = document.getElementById('add-inventory-modal');
function submitData() {
    //Get the data from the form
    const donatedFormData = new FormData(addInventoryModal);
    //Create an object for the entry
    let newEntry = {
        entryId: 0,
        entryDate: new Date(),
        componentType: "",
        quantity: 0,
        whoDonated: ""
    };
    //Get the next entryId. This shouldn't be needed when proper data storage is implemented
    newEntry['entryId'] = donateInventoryData[donateInventoryData.length - 1]['entryId'] + 1;
    //Validate date input
    const dateValue = donatedFormData.get('date');
    if (dateValue === null || dateValue === '') {
        createMessage("Please enter the date the components were donated", "main-message", "error");
        return;
    }
    else {
        newEntry['entryDate'] = new Date(dateValue.toString());
    }
    //Validate component type selected input
    const componentTypeValue = donatedFormData.get('componentType');
    if (componentTypeValue === null || componentTypeValue.toString().trim() === '') {
        createMessage("Please select what component you are donating", "main-message", "error");
        return;
    }
    else {
        newEntry['componentType'] = componentTypeValue.toString();
    }
    //Validate quantity input
    const quantityValue = donatedFormData.get('quantity');
    if (quantityValue === null) {
        createMessage("Please enter the quantity of the components being donated", "main-message", "error");
        return;
    }
    else {
        const quantity = +quantityValue;
        if (quantity < 1) {
            createMessage("Please enter a quantity greater that 0", "main-message", "error");
            return;
        }
        else {
            newEntry['quantity'] = quantity;
        }
    }
    //Validate who donated input
    const whoDonatedValue = donatedFormData.get('whoDonated');
    if (whoDonatedValue === null || whoDonatedValue.toString().trim() === '') {
        createMessage("Please enter who donated the components", "main-message", "error");
        return;
    }
    else {
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
function loadPreviousEntries() {
    const previousEntriesTable = document.getElementById('previous-entries-table');
    let previousEntriesTableBody = previousEntriesTable.querySelector('tbody');
    if (previousEntriesTableBody === null) {
        previousEntriesTableBody = document.createElement('tbody');
    }
    if (previousEntriesTableBody) {
        previousEntriesTableBody.innerHTML = '';
        previousEntriesTable.appendChild(previousEntriesTableBody);
        let distributedInventoryLength = donateInventoryData.length;
        if (distributedInventoryLength === 0) {
            let noEntriesRow = addITemToTable({}, 5);
            previousEntriesTableBody.appendChild(noEntriesRow);
        }
        else {
            for (let i = distributedInventoryLength - 1; i >= 0; i--) {
                let newRow = addITemToTable(donateInventoryData[i], 5, "donatedInventory", 'shortDate');
                previousEntriesTableBody.appendChild(newRow);
            }
        }
    }
}
//Event listener for add inventory form submit
addInventoryModal.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});
//Event listener to open the add inventory modal
const addInventoryButton = document.getElementById('add-inventory-button');
addInventoryButton.addEventListener('click', () => {
    addInventoryModalBackdrop.style.display = 'flex';
    addInventoryModal.setAttribute('aria-modal', 'true');
    const dateInput = document.getElementById('date');
    dateInput.focus();
    trapFocus(addInventoryModal, addInventoryModalBackdrop);
});
//Event listener to close the add inventory modal
const closeModalButton = document.getElementById('cancel');
closeModalButton.addEventListener('click', () => {
    closeModal('add-inventory-backdrop');
});
loadPreviousEntries();
