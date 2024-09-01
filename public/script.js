const form = document.getElementById('dataForm');
const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
const ctx = document.getElementById('expenseChart').getContext('2d');

let data = [];

function updateTable() {
    dataTable.innerHTML = '';
    data.forEach(entry => {
        const row = dataTable.insertRow();
        row.insertCell(0).innerText = entry.type;
        row.insertCell(1).innerText = entry.amount;
        row.insertCell(2).innerText = entry.date;
    });
}

function updateChart() {
    const labels = [...new Set(data.map(entry => entry.date))];
    const amounts = labels.map(label => {
        return data
            .filter(entry => entry.date === label)
            .reduce((sum, entry) => entry.type === 'Expense' ? sum - entry.amount : sum + entry.amount, 0);
    });

    if (window.chart) {
        window.chart.destroy();
    }

    window.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Balance',
                data: amounts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const type = form.type.value;
    const amount = parseFloat(form.amount.value);
    const date = form.date.value;

    // Autogenerate balance based on previous data
    const balance = data.reduce((sum, entry) => entry.date === date ? sum + (entry.type === 'Expense' ? -entry.amount : entry.amount) : sum, 0);

    data.push({ type, balance, amount, date });
    updateTable();
    updateChart();

    form.reset();
});

// For initial chart setup if there is pre-existing data
updateChart();
