// An array of fields for the error messages
const fields = [
    { id: 'jobTitle', message: 'Please enter a job title.' },
    { id: 'companyName', message: 'Please enter a company name.' },
    { id: 'tradeArea', message: 'Please choose a trade area.' },
    { id: 'location', message: 'Please enter a location.' },
    { id: 'listingType', message: 'Please choose job or internship.' },
    { id: 'expirationDate', message: 'Please choose an expiration date.' },
    { id: 'applicationUrl', message: 'Please enter an application URL.' }
];

// Validates the form data submitted
function validateForm() {
    let isValid = true;

    fields.forEach(function (field) {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.id + 'Error');
        const value = input.value.trim();

        error.textContent = '';

        // Checks if required fields are empty or not
        if (value === '') {
            error.textContent = field.message;
            isValid = false;
        } else if (field.id === 'applicationUrl') {
            if (!value.startsWith('http://') && !value.startsWith('https://')) {
                error.textContent = 'URL must start with http:// or https://';
                isValid = false;
            }
        }
    });

    return isValid;
}

// Loops through each field and removes error messages if correct data is submitted
fields.forEach(function (field) {
    const input = document.getElementById(field.id);

    if (input) {
        input.addEventListener('input', function () {
            document.getElementById(field.id + 'Error').textContent = '';
        });
    }
});