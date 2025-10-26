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

function fixDate(dateString, shortDate) {
    /* I learned how to fix the date being off by one from these
    stackOverflow threads: https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off
    and https://stackoverflow.com/questions/2035699/how-to-convert-a-full-date-to-a-short-date-in-javascript */
  if (shortDate) {
    let dateObj = new Date(dateString);
    let startDateTimezoneFixed = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * -60000);
    return startDateTimezoneFixed.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } else {
    let dateObj = new Date(dateString);
    let dateTimezoneFixed = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * -60000);
    return dateTimezoneFixed.toDateString();
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

export { createErrorMessage, fixDate, trapFocus, updateLocalStorage }