let chartInstance;

function toBanglaNumber(num) {
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return num.toString().split('').map(d => banglaDigits[d] || d).join('');
}

function renderChart(transactions, filterType = "all") {
  const categoryMap = {};

  transactions.forEach(txn => {
    if (filterType !== "all" && txn.type !== filterType) return;
    const category = txn.category || "অন্যান্য";
    const amount = parseFloat(txn.amount) || 0;
    if (!categoryMap[category]) {
      categoryMap[category] = 0;
    }
    categoryMap[category] += amount;
  });

  const categories = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  const options = {
    chart: {
      type: 'pie',
      height: 350,
      width: '100%',
      toolbar: { show: false }
    },
    series: values,
    labels: categories,
    colors: ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0', '#3F51B5', '#009688'],
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
    chartInstance.updateSeries(values);
  } else {
    chartInstance = new ApexCharts(document.querySelector("#categoryChart"), options);
    chartInstance.render();
  }
}
// Chart.js দিয়ে সারাংশ চার্ট তৈরি
let summaryChart; // রেফারেন্স রাখার জন্য

function renderSummaryChart(title, income, expense) {
  const ctx = document.getElementById("summaryChart").getContext("2d");
  const total = income - expense;

  if (summaryChart) {
    summaryChart.destroy(); // আগের চার্ট মুছে ফেলি
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
        legend: {
          display: false
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 18,
            weight: 'bold'
          }
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
