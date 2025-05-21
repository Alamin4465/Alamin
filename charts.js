function renderCategoryChart(userId) {
  const db = firebase.firestore();
  db.collection("users").doc(userId).collection("transactions").get().then(snapshot => {
    const incomeCategories = {};
    const expenseCategories = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const type = data.type || "";
      const category = data.category || "অন্যান্য";
      const amount = parseFloat(data.amount) || 0;

      if (type === "income") {
        incomeCategories[category] = (incomeCategories[category] || 0) + amount;
      } else if (type === "expense") {
        expenseCategories[category] = (expenseCategories[category] || 0) + amount;
      }
    });

    const labels = Array.from(new Set([...Object.keys(incomeCategories), ...Object.keys(expenseCategories)]));
    const incomeData = labels.map(label => incomeCategories[label] || 0);
    const expenseData = labels.map(label => expenseCategories[label] || 0);

    const options = {
      chart: { type: 'donut', width: 500 },
      series: [...incomeData, ...expenseData],
      labels: [...labels.map(l => "আয় - " + l), ...labels.map(l => "ব্যয় - " + l)],
      title: { text: "আয় ও ব্যয় (ক্যাটাগরি অনুযায়ী)" },
      plotOptions: { pie: { donut: { size: '45%' } } },
      legend: { position: 'bottom' },
      tooltip: { y: { formatter: val => '৳' + val.toLocaleString('bn-BD') } }
    };

    const chartEl = document.querySelector("#categoryChart");
    if(chartEl) {
      if(window.categoryChartInstance) window.categoryChartInstance.destroy();
      window.categoryChartInstance = new ApexCharts(chartEl, options);
      window.categoryChartInstance.render();
    }
  });
}

function render3DMonthlyLevelChart(userId) {
  const db = firebase.firestore();
  db.collection("users").doc(userId).collection("transactions").get().then(snapshot => {
    const monthData = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.date || "";
      const type = data.type || "";
      const amount = parseFloat(data.amount) || 0;
      const month = date.substring(0, 7); // YYYY-MM

      if (!monthData[month]) monthData[month] = { income: 0, expense: 0 };
      if (type === "income") monthData[month].income += amount;
      else if (type === "expense") monthData[month].expense += amount;
    });

    const months = Object.keys(monthData).sort();
    // Google Charts array format: [Label, Income, Income Label, Expense, Expense Label, Saving, Saving Label]
    const dataArray = [['মাস', 'আয়', { role: 'annotation' }, 'ব্যয়', { role: 'annotation' }, 'সঞ্চয়', { role: 'annotation' }, { role: 'style' }]];

    months.forEach(month => {
      const income = monthData[month].income;
      const expense = monthData[month].expense;
      const saving = income - expense;

      // কালার লেভেল: সঞ্চয় > 0 হলুদ, আয় গ্রিন, ব্যয় রেড
      dataArray.push([
        month,
        income, '৳' + income.toLocaleString('bn-BD'),
        expense, '৳' + expense.toLocaleString('bn-BD'),
        saving, '৳' + saving.toLocaleString('bn-BD'),
        // Color for entire bar group (আয়=green, ব্যয়=red, সঞ্চয়=gold)
        null // আমরা আলাদা আলাদা রঙ ব্যবহার করব তাই এখানে null দিলাম
      ]);
    });

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(() => {
      const data = google.visualization.arrayToDataTable(dataArray);

      const options = {
        title: 'মাসভিত্তিক আয়, ব্যয় ও সঞ্চয় (৩D লেভেল)',
        isStacked: false,
        height: 500,
        width: 900,
        bar: { groupWidth: '75%' },
        legend: { position: 'top' },
        vAxis: { minValue: 0 },
        is3D: true,
        seriesType: 'bars',
        colors: ['green', 'red', 'gold'],
        annotations: {
          alwaysOutside: true,
          textStyle: { fontSize: 12, color: '#000', auraColor: 'none' }
        }
      };

      const chart = new google.visualization.ColumnChart(document.getElementById('monthly3dChart'));
      chart.draw(data, options);
    });
  });
}

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    renderCategoryChart(user.uid);
    render3DMonthlyLevelChart(user.uid);
  }
});
