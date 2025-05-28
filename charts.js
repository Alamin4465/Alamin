// chart.js
// Chart.js ও Datalabels প্লাগিন একবার রেজিস্টার করো
Chart.register(ChartDataLabels);
let summaryChart;
// chart.js
let chartInstance;

function renderChart(transactions, filterType = "all") {
  const incomeCategoryMap = {};
  const expenseCategoryMap = {};

  transactions.forEach(txn => {
    const type = txn.type || "expense";
    if (filterType !== "all" && type !== filterType) return;

    const category = txn.category || "অন্যান্য";
    const amount = parseFloat(txn.amount) || 0;

    if (type === "income") {
      incomeCategoryMap[category] = (incomeCategoryMap[category] || 0) + amount;
    } else {
      expenseCategoryMap[category] = (expenseCategoryMap[category] || 0) + amount;
    }
  });

  const incomeCategories = Object.keys(incomeCategoryMap);
  const incomeValues = Object.values(incomeCategoryMap);
  const expenseCategories = Object.keys(expenseCategoryMap);
  const expenseValues = Object.values(expenseCategoryMap);

  const series = [...incomeValues, ...expenseValues];
  const labels = [
    ...incomeCategories.map(c => "আয়: " + c),
    ...expenseCategories.map(c => "ব্যয়: " + c)
  ];

  // রঙ আলাদা করে অটো match করানো
  const incomeColors = Array(incomeValues.length).fill().map((_, i) => `hsl(140, 70%, ${60 - i * 5}%)`);
  const expenseColors = Array(expenseValues.length).fill().map((_, i) => `hsl(0, 70%, ${65 - i * 5}%)`);
  const colors = [...incomeColors, ...expenseColors];

  const options = {
    chart: {
      type: 'pie',
      height: 350,
      width: '100%',
      toolbar: { show: false }
    },
    series: series,
    labels: labels,
    colors: colors,
    legend: { position: 'bottom' },
    dataLabels: {
      enabled: true,
    },
    fill: { type: 'solid' },
    plotOptions: {
      pie: {
        expandOnClick: true,
        offsetY: 10,
        dataLabels: {
          dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 2,
            opacity: 0.5
          }
        }
      }
    }
  };

  if (chartInstance) {
    chartInstance.updateOptions(options);
    chartInstance.updateSeries(series);
  } else {
    chartInstance = new ApexCharts(document.querySelector("#categoryChart"), options);
    chartInstance.render();
  }
}

// Register plugins ONCE during app initialization (not inside function)
// Chart.register(ChartDataLabels);

function renderSummaryChart(title, income, expense) {
  const ctx = document.getElementById("summaryChart").getContext("2d");
  if (window.summaryChart) window.summaryChart.destroy();

  window.summaryChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["আয়", "ব্যয়"], // Removed "মোট"
      datasets: [{
        data: [income, expense], // Only income/expense
        backgroundColor: ["#4CAF50", "#F44336"], // Removed yellow
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16 }
        },
        datalabels: {
          color: 'blue',
          font: { size: 14, weight: 'bold' },
          formatter: (value, context) => {
            const total = income + expense; // Correct total
            const percentage = (value / total) * 100;
            return percentage.toFixed(1) + "%";
          }
        },
        tooltip: {
          backgroundColor: '#fff', // Visible background
          displayColors: true, // Show color indicators
          titleColor: '#000',
          bodyColor: '#333',
          borderColor: 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          bodyFont: { size: 14 }, // Reasonable size
          callbacks: {
            label: function(context) {
              // ADD MISSING formatTaka FUNCTION!
              return `${context.label}: ${formatTaka(context.parsed)}`;
            }
          }
        }
      }
    },
    plugins: [ChartDataLabels] // Plugin instance
  });
}

// Example number formatter (define this globally)
function formatTaka(value) {
  return '৳' + value.toLocaleString('bn-BD'); 
}
