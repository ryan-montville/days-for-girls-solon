import { addITemToTable, createMessage, clearMessages, closeModal, CheckInventoryForDistribution, populateComponteTypeSelect, trapFocus, updateItemTotal, updateLocalStorage } from "./utils.js";
import { ComponentItem, InventoryEntry } from "./models.js";

//Get data from local storage
const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory") as string;
let distributedInventoryData: InventoryEntry[] = JSON.parse(distributedInventoryLocalStorage);
const distributeInventoryModal = document.getElementById('distribute-inventory-modal') as HTMLFormElement;
const distributeInventoryBackdrop = document.getElementById('distribute-inventory-backdrop') as HTMLElement;

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
    newEntry['entryId'] = distributedInventoryData[distributedInventoryData.length - 1]['entryId'] + 1;
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
        const checkInventory = CheckInventoryForDistribution(newEntry['componentType'], quantity)
        if (quantity < 1) {
            createMessage("Please enter a quantity greater that 0", "distribute-modal-message", "error");
            return;
        } else if(!checkInventory.hasEnough) {
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
    //Add the new entry to the array
    distributedInventoryData.push(newEntry);
    //Update current inventory count for component
    updateItemTotal(newEntry, "updateCounts");
    //Update local storage. Will change 
    updateLocalStorage("distributedInventory", distributedInventoryData);
    closeModal('distribute-inventory-backdrop');
    createMessage("The inventory has successfully been updated", "main-message", "check_circle");
    loadPreviousEntries();

}

function loadPreviousEntries() {
    const previousEntriesTable = document.getElementById('previous-entries-table') as HTMLElement;
    let previousEntriesTableBody = previousEntriesTable.querySelector('tbody');
    if (previousEntriesTableBody === null) {
        previousEntriesTableBody = document.createElement('tbody');
    }
    if (previousEntriesTableBody) {
        previousEntriesTableBody.innerHTML = '';
        previousEntriesTable.appendChild(previousEntriesTableBody);
        let distributedInventoryLength = distributedInventoryData.length;
        if (distributedInventoryLength === 0) {
            let noEntriesRow = addITemToTable({}, 5);
            previousEntriesTableBody.appendChild(noEntriesRow);
        } else {
            for (let i = distributedInventoryLength - 1; i >= 0; i--) {
                let newRow = addITemToTable(distributedInventoryData[i], 5, "distributedInventory", 'shortDate');
                previousEntriesTableBody.appendChild(newRow);
            }
        }
    }
}

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