let chartInstance;

function toBanglaNumber(number) {
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return number.toString().split('').map(ch => {
    if (/\d/.test(ch)) return banglaDigits[ch];
    return ch;
  }).join('');
}

function renderCategoryChart(transactions, filterType = "all") {
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
      type: 'donut',
      height: 350,
      width: '100%',
      toolbar: {
        show: false
      }
    },
    series: values,
    labels: categories,
    colors: ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0', '#3F51B5', '#009688'],
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        // শতাংশ হিসেবে দেখাবে বাংলায়
        return toBanglaNumber(val.toFixed(1)) + '%';
      },
      style: {
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return toBanglaNumber(val.toFixed(2)) + ' টাকা';
        }
      }
    },
    fill: {
      type: 'gradient'
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'মোট',
              formatter: () => toBanglaNumber(values.reduce((a,b) => a+b, 0).toFixed(2)) + ' টাকা'
            }
          }
        },
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
