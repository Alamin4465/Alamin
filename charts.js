// chart.js

let summaryChart;let chartInstance;

function toBanglaNumber(num) {
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return num.toString().split('').map(d => banglaDigits[d] || d).join('');
}

function renderChart(transactions, filterType = "all") {
  const incomeCategoryMap = {};
  const expenseCategoryMap = {};

  transactions.forEach(txn => {
    const type = txn.type || "expense";
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

  const incomeCategories = Object.keys(incomeCategoryMap);
  const incomeValues = Object.values(incomeCategoryMap);

  const expenseCategories = Object.keys(expenseCategoryMap);
  const expenseValues = Object.values(expenseCategoryMap);

  const series = [...incomeValues, ...expenseValues];
  const labels = [...incomeCategories.map(c => "আয়: " + c), ...expenseCategories.map(c => "ব্যয়: " + c)];

  // আয় এর জন্য সবুজের বিভিন্ন শেড, প্রয়োজন অনুসারে বাড়িয়ে নিতে পারো
  const incomeColors = [
    '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9'
  ];

  // ব্যয়ের জন্য লালের বিভিন্ন শেড
  const expenseColors = [
    '#F44336', '#EF5350', '#E57373', '#EF9A9A', '#FFCDD2', '#FFEBEE'
  ];

  // রঙ এর সংখ্যা আয় ও ব্যয়ের ক্যাটেগরির সংখ্যার সাথে মেলে দিতে হবে
  // যদি ক্যাটেগরি বেশি হয়, তাহলে রঙগুলো পুনরাবৃত্তি করবে
  function generateColors(baseColors, count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  const colors = [...generateColors(incomeColors, incomeCategories.length), ...generateColors(expenseColors, expenseCategories.length)];

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
