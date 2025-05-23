// charts.js

let categoryChartInstance;
let summaryChartInstance;

function toBanglaNumber(num) {
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return num.toString().split('').map(d => banglaDigits[d] || d).join('');
}

function formatTaka(amount) {
  return "৳" + Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function renderCategoryChart(transactions, filterType = "all") {
  const categoryMap = {};

  transactions.forEach(txn => {
    if (filterType !== "all" && txn.type !== filterType) return;
    const category = txn.category || "অন্যান্য";
    const amount = parseFloat(txn.amount) || 0;
    if (!categoryMap[category]) categoryMap[category] = 0;
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
      formatter: val => toBanglaNumber(val.toFixed(1)) + '%',
      style: { fontSize: '14px', fontWeight: 'bold' }
    },
    tooltip: {
      y: {
        formatter: val => toBanglaNumber(val.toFixed(2)) + ' টাকা'
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

  if (categoryChartInstance) {
    categoryChartInstance.updateOptions(options);
    categoryChartInstance.updateSeries(values);
  } else {
    categoryChartInstance = new ApexCharts(document.querySelector("#categoryChart"), options);
    categoryChartInstance.render();
  }
}

function renderSummaryChart(labelText, income, expense) {
  const ctx = document.getElementById("summaryChart").getContext("2d");

  if (summaryChartInstance) {
    summaryChartInstance.destroy();
  }

  const total = income - expense;

  summaryChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["আয়", "ব্যয়"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#28a745", "#dc3545"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 14 } }
        },
        title: {
          display: true,
          text: `${labelText} | মোট: ${formatTaka(total)}`,
          font: { size: 18 }
        }
      }
    }
  });

  const totalDisplay = document.getElementById("totalAmountDisplay");
  if (totalDisplay) {
    totalDisplay.innerText = `মোট টাকা: ${formatTaka(total)}`;
  }
}
