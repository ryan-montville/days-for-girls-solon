import { Event, SignUpEntry, ComponentItem, InventoryEntry } from "./models";

type TableItem = SignUpEntry | ComponentItem | InventoryEntry | {};

export function addITemToTable(item: TableItem, numCells: number, dataTableName?: string, dateFormat?: string): HTMLElement {
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
            if (dataTableName) {
                deleteItem(dataTableName, itemKeys[0], itemValues[0]);
            }
        });
        deleteButtonCell.appendChild(deleteButton);
        newRow.appendChild(deleteButtonCell);
    }
    return newRow;
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
    } else if (type === 'delete') {
        messageDiv.setAttribute('class', 'delete message');
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

export function clearMessages() {
    const mainMessageElement = document.getElementById('main-message') as HTMLElement;
    const signInMessage = document.getElementById('sign-in-message') as HTMLElement;
    mainMessageElement.innerHTML = '';
    signInMessage.innerHTML = '';
}

function deleteItem(dataTableName: string, idKeyName: string, itemId: string) {
    //This function will be updated once data storage is resolved. Currently just updates local storage
    let deleteMessage: string = "";
    let itemArrayLocalStorage = localStorage.getItem(dataTableName) as string;
    let itemArray = JSON.parse(itemArrayLocalStorage);
    let itemToDelete: Event | InventoryEntry | ComponentItem | SignUpEntry | null = null;
    if (dataTableName === 'donatedInventory') {
        itemToDelete = itemArray.find((item: any) => item[idKeyName] === itemId) as InventoryEntry;
        deleteMessage = `Deleted ${itemToDelete['quantity']} ${itemToDelete['componentType']} donated on ${fixDate(itemToDelete.entryDate.toString(), 'shortDate')} by ${itemToDelete['whoDonated']}`;
    } else if (dataTableName === 'distributedInventory') {
        itemToDelete = itemArray.find((item: any) => item[idKeyName] === itemId) as InventoryEntry;
        deleteMessage = `Deleted ${itemToDelete['quantity']} ${itemToDelete['componentType']} distributed on ${fixDate(itemToDelete.entryDate.toString(), 'shortDate')} to ${itemToDelete['destination']}`;
    } else if (dataTableName === 'SignUpEntries') {
        itemToDelete = itemArray.find((item: any) => item[idKeyName] === itemId) as SignUpEntry;
        deleteMessage = `Deleted sign up from ${itemToDelete['fullName']}`;
    } else if (dataTableName === 'currentInventory') {
        itemToDelete = itemArray.find((item: any) => item[idKeyName] === itemId) as ComponentItem;
        deleteMessage = `Deleted ${itemToDelete.componentType} from database`;
    }
    if (itemToDelete) {
        alert(`Deleting ${idKeyName} ${itemId}`);
        let filteredItemArray = itemArray.filter((item: any) => item[idKeyName] !== itemId);
        //If deleting component from current inventory, delete from donatedInventory and distributedInventory as well
        updateLocalStorage(dataTableName, filteredItemArray);
        createMessage(deleteMessage, "main-message", "delete");
        //window.location.reload(); figure out different way to update the dom without reloading page
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