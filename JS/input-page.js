/*  input-page.js
  Handles everything on the first page:
    • Tracking how many option rows exist
    • Adding a new option row dynamically
    • Deleting a row
    • Validating inputs before moving to the wheel
    • Saving options to localStorage so wheel.html can read them*/


const MIN_OPTIONS = 2;
const MAX_OPTIONS = 8;
// This counter tracks the TOTAL number of rows currently on the page and act as teh serial number.
let optionCount = 2;


function addNewOption() {

    optionCount++;

    //the container where dynamic rows go
    const container = document.getElementById('container');

    // We use a custom (data-*) 'data-index' attribute so the delete button knows which row/index to remove.
    const newRow = `
        <div class="row" data-index="${optionCount}">
            <div class="sr-no">${optionCount}</div>
            <div class="input">
                <input type="text" placeholder="Enter your option here">
            </div>
            <div class="del-btn">
                <button onclick="deleteOption(this)">
                    <i class="fa-solid fa-x"></i>
                </button>
            </div>
        </div>
    `;

    //This makes sure the data is being added at the end after teh last option input
    container.insertAdjacentHTML('beforeend', newRow);

    // Hide the "Add Option" button once we've hit the max
    if (optionCount >= MAX_OPTIONS) {
        document.getElementById('opt-btn').style.display = 'none';
    }

    // Clear any previous error message when the user takes action
    clearError();
}


/*  We receive the button element itself so we can walk up
the DOM to find and remove the whole row div. */
function deleteOption(buttonElement) {

    // Walk up: button → del-btn div → row div
    const row = buttonElement.closest('.row');

    const allRows = getAllRows();
    if (allRows.length <= MIN_OPTIONS) {
        showError(`You need at least ${MIN_OPTIONS} options.`);
        return;
    }

    row.remove();
    // Re-number all remaining rows so serial numbers stay consecutive
    renumberRows();
    // If we dropped below max, show the "Add Option" button again
    if (optionCount < MAX_OPTIONS) {
        document.getElementById('opt-btn').style.display = '';
    }
    // Update our counter to match the real row count
    optionCount = getAllRows().length;

    clearError();
}


/*the serial number can have gaps (e.g. 1, 2, 4). This loops through every row and
 resets the number.*/
function renumberRows() {

    const allRows = getAllRows();
    // row is not a variable you declare - it's a parameter that forEach "loop" creates automatically for you.
    // You could actually call them anything — row and index are just names you choose
    allRows.forEach((row, index) => {
        // index is 0-based, so we add 1 for a human-friendly number
        row.querySelector('.sr-no').textContent = index + 1;
    });
}


function getAllRows() {
    return [...document.querySelectorAll('.row')];
}



/*handleSpinSubmit()
Called when the user clicks "Spin".
1. Reads all input values
2. Validates them
3. Saves them to localStorage
4. Navigates to wheel.html*/

function handleSpinSubmit() {

    const allRows = getAllRows();

    // .trim() removes accidental spaces so "  Pizza  " becomes "Pizza".
    const options = allRows.map(row => {
        const input = row.querySelector('input').value.trim();
        return input;
    });

    // Validation
    const emptyFields = options.filter(val => val === '');
    if (emptyFields.length > 0) {
        showError('Please fill in all option fields before spinning.');
        return;
    }

    // Check: minimum 2 options
    if (options.length < MIN_OPTIONS) {
        showError(`Please enter at least ${MIN_OPTIONS} options.`);
        return;
    }

    // Save & Navigate
    /* JSON.stringify converts our array ["Pizza","Tacos"] into the string '["Pizza","Tacos"]' so it can be stored.*/
    localStorage.setItem('wheelOptions', JSON.stringify(options));
    window.location.href = 'wheel.html';
}


//  showError(message) / clearError()
function showError(message) {
    //First checck if we already have a p element for msg display
    let errorEl = document.getElementById('error-msg');

    //NOT FOUND
    // Create the element
    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'error-msg';
        errorEl.style.cssText = 'color: #e74c3c; font-size: 0.85rem; margin: 8px 0 0 0;';

        // Insert it right before the buttons at the bottom of .container
        const container = document.querySelector('.container');
        const optBtn = document.getElementById('opt-btn');
        container.insertBefore(errorEl, optBtn);
    }

    errorEl.textContent = message;
}

function clearError() {
    const errorEl = document.getElementById('error-msg');
    if (errorEl) errorEl.textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('wheelOptions');
    if (!saved)
        return; // nothing saved, leave inputs empty

    const options = JSON.parse(saved);

    options.forEach((option, index) => {
        if (index === 0 || index === 1) {
            // fill the two static rows
            const rows = document.querySelectorAll('.row input');
            rows[index].value = option;
        } else {
            // create and fill dynamic rows for the rest
            addNewOption();
            const rows = document.querySelectorAll('.row input');
            rows[index].value = option;
        }
    });
});