import { addITemToTable, createMessage, clearMessages, updateItemTotal, updateLocalStorage } from "./utils.js";
import { ComponentItem, InventoryEntry } from "./models.js";

//Get data from local storage
const currentInventoryLocalStorage = localStorage.getItem("currentInventory") as string;
let currentInventoryData: ComponentItem[] = JSON.parse(currentInventoryLocalStorage);
const distributedInventoryLocalStorage = localStorage.getItem("distributedInventory") as string;
let distributedInventoryData: InventoryEntry[] = JSON.parse(distributedInventoryLocalStorage);
const distributedForm = document.getElementById('distributedForm') as HTMLFormElement;
let username = localStorage.getItem('username');
let isUserSignedIn = false;

function submitData() {
    //Get the data from the form
    const distributedFormData: FormData = new FormData(distributedForm);
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
        createMessage("Please enter the date the components are leaving", "main-message", "error");
        return;
    } else {
        newEntry['entryDate'] = new Date(dateValue.toString());
    }
    //Validate component type selected input
    const componentTypeValue = distributedFormData.get('componentType');
    if (componentTypeValue === null || componentTypeValue.toString().trim() === '') {
        createMessage("Please select what component you are distributing", "main-message", "error");
        return;
    } else {
        newEntry['componentType'] = componentTypeValue.toString()
    }

    //Validate quantity input
    const quantityValue = distributedFormData.get('quantity');
    if (quantityValue === null) {
        createMessage("Please enter the quantity of the components being distributed", "main-message", "error");
        return;
    } else {
        const quantity: number = +quantityValue;
        if (quantity < 1) {
            createMessage("Please enter a quantity greater that 0", "main-message", "error");
            return;
        } else {
            newEntry['quantity'] = quantity;
        }
    }
    //Validate destination input
    const destinationValue = distributedFormData.get('destination');
    if (destinationValue === null || destinationValue.toString().trim() === '') {
        createMessage("Please enter the destination", "main-message", "error");
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
    createMessage("The inventory has successfully been updated", "main-message", "check_circle");
    loadPreviousEntries();

}

function loadPreviousEntries() {
    clearMessages();
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

distributedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});

loadPreviousEntries();
