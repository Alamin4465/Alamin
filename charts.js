// chart.js
// Chart.js ও Datalabels প্লাগিন একবার রেজিস্টার করো
Chart.register(ChartDataLabels);
let summaryChart;
// chart.js
let chartInstance;

function generateCategoryMap(transactions, filterType, type) {
  const map = {};
  transactions.forEach(txn => {
    const txnType = txn.type || "expense";
    if ((filterType !== "all" && txnType !== filterType) || txnType !== type) return;

    const category = txn.category || "অন্যান্য";
    const amount = parseFloat(txn.amount) || 0;

    map[category] = (map[category] || 0) + amount;
  });

  // Sort by amount descending
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [cat, val]) => {
      acc[cat] = val;
      return acc;
    }, {});
}

function renderChart(transactions, filterType = "all") {
  const incomeMap = generateCategoryMap(transactions, filterType, "income");
  const expenseMap = generateCategoryMap(transactions, filterType, "expense");

  const incomeCategories = Object.keys(incomeMap);
  const incomeValues = Object.values(incomeMap);
  const expenseCategories = Object.keys(expenseMap);
  const expenseValues = Object.values(expenseMap);

  const series = [...incomeValues, ...expenseValues];
  const labels = [
    ...incomeCategories.map(c => "আয়: " + c),
    ...expenseCategories.map(c => "ব্যয়: " + c)
  ];

  const incomeColors = incomeValues.map((_, i) => `hsl(145, 60%, ${60 - i * 5}%)`);
  const expenseColors = expenseValues.map((_, i) => `hsl(10, 70%, ${65 - i * 5}%)`);
  const colors = [...incomeColors, ...expenseColors];

  const options = {
        chart: {
          type: 'donut',
          height: 420
        },
        series: series,
        labels: labels,
        colors: colors,
        legend: { position: 'bottom' },
        dataLabels: {
          enabled: true,
          formatter: val => `${val.toFixed(1)}%`
        },
        tooltip: {
          y: {
            formatter: val => `৳ ${val.toLocaleString("bn-BD")}`
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: totalLabel,
                  formatter: function () {
                    return `৳ ${displayTotal.toLocaleString("bn-BD")}`;
                  }
                }
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

function renderSummaryChart(titlePrefix, income, expense) {
  const ctx = document.getElementById("summaryChart").getContext("2d");

  if (summaryChart) {
    summaryChart.destroy();
  }

  const total = income - expense;

  summaryChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["আয়", "ব্যয়", "মোট"],
      datasets: [{
        data: [income, expense, Math.abs(total)],
        backgroundColor: ["#4caf50", "#f44336", "#ffeb3b"],
        borderColor: "#fff",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        // Tooltip: টাকা বড় ফন্টে
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${formatTaka(value)}`;
            },
            labelTextColor: () => '#ffeb3b',
            titleFont: { size: 18 },
            bodyFont: { size: 18 } // বড় ফন্টে টাকা
          }
        },
        // Title
        title: {
          display: true,
          text: `${titlePrefix}`,
          font: { size: 18 }
        },
        // Percent display inside slices
        datalabels: {
          color: "#000",
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value, context) => {
            const data = context.chart.data.datasets[0].data;
            const sum = data.reduce((a, b) => a + b, 0);
            const percentage = ((value / sum) * 100).toFixed(1);
            return `${percentage}%`;
          }
        },
        legend: {
          labels: {
            font: { size: 18}
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}
