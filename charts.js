google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawCategoryChart);

function drawCategoryChart() {
  const data = google.visualization.arrayToDataTable([
    ['ক্যাটেগরি', 'টাকা'],
    ['খাদ্য', 1000],
    ['ভাড়া', 800],
    ['পরিবহন', 400],
    ['অন্যান্য', 300]
  ]);

  const options = {
    title: 'খরচের ক্যাটেগরি অনুযায়ী বন্টন',
    is3D: true,
    backgroundColor: 'transparent'
  };

  const chart = new google.visualization.PieChart(document.getElementById('categoryChart'));
  chart.draw(data, options);
}

// ApexCharts Bar Chart (মাসভিত্তিক আয়/ব্যয়)
document.addEventListener("DOMContentLoaded", function () {
  const options = {
    chart: {
      type: 'bar',
      height: 400,
      background: 'transparent'
    },
    series: [{
      name: 'আয়',
      data: [4000, 3000, 4500, 5000, 4700, 5200]
    }, {
      name: 'ব্যয়',
      data: [2800, 2300, 3500, 3000, 3900, 3100]
    }],
    xaxis: {
      categories: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন']
    },
    colors: ['#28a745', '#dc3545'],
    title: {
      text: 'মাসভিত্তিক আয় ও ব্যয়',
      align: 'center'
    }
  };

  const chart = new ApexCharts(document.querySelector("#monthly3dChart"), options);
  chart.render();
});
