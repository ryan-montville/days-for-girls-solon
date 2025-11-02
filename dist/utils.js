export function addITemToTable(item, numCells, dataTableName, dateFormat) {
    //Turn the item into arrays of its keys and values
    const itemKeys = Object.keys(item);
    const itemValues = Object.values(item);
    const itemValuesLength = itemValues.length;
    //Find how many keys are ids, set keyStartIndex to skip them
    const keyStartIndex = itemKeys.filter(keyName => keyName.includes('Id')).length;
    let newRow = document.createElement('tr');
    //If passed an empty object, the table is empty. Create a row saying the table is empty
    if (itemValuesLength === 0) {
        let noneCell = document.createElement('td');
        noneCell.setAttribute('colspan', numCells.toString());
        let noneText = document.createTextNode("No items to display");
        noneCell.appendChild(noneText);
        newRow.appendChild(noneCell);
    }
    else {
        //Add the values to a new table row, keyStartIndex skips primary key and foreign key ids
        for (let i = keyStartIndex; i < itemValuesLength; i++) {
            let newCell = document.createElement('td');
            if (itemKeys[i] === 'entryDate') {
                if (dateFormat) {
                    let dateFixed = fixDate(itemValues[i], dateFormat);
                    let dateString = document.createTextNode(dateFixed);
                    newCell.appendChild(dateString);
                }
            }
            else {
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
export function createMessage(message, location, type) {
    let messageWrapper = document.getElementById(location);
    messageWrapper.innerHTML = '';
    let messageDiv = document.createElement('div');
    if (type === 'check_circle') {
        messageDiv.setAttribute('class', 'success message');
        messageDiv.setAttribute('aria-live', 'polite');
        console.log(message);
    }
    else if (type === 'error') {
        messageDiv.setAttribute('class', 'error message');
        messageDiv.setAttribute('role', 'alert');
        console.error(message);
    }
    else if (type === 'delete' || type === 'warn') {
        messageDiv.setAttribute('class', 'warn message');
        messageDiv.setAttribute('aria-live', 'polite');
        console.warn(message);
    }
    else {
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
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', () => messageWrapper.innerHTML = '');
    messageDiv.appendChild(closeButton);
    messageWrapper.appendChild(messageDiv);
}
export function clearMessages() {
    const mainMessageElement = document.getElementById('main-message');
    const signInMessage = document.getElementById('sign-in-message');
    mainMessageElement.innerHTML = '';
    signInMessage.innerHTML = '';
}
function updateItemTotal(item, reasonForUpdate) {
    if (reasonForUpdate === 'delete') {
        //update counts to remove item value
        //Donate - subtract from current inventory
        //Distribute - add to currrent inventory
        //sign up - subtract from num attending
        //Event - remove sign up entries for that event
        //Component - remove compontent type from donate/distribut forms
        //Should these last two be in a different function?
    }
    else {
        //update the counts to include new quantity
        //Donate - add to current inventory
        //Distribute - subtract from currrent inventory
        //sign up - add to num attending
    }
}
export function deleteItem(dataTableName, idKeyName, itemId) {
    //This function will be updated once data storage is resolved. Currently just updates local storage
    let deleteModalTitle = "";
    let deletedMessage = "";
    //Get the local storage array that the item to delete is in
    let itemArrayLocalStorage = localStorage.getItem(dataTableName);
    let itemArray = JSON.parse(itemArrayLocalStorage);
    let itemToDelete = null;
    //Set item to delete based on local storage itemKey which will set the type
    if (dataTableName === 'donatedInventory') {
        //Get the item to delete
        itemToDelete = itemArray.find((item) => item[idKeyName] === itemId);
        //Create the title for the delete modal
        deleteModalTitle = `Are you sure you want to delete these donated ${itemToDelete['componentType']}?`;
        //Create the message for successful delete
        deletedMessage = `Deleted ${itemToDelete['quantity']} ${itemToDelete['componentType']} donated on ${fixDate(itemToDelete.entryDate.toString(), 'shortDate')} by ${itemToDelete['whoDonated']}`;
    }
    else if (dataTableName === 'distributedInventory') {
        //Get the item to delete
        itemToDelete = itemArray.find((item) => item[idKeyName] === itemId);
        //Create the title for the delete modal
        deleteModalTitle = `Are you sure you want to delete these distributed ${itemToDelete['componentType']}?`;
        //Create the message for successful delete
        deletedMessage = `Deleted ${itemToDelete['quantity']} ${itemToDelete['componentType']} distributed on ${fixDate(itemToDelete.entryDate.toString(), 'shortDate')} to ${itemToDelete['destination']}`;
    }
    else if (dataTableName === 'SignUpEntries') {
        //Get the item to delete
        itemToDelete = itemArray.find((item) => item[idKeyName] === itemId);
        //Create the title for the delete modal
        deleteModalTitle = `Are you sure you want to delete this sign up?`;
        //Create the message for successful delete
        deletedMessage = `Deleted sign up from ${itemToDelete['fullName']}`;
    }
    else if (dataTableName === 'currentInventory') {
        //Get the item to delete
        itemToDelete = itemArray.find((item) => item[idKeyName] === itemId);
        //Create the title for the delete modal
        deleteModalTitle = `Are you sure you want to delete ${itemToDelete['componentType']} from database?`;
        //Create the message for successful delete
        deletedMessage = `Deleted ${itemToDelete['componentType']} from database`;
    }
    else if (dataTableName === 'events') {
        //Get the item to delete
        itemToDelete = itemArray.find((item) => item[idKeyName] === itemId);
        if (itemToDelete) {
            //Create the title for the delete modal
            deleteModalTitle = `Are you sure you want to delete the event "${itemToDelete['eventTitle']}"?`;
            //Create the message for successful delete
            deletedMessage = `Deleted the event "${itemToDelete['eventTitle']}"`;
        }
    }
    if (itemToDelete) {
        //Open delete item modal by changing the display of the backdrop
        const deleteItemBackdrop = document.getElementById('delete-item-backdrop');
        deleteItemBackdrop.style.display = 'flex';
        const deleteItemModal = document.getElementById('delete-item-modal');
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
                let readableKey = itemKeys[i].replace(/([a-z])([A-Z])/g, '$1 $2');
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
            //Filter the item from local storage array
            let filteredItemArray = itemArray.filter((item) => item[idKeyName] !== itemId);
            //Update local storage
            updateLocalStorage(dataTableName, filteredItemArray);
            //Update the count for the item
            updateItemTotal(itemToDelete, 'delete');
            //Close the delete modal
            deleteItemBackdrop.style.display = 'none';
            //Create a message after the item is deleted
            createMessage(deletedMessage, "main-message", "delete");
            // window.location.reload(); figure out different way to update the dom without reloading page
        });
        buttonRow.appendChild(yesButton);
        deleteItemModal.appendChild(buttonRow);
    }
    else {
        createMessage("Item already removed from database. Try reloading the page", "main-message", "error");
    }
}
export function fixDate(dateString, dateFormat) {
    let dateObj = new Date(dateString);
    let dateTimezoneFixed = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * -60000);
    if (dateFormat === 'shortDate') {
        return dateTimezoneFixed.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    }
    else {
        return dateTimezoneFixed.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
        });
    }
}
export function trapFocus(modal, backdrop) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea');
    //Don't trap focus if the modal/backdrop isn't open
    if (backdrop.style.display === 'none') {
        return;
    }
    //Warn if no focusable elements in modal
    if (!focusableElements.length) {
        console.warn('trapFocus Function called on modal with no focusable elements');
        return;
    }
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    document.addEventListener('keydown', (e) => {
        //Let user tab through only the elements in the modal
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                //If at first element, loop back to last element
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            }
            else {
                //If at last element, loop to first element
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}
export function updateLocalStorage(itemName, data) {
    const dataString = JSON.stringify(data);
    localStorage.setItem(itemName, dataString);
}
