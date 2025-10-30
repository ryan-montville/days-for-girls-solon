import { addITemToTable, createMessage, clearMessages, updateLocalStorage } from "./utils.js";
import { ComponentItem, InventoryEntry } from "./models.js";

//Get data from local storage
const currentInventoryLocalStorage = localStorage.getItem("currentInventory") as string;
let currentInventoryData: ComponentItem[] = JSON.parse(currentInventoryLocalStorage);
const donateInventoryLocalStorage = localStorage.getItem('donatedInventory') as string;
let donateInventoryData: InventoryEntry[] = JSON.parse(donateInventoryLocalStorage);
const DonatedForm = document.getElementById('donatedForm') as HTMLFormElement;
let username = localStorage.getItem('username');
let isUserSignedIn = false;

function submitData() {
    //Get the data from the form
    const donatedFormData: FormData = new FormData(DonatedForm);
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
        createMessage("Please enter the date the components were donated", "main-message", "error");
        return;
    } else {
        newEntry['entryDate'] = new Date(dateValue.toString());
    }
    //Validate component type selected input
    const componentTypeValue = donatedFormData.get('componentType');
    if (componentTypeValue === null || componentTypeValue.toString().trim() === '') {
        createMessage("Please select what component you are donating", "main-message", "error");
        return;
    } else {
        newEntry['componentType'] = componentTypeValue.toString()
    }
    //Validate quantity input
    const quantityValue = donatedFormData.get('quantity');
    const currentInventoryComponent: ComponentItem | undefined = currentInventoryData.find(item => item['componentType'] === componentTypeValue.toString());
    let CurrentInventoryUpdatedQuantity: number = 0;
    if (currentInventoryComponent !== undefined) {
        CurrentInventoryUpdatedQuantity = currentInventoryComponent['quantity'];
        if (quantityValue === null) {
            createMessage("Please enter the quantity of the components being donated", "main-message", "error");
            return;
        } else {
            const quantity: number = +quantityValue;
            if (quantity < 1) {
                createMessage("Please enter a quantity greater that 0", "main-message", "error");
                return;
            } else {
                newEntry['quantity'] = quantity;
                currentInventoryComponent['quantity'] += quantity;
                updateLocalStorage("currentInventory", currentInventoryData);
            }
        }
    }
    //Validate who donated input
    const whoDonatedValue = donatedFormData.get('whoDonated');
    if (whoDonatedValue === null || whoDonatedValue.toString().trim() === '') {
        createMessage("Please enter who donated the components", "main-message", "error");
        return;
    } else {
        newEntry['whoDonated'] = whoDonatedValue.toString();
    }
    //Add the new entry to the array
    donateInventoryData.push(newEntry);
    //Update local storage. Will change 
    updateLocalStorage("donatedInventory", donateInventoryData);
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
        let distributedInventoryLength = donateInventoryData.length;
        if (distributedInventoryLength === 0) {
            let noEntriesRow = addITemToTable({}, 5);
            previousEntriesTableBody.appendChild(noEntriesRow);
        } else {
            for (let i = distributedInventoryLength - 1; i >= 0; i--) {
                let newRow = addITemToTable(donateInventoryData[i], 5, "donatedInventory", 'shortDate');
                previousEntriesTableBody.appendChild(newRow);
            }
        }
    }
}

DonatedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    submitData();
});

loadPreviousEntries();