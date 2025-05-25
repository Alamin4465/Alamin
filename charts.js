// chart.js

let summaryChart;

// chart.js

let chartInstance;

function toBanglaNumber(num) {
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return num.toString().split('').map(d => banglaDigits[d] || d).join('');
}

function renderChart(transactions, filterType = "all") {
  // আয় এবং ব্যয়ের জন্য আলাদা categoryMap
  const incomeCategoryMap = {};
  const expenseCategoryMap = {};

  transactions.forEach(txn => {
    const type = txn.type || "expense"; // ডিফল্ট ব্যয় ধরে নিচ্ছি
    if (filterType !== "all" && type !== filterType) return;

    const category = txn.category || "অন্যান্য";
    const amount = parseFloat(txn.amount) || 0;

    if (type === "income") {
      if (!incomeCategoryMap[category]) incomeCategoryMap[category] = 0;
      incomeCategoryMap[category] += amount;
    } else if (type === "expense") {
      if (!expenseCategoryMap[category]) expenseCategoryMap[category] = 0;
      expenseCategoryMap[category] += amount;
    }
  });

  // আয় ক্যাটেগরি লেবেল ও মান
  const incomeCategories = Object.keys(incomeCategoryMap);
  const incomeValues = Object.values(incomeCategoryMap);

  // ব্যয় ক্যাটেগরি লেবেল ও মান
  const expenseCategories = Object.keys(expenseCategoryMap);
  const expenseValues = Object.values(expenseCategoryMap);

  // সিরিজ ও লেবেল একত্রে
  const series = [...incomeValues, ...expenseValues];
  const labels = [...incomeCategories.map(c => "আয়: " + c), ...expenseCategories.map(c => "ব্যয়: " + c)];

  const options = {
    chart: {
      type: 'pie',
      height: 350,
      width: '100%',
      toolbar: { show: false }
    },
    series: series,
    labels: labels,
    colors: [
      '#4CAF50', '#66BB6A', '#81C784', // আয় জন্য সবুজ শেড
      '#F44336', '#EF5350', '#E57373'  // ব্যয় জন্য লাল শেড
    ],
    legend: { position: 'bottom' },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return toBanglaNumber(val.toFixed(1)) + '%';
      },
      style: { fontSize: '14px', fontWeight: 'bold' }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return toBanglaNumber(val.toFixed(2)) + ' টাকা';
        }
      }
    },
    fill: { type: 'gradient' },
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

function renderSummaryChart(title, income, expense) {
  const ctx = document.getElementById("summaryChart").getContext("2d");
  const total = income - expense;

  if (summaryChart) {
    summaryChart.destroy();
  }

  summaryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['আয়', 'ব্যয়', 'মোট'],
      datasets: [{
        label: title,
        data: [income, expense, total],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: title,
          font: { size: 18, weight: 'bold' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '৳' + value.toLocaleString("en-BD");
            }
          }
        }
      }
    }
  });
}
