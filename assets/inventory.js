//page elements
let errorMessage = document.getElementById('error');

function addItemToTable(item) {
    console.log(item.componentType)
}

function createErrorMessage(error) {
    let p = document.createElement('p');
            let errorMessageText = document.createTextNode(error);
            p.appendChild(errorMessageText);
            errorMessage.appendChild(p);
}

async function loadJsonData() {
    try {
        let response = await fetch('assets/inventory.json');
        if (!response.ok) {
            createErrorMessage(`Error loading the data. Status: ${response.status}`);
            throw new Error(`Error loading data. Status: ${response.status}`);
        }
        let data = await response.json();
        console.log(`Fetched ${data.length} rows of data`);
        for (let i=0; i<data.length; i++) {
            addItemToTable(data[i]);
        }
    } catch(error) {
        createErrorMessage(error);
            console.error("Failed to load data: ", error);
    }
}

loadJsonData();