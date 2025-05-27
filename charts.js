// chart.js

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
      formatter: function (val) {
        return toBanglaNumber(val.toFixed(1)) + '%';
      },
      style: { fontSize: '14px', fontWeight: 'bold' }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return toBanglaNumber(val.toFixed(2)) + ' টাকা';
        }
      }
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
