const fields = [
    { id: 'jobTitle', message: 'Please enter a job title.' },
    { id: 'companyName', message: 'Please enter a company name.' },
    { id: 'tradeArea', message: 'Please choose a trade area.' },
    { id: 'location', message: 'Please enter a location.' },
    { id: 'listingType', message: 'Please choose job or internship.' },
    { id: 'jobType', message: 'Please choose full time or part time.' },
    { id: 'postDate', message: 'Please choose a post date.' },
    { id: 'expirationDate', message: 'Please choose an expiration date.' },
    { id: 'applicationUrl', message: 'Please enter an application URL.' }
];

function validateForm() {
    let isValid = true;

    fields.forEach(function (field) {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.id + 'Error');
        const value = input.value.trim();

        error.textContent = '';

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

fields.forEach(function (field) {
    const input = document.getElementById(field.id);

    if (input) {
        input.addEventListener('input', function () {
            document.getElementById(field.id + 'Error').textContent = '';
        });
    }
});