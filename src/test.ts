import {
    createTableRow,
    createTable,
    createMessage,
    storeMessage,
    createDeleteModal,
    openModal,
    closeModal,
    fixDate,
    populateComponteTypeSelect,
    trapFocus
} from "./utils.js";
import { initializeApp } from "./app.js";

initializeApp("test", "test").then(() => {
    const testModal = document.getElementById('test-modal') as HTMLFormElement;
    const textBackdrop = document.getElementById('test-backdrop') as HTMLElement;
    const testButton = document.getElementById('test-button') as HTMLElement;
    testButton.addEventListener('click', () => {
        openModal(textBackdrop, testModal, 'testInput1')
    });
    const closeButton = document.getElementById('close') as HTMLElement;
    closeButton.addEventListener('click', () => {
        closeModal('test-backdrop');
    });
    
})