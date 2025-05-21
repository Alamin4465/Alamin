function renderChart(transactions, filterType) {
  const categoryMap = {};

  transactions.forEach(txn => {
    if (filterType !== "all" && txn.type !== filterType) return;

    const category = txn.category || "অন্যান্য";
    const amount = parseFloat(txn.amount || 0);

    if (!categoryMap[category]) {
      categoryMap[category] = 0;
    }
    categoryMap[category] += amount;
  });

  const categories = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  const options = {
    chart: {
      type: 'donut',
      height: 350
    },
    series: values,
    labels: categories,
    colors: ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0', '#3F51B5', '#009688'],
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      formatter: function (val, opts) {
        const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
        const formatted = val.toFixed(1).split('').map(d => banglaDigits[d] || d).join('');
        return formatted + '%';
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return toBanglaNumber(val);
        }
      }
    }
  };

  // Chart container id="categoryChart"
  const chartContainer = document.querySelector("#categoryChart");

  if (window.chart) {
    window.chart.updateOptions(options);
    window.chart.updateSeries(values);
  } else {
    window.chart = new ApexCharts(chartContainer, options);
    window.chart.render();
  }
}
