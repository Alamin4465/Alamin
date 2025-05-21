// chart.js

let chartInstance;

function renderCategoryChart(data, type) {
  const categories = {};
  data.forEach(item => {
    if (item.type === type || type === "all") {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category] += parseFloat(item.amount);
    }
  });

  const labels = Object.keys(categories);
  const values = Object.values(categories);

  const options = {
    series: values,
    chart: {
      width: "100%",
      type: "pie",
      toolbar: {
        show: false
      }
    },
    labels: labels,
    theme: {
      monochrome: {
        enabled: true,
        color: '#4e73df',
        shadeTo: 'light',
        shadeIntensity: 0.65
      }
    },
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false
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
    },
    fill: {
      type: 'gradient'
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 'bold'
      }
    }
  };

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new ApexCharts(document.querySelector("#categoryChart"), options);
  chartInstance.render();
}
