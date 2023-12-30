var displayedFields = document.getElementById('displayedFields');

function enableStep2() {
    var fileInput = document.getElementById('fileInput');
    var fileType = document.getElementById('fileType');
    var encoding = document.getElementById('encoding');
    var hasHeader = document.getElementById('hasHeader');

    fileType.disabled = !fileInput.files[0];
    encoding.disabled = !fileInput.files[0];
    hasHeader.disabled = !fileInput.files[0];
}
function moveSelected(sourceId, targetId) {
    var source = document.getElementById(sourceId);
    var target = document.getElementById(targetId);
    var targetValues = Array.from(target.options).map(option => option.value);
    Array.from(source.selectedOptions).forEach(option => {
        if (!targetValues.includes(option.value)) {
            target.add(new Option(option.text, option.value));
            targetValues.push(option.value);
        }
        option.remove();
    });
}


function nextStep() {
    var fileInput = document.getElementById('fileInput');
    var fileTypeDropdown = document.getElementById('fileType');
    var selectedFileType = fileTypeDropdown.value.toLowerCase();
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var fileContent = event.target.result;

            try {
                var data;
                if (selectedFileType === 'csv') {
                    if (!file.name.toLowerCase().endsWith('.csv')) {
                        throw new Error('file type does not match the actual file format.');
                    }
                    data = parseCSV(fileContent);
                } else if (selectedFileType === 'json') {
                    if (!file.name.toLowerCase().endsWith('.json')) {
                        throw new Error('file type does not match the actual file format.');
                    }
                    data = JSON.parse(fileContent);
                } else {
                    throw new Error('Unsupported file type. Please select either CSV or JSON.');
                }
                document.getElementById('next-message').textContent = 'Swipe down to see displayed fields.';
                var products = data.products;
                var sortedProducts = Object.values(products).sort((a, b) => b.popularity - a.popularity);
                displayDataInTable(sortedProducts, getSelectedFields());
            } catch (error) {
                console.error("Error:", error.message);
                alert(error.message);
            }
        };

        reader.readAsText(file);
    } else {
        document.getElementById('next-message').textContent = 'Please choose a file before proceeding.';
    }
}

function parseCSV(csvContent) {
    var lines = csvContent.split('\n');
    var headers = lines[0].split(',');
    var products = {};

    for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(',');
        var products = values[0];
        products[products] = {};

        for (var j = 1; j < headers.length; j++) {
            products[products][headers[j]] = values[j];
        }
    }

    return { products: products };
}


function displayDataInTable(products, selectedFields) {
    clearTable();

    var table = document.createElement('table');
    table.classList.add('result-table');

    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    selectedFields.forEach(field => {
        var th = document.createElement('th');
        th.textContent = field;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    Object.entries(products).forEach(([products, product]) => {
        var tr = document.createElement('tr');
        selectedFields.forEach(field => {
            var td = document.createElement('td');
            if (field === "product id") {
                td.textContent = products;
            } else {
                td.textContent = product[field] || '';
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    document.body.appendChild(table);
}


function clearTable() {
    var existingTable = document.querySelector('.result-table');
    if (existingTable) {
        existingTable.remove();
    }
}

function getSelectedFields() {
    return Array.from(displayedFields.options).map(option => option.value);
}

function cancel() {
    clearTable();
    document.getElementById('cancel-message').textContent = 'Table Cleared';
}

displayedFields.addEventListener('change', function () {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var fileContent = event.target.result;

            try {
                var data = JSON.parse(fileContent);
                var products = data.products;
                var sortedProducts = Object.values(products).sort((a, b) => b.popularity - a.popularity);
                displayDataInTable(sortedProducts, getSelectedFields());
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };

        reader.readAsText(file);
    } else {
        document.getElementById('next-message').textContent = 'Please choose a file before proceeding.';
    }
});