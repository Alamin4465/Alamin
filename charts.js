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
          dropShadow: { enabled: true, top: 1, left: 1, blur: 2, opacity: 0.5 }
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

function updateMonthlyChart(month, income, expense, total) {
  // উদাহরণ: চার্ট.js ব্যবহার করে বার চার্ট আপডেট
  const ctx = document.getElementById("monthlyChart").getContext("2d");

  if (window.monthlyChartInstance) {
    window.monthlyChartInstance.destroy();
  }

  window.monthlyChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["আয়", "ব্যয়", "মোট"],
      datasets: [{
        label: month,
        data: [income, expense, total],
        backgroundColor: ["green", "red", "blue"]
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
          text: `${month} মাসের সারসংক্ষেপ`
        }
      }
    }
  });
}
