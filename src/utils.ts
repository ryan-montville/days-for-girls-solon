import { Event, SignUpEntry, ComponentItem, InventoryEntry } from "./models";
import { deleteComponentType, deleteDistributedEntry, deleteDonatedEntry, deleteEvent, deleteSignUpEntry, getEvent, getComponent, getDistributedLogEnry, getDonatedLogEntry, getSignUpEntry } from "./controller.js";

type TableItem = SignUpEntry | ComponentItem | InventoryEntry | {};

export function addITemToTable(item: TableItem, numCells: number, itemType: string, dateFormat?: string): HTMLElement {
    //Turn the item into arrays of its keys and values
    const itemKeys = Object.keys(item);
    const itemValues = Object.values(item)
    const itemValuesLength: number = itemValues.length;
    //Find how many keys are ids, set keyStartIndex to skip them
    const keyStartIndex: number = itemKeys.filter(keyName => keyName.includes('Id')).length;
    let newRow: HTMLElement = document.createElement('tr');
    //If passed an empty object, the table is empty. Create a row saying the table is empty
    if (itemValuesLength === 0) {
        let noneCell = document.createElement('td');
        noneCell.setAttribute('colspan', numCells.toString());
        let noneText = document.createTextNode("No items to display");
        noneCell.appendChild(noneText);
        newRow.appendChild(noneCell);
    } else {
        //Add the values to a new table row, keyStartIndex skips primary key and foreign key ids
        for (let i = keyStartIndex; i < itemValuesLength; i++) {
            let newCell = document.createElement('td');
            if (itemKeys[i] === 'entryDate') {
                if (dateFormat) {
                    let dateFixed: string = fixDate(itemValues[i], dateFormat);
                    let dateString = document.createTextNode(dateFixed);
                    newCell.appendChild(dateString);
                }
            } else {
                let valueString = document.createTextNode(itemValues[i]);
                newCell.appendChild(valueString);
            }
            newRow.appendChild(newCell);
        }
        let deleteButtonCell = document.createElement('td');
        let deleteButton = document.createElement('button');
        deleteButton.setAttribute('type', 'button');
        deleteButton.setAttribute('class', 'material-symbols-outlined');
        let deleteText = document.createTextNode('delete');
        deleteButton.appendChild(deleteText);
        deleteButton.addEventListener('click', () => {
            deleteItem(itemValues[0], itemType);
        });
        deleteButtonCell.appendChild(deleteButton);
        newRow.appendChild(deleteButtonCell);
    }
    return newRow;
}

export function CheckInventoryForDistribution(componentTypeToCheck: string, quantityToDistribute: number): { hasEnough: boolean, quantity: number } {
    let currentInventoryLocalStorage = localStorage.getItem("currentInventory") as string;
    let currentInventoryArray: ComponentItem[] = JSON.parse(currentInventoryLocalStorage);
    let itemToCheck: ComponentItem | undefined = currentInventoryArray.find(item => item['componentType'] === componentTypeToCheck);
    if (itemToCheck) {
        if (itemToCheck['quantity'] < quantityToDistribute) {
            return { hasEnough: false, quantity: itemToCheck['quantity'] };
        } else {
            return { hasEnough: true, quantity: itemToCheck['quantity'] };
        }
    } else {
        return { hasEnough: false, quantity: 0 };
    }
}

export function clearMessages() {
    const messageWrappers = document.getElementsByClassName('message-wrapper');
    for (const messageWrapper of messageWrappers) {
        messageWrapper.innerHTML = '';
    }
}

export function closeModal(modalBackdropId: string) {
    let modalBackdrop = document.getElementById(modalBackdropId) as HTMLElement;
    let modal = modalBackdrop.getElementsByClassName('modal');
    if (modal) {
        modal[0].setAttribute('aria-modal', 'false');
    }
    modalBackdrop.style.display = 'none';
}

export function createMessage(message: string, location: string, type: string) {
    let messageWrapper = document.getElementById(location) as HTMLElement;
    messageWrapper.innerHTML = '';
    let messageDiv = document.createElement('div');
    if (type === 'check_circle') {
        messageDiv.setAttribute('class', 'success message');
        messageDiv.setAttribute('aria-live', 'polite');
        console.log(message);
    } else if (type === 'error') {
        messageDiv.setAttribute('class', 'error message');
        messageDiv.setAttribute('role', 'alert');
        console.error(message);
    } else if (type === 'delete' || type === 'warn') {
        messageDiv.setAttribute('class', 'warn message');
        messageDiv.setAttribute('aria-live', 'polite');
        console.warn(message);
    } else {
        messageDiv.setAttribute('class', 'info message');
        messageDiv.setAttribute('aria-live', 'polite');
        console.log(message);
    }
    let icon = document.createElement('span');
    icon.setAttribute('class', 'material-symbols-outlined');
    let iconName = document.createTextNode(type);
    icon.appendChild(iconName);
    messageDiv.appendChild(icon);
    let messageText = document.createTextNode(message);
    messageDiv.appendChild(messageText);
    let closeButton = document.createElement('button');
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('class', 'material-symbols-outlined');
    let closeIcon = document.createTextNode('close');
    closeButton.appendChild(closeIcon)
    closeButton.addEventListener('click', () => messageWrapper.innerHTML = '');
    messageDiv.appendChild(closeButton);
    messageWrapper.appendChild(messageDiv);
}

export function createTable(tableId: string, columnHeaders: string[]) {
    const newTable = document.createElement('table');
    newTable.setAttribute('id', tableId);
    const tableHead = document.createElement('thead');
    columnHeaders.forEach(columnHeader => {
        const newColumnHeader = document.createElement('th');
        const columnHeaderName = document.createTextNode(columnHeader);
        newColumnHeader.appendChild(columnHeaderName);
        tableHead.appendChild(newColumnHeader);
    });
    newTable.appendChild(tableHead);
    return newTable;
}

export function deleteItem(itemId: number, itemType: string) {
    //This function will be updated once data storage is resolved. Currently just updates local storage
    let deleteModalTitle: string = "";
    let deletedMessage: string = "";
    let itemToDelete: InventoryEntry | ComponentItem | SignUpEntry | Event | null | undefined = null;

    //Get item based on its key name and key ID
    switch (itemType) {
        case "componentItem": {
            itemToDelete = getComponent(itemId) as ComponentItem;
            //Create the title for the delete modal
            deleteModalTitle = `Are you sure you want to delete  '${itemToDelete['componentType']}' from the inventory and logs?`;
            //Create the message for successful delete
            deletedMessage = `Deleted '${itemToDelete['componentType']}' from the inventory and logs`;
            break;
        }
        case "contactEntry": {
            //Might not be needed depending on how mailing list sign up works
            break; 
        }
        case "event": {
            itemToDelete = getEvent(itemId) as Event;
            //Create the title for the delete modal
            deleteModalTitle = `Are you sure you want to delete the event '${itemToDelete['eventTitle']}'?`;
            //Create the message for successful delete
            deletedMessage = `Deleted event '${itemToDelete['eventTitle']}'`;
            break;
        }
        case "donatedEntry": {
            itemToDelete = getDonatedLogEntry(itemId) as InventoryEntry;
            //Create the title for the delete modal
            deleteModalTitle = `Are you sure you want to delete these donated ${itemToDelete['componentType']}?`;
            //Create the message for successful delete
            deletedMessage = `Deleted ${itemToDelete['quantity']} ${itemToDelete['componentType']} donated on ${fixDate(itemToDelete.entryDate.toString(), 'shortDate')} by ${itemToDelete['whoDonated']}`;
            break;
        }
        case "distributedEntry": {
            itemToDelete = getDistributedLogEnry(itemId) as InventoryEntry;
            //Create the title for the delete modal
            deleteModalTitle = `Are you sure you want to delete these distributed ${itemToDelete['componentType']}?`;
            //Create the message for successful delete
            deletedMessage = `Deleted ${itemToDelete['quantity']} ${itemToDelete['componentType']} distributed on ${fixDate(itemToDelete.entryDate.toString(), 'shortDate')} to ${itemToDelete['destination']}`;
            break;
        }
        case "signUpEntry": {
            itemToDelete = getSignUpEntry(itemId) as SignUpEntry
            //Create the title for the delete modal
            deleteModalTitle = `Are you sure you want to delete this sign up?`;
            //Create the message for successful delete
            deletedMessage = `Deleted sign up from ${itemToDelete['fullName']}`;
            break;
        }
        default: {
            createMessage("Error deleting item. Try reloading the page", "main-message", "error");
        }
    }

    //If the item exists, open the delete modal
    if (itemToDelete) {
        //Open delete item modal by changing the display of the backdrop
        const deleteItemBackdrop = document.getElementById('delete-item-backdrop') as HTMLElement;
        const deleteForm = document.getElementById('delete-item-modal') as HTMLFormElement;
        deleteItemBackdrop.style.display = 'flex';
        deleteForm.setAttribute('aria-modal', 'true');
        const deleteItemModal = document.getElementById('delete-item-modal') as HTMLFormElement;
        deleteItemModal.innerHTML = '';
        //Display the modal title
        let deleteMoalH2 = document.createElement('h2');
        let deleteModalText = document.createTextNode(`${deleteModalTitle}`);
        deleteMoalH2.appendChild(deleteModalText);
        deleteItemModal.appendChild(deleteMoalH2);
        //Create an array of the item's keys and values
        let itemKeys = Object.keys(itemToDelete);
        let itemValues = Object.values(itemToDelete);
        let l = itemValues.length;
        //Display the item's key value pairs
        for (let i = 0; i < l; i++) {
            let keyValueP = document.createElement('p');
            //Don't display the id key/values or event description
            if (!itemKeys[i].includes("Id") && !itemKeys[i].includes("eventDescription")) {
                let readableKey: string = itemKeys[i].replace(/([a-z])([A-Z])/g, '$1 $2');
                let keyValue = document.createTextNode(`${readableKey.toLowerCase()}: ${itemValues[i]}`);
                keyValueP.appendChild(keyValue);
                deleteItemModal.appendChild(keyValueP);
            }
        }
        //Create button row
        let buttonRow = document.createElement('section');
        buttonRow.setAttribute('class', 'button-row');
        let noButton = document.createElement('button');
        noButton.setAttribute('type', 'button');
        noButton.setAttribute('class', 'secondary');
        let noButtonText = document.createTextNode("No");
        noButton.appendChild(noButtonText);
        noButton.addEventListener('click', () => {
            //Close delete modal
            deleteItemBackdrop.style.display = 'none';
        });
        buttonRow.appendChild(noButton);
        let yesButton = document.createElement('button');
        let yesButtonText = document.createTextNode('Yes');
        yesButton.appendChild(yesButtonText);
        yesButton.setAttribute('type', 'button');
        yesButton.setAttribute('class', 'delete-button');
        yesButton.addEventListener('click', () => {
            switch (itemType) {
                case "componentItem": {
                    deleteComponentType(itemId);
                    break;
                }
                case "contactEntry": {
                    //Might not be needed depending on how mailing list sign up works
                    break;
                }
                case "donatedEntry": {
                    deleteDonatedEntry(itemId);
                    break;
                }
                case "distributedEntry": {
                    deleteDistributedEntry(itemId);
                    break;
                }
                case "event": {
                    deleteEvent(itemId);
                    break;
                }
                case "signUpEntry": {
                    deleteSignUpEntry(itemId);
                    break;
                }
                default: {
                    //This should never be created since the modal shouldn't open if the item doesn't exist
                    createMessage("Error deleting item. Try reloading the page", "main-message", "error");
                }
            }
            //Close the delete modal
            deleteItemBackdrop.style.display = 'none';
            //Create a message after the item is deleted
            createMessage(deletedMessage, "main-message", "delete");
            // window.location.reload(); figure out different way to update the dom without reloading page
        });
        buttonRow.appendChild(yesButton);
        deleteItemModal.appendChild(buttonRow);
        noButton.focus();
        trapFocus(deleteItemModal, deleteItemBackdrop);
    } else {
        createMessage("Item already removed from database. Try reloading the page", "main-message", "error");
    }
}

export function fixDate(dateString: string, dateFormat: string): string {
    let dateObj: Date = new Date(dateString);
    let dateTimezoneFixed: Date = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * -60000);
    if (dateFormat === 'shortDate') {
        return dateTimezoneFixed.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    } else {
        return dateTimezoneFixed.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
        });
    }
}

export function getComponentTypes(): string[] {
    let currentInventoryLocalStorage = localStorage.getItem('currentInventory') as string;
    let currentInventoryArray: ComponentItem[] = JSON.parse(currentInventoryLocalStorage);
    let componentTypes: string[] = [];
    currentInventoryArray.forEach(component => componentTypes.push(component['componentType']));
    return componentTypes;
}

export function displayLoadingMessage() {
    const loadingDiv = document.createElement('div');
    const loadingP = document.createElement('p');
    const loading = document.createTextNode('Loading...');
    loadingP.appendChild(loading);
    loadingDiv.appendChild(loadingP);
    return loadingDiv;

}

export function populateComponteTypeSelect(selctId: string) {
    let selectElement = document.getElementById(selctId) as HTMLSelectElement;
    if (selectElement.options.length === 1) {
        let componentTypes: string[] = getComponentTypes();
        componentTypes.forEach(component => {
            let newOption = document.createElement('option');
            newOption.setAttribute('value', component);
            let componentName = document.createTextNode(component);
            newOption.appendChild(componentName);
            selectElement.appendChild(newOption);
        });
    }
}

export function trapFocus(modal: HTMLElement, backdrop: HTMLElement) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea') as NodeListOf<HTMLElement>;
    //Don't trap focus if the modal/backdrop isn't open
    if (backdrop.style.display === 'none') {
        return;
    }
    //Warn if no focusable elements in modal
    if (!focusableElements.length) {
        console.warn('trapFocus Function called on modal with no focusable elements');
        return;
    }
    const firstFocusableElement: HTMLElement = focusableElements[0];
    const lastFocusableElement: HTMLElement = focusableElements[focusableElements.length - 1];
    document.addEventListener('keydown', (e) => {
        //Let user tab through only the elements in the modal
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                //If at first element, loop back to last element
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                //If at last element, loop to first element
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

export function updateLocalStorage(itemName: string, data: Event[] | SignUpEntry[] | ComponentItem[] | InventoryEntry[] | string) {
    const dataString: string = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}