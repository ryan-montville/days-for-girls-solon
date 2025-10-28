//This function will be updated once data storage is implemented

/**
 * 
 * @param {*} item 
 * @param {*} numCells 
 * @param {*} dataTableName 
 * @param {*} dateFormat 
 * @returns 
 */
function addItemToTable(item, numCells, dataTableName, dateFormat) {
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
    noneCell.setAttribute('colspan', numCells);
    let noneText = document.createTextNode("No items to display");
    noneCell.appendChild(noneText);
    newRow.appendChild(noneCell);
  } else {
    //Add the values to a new table row, keyStartIndex skips primary key and foreign key ids
    for (let i = keyStartIndex; i < itemValuesLength; i++) {
      let newCell = document.createElement('td');
      if (itemKeys[i] === 'date') {
        let dateString = document.createTextNode(fixDate(itemValues[i], dateFormat));
        newCell.appendChild(dateString);
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
      deleteItem(dataTableName, itemKeys[0], itemValues[0]);
    });
    deleteButtonCell.appendChild(deleteButton);
    newRow.appendChild(deleteButtonCell);
  }
  return newRow;
}

function createErrorMessage(message, location) {
  let errorMessageP = document.createElement('p');
  errorMessageP.setAttribute('role', 'alert');
  let errorIcon = document.createElement('i');
  errorIcon.setAttribute('class', 'material-symbols-outlined')
  let iconName = document.createTextNode('error');
  errorIcon.appendChild(iconName);
  let errorMessage = document.createTextNode(message);
  errorMessageP.appendChild(errorMessage);
  if (location === 'sign-in') {
    signInError.appendChild(errorMessageP);
  } else {
    mainError.appendChild(errorMessageP);
  }
}

function deleteItem(dataTableName, idKeyName, itemId) {
  //This function will be updated once data storage is resolved. Currently just updates local storage
  let itemArrayLocalStorage = localStorage.getItem(dataTableName);
  let itemArray = JSON.parse(itemArrayLocalStorage);
  alert(`Deleting ${idKeyName} ${itemId}`)
  let filteredItemArray = itemArray.filter(item => item[idKeyName] !== itemId);
  updateLocalStorage(dataTableName, filteredItemArray);
  window.location.reload();
}

function fixDate(dateString, dateFormat) {
  /* I learned how to fix the date being off by one from these
  stackOverflow threads: https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off
  and https://stackoverflow.com/questions/2035699/how-to-convert-a-full-date-to-a-short-date-in-javascript */
  let dateObj = new Date(dateString);
  let dateTimezoneFixed = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * -60000);
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

function trapFocus(modal, backdropID) {
  //Don't trap focus if the modal/backdrop isn't open
  if (backdropID.style.display === 'none') {
    return;
  }
  //get all the elements to tab through, define first and last elements
  const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea');
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

function updateLocalStorage(itemName, data) {
  let dataString = JSON.stringify(data);
  localStorage.setItem(itemName, dataString);
}

export { addItemToTable, createErrorMessage, deleteItem, fixDate, trapFocus, updateLocalStorage }