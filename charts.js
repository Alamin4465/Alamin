// ক্যাটাগরি অনুযায়ী আয়/ব্যয় ডোনাট চার্ট (ApexCharts)
function renderCategoryChart(userId) {
  const db = firebase.firestore();
  db.collection("users").doc(userId).collection("transactions").get().then(snapshot => {
    const incomeCategories = {};
    const expenseCategories = {};

    snapshot.forEach(doc => {
      const { type, category, amount } = doc.data();
      if (type === "income") {
        incomeCategories[category] = (incomeCategories[category] || 0) + parseFloat(amount);
      } else if (type === "expense") {
        expenseCategories[category] = (expenseCategories[category] || 0) + parseFloat(amount);
      }
    });

    const labels = Array.from(new Set([...Object.keys(incomeCategories), ...Object.keys(expenseCategories)]));
    const incomeData = labels.map(label => incomeCategories[label] || 0);
    const expenseData = labels.map(label => expenseCategories[label] || 0);

    const options = {
      chart: {
        type: 'donut',
        background: 'transparent',
        width: '100%'
      },
      series: [...incomeData, ...expenseData],
      labels: [...labels.map(l => "আয় - " + l), ...labels.map(l => "ব্যয় - " + l)],
      title: {
        text: "আয় ও ব্যয় (ক্যাটাগরি অনুযায়ী)",
        align: 'center'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '45%'
          }
        }
      },
      colors: ['#28a745', '#17a2b8', '#ffc107', '#dc3545', '#6f42c1', '#20c997']
    };

    const chart = new ApexCharts(document.querySelector("#categoryChart"), options);
    chart.render();
  });
}

// মাসভিত্তিক আয়/ব্যয়/সঞ্চয় কলাম চার্ট (Google Charts)
function render3DMonthlyLevelChart(userId) {
  const db = firebase.firestore();
  db.collection("users").doc(userId).collection("transactions").get().then(snapshot => {
    const monthData = {};

    snapshot.forEach(doc => {
      const { date, type, amount } = doc.data();
      const month = (date || "").substring(0, 7); // "YYYY-MM"
      if (!monthData[month]) monthData[month] = { income: 0, expense: 0 };

      if (type === "income") monthData[month].income += parseFloat(amount);
      else if (type === "expense") monthData[month].expense += parseFloat(amount);
    });

    const months = Object.keys(monthData).sort();
    const dataArray = [['মাস', 'আয়', { role: 'style' }, { role: 'annotation' }, 'ব্যয়', { role: 'style' }, { role: 'annotation' }, 'সঞ্চয়', { role: 'style' }, { role: 'annotation' }]];

    months.forEach(month => {
      const income = monthData[month].income;
      const expense = monthData[month].expense;
      const saving = income - expense;

      dataArray.push([
        month,
        income, 'color: green', income.toFixed(0) + '৳',
        expense, 'color: red', expense.toFixed(0) + '৳',
        saving, 'color: gold', saving.toFixed(0) + '৳'
      ]);
    });

    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      const data = google.visualization.arrayToDataTable(dataArray);

      const options = {
        title: 'মাসভিত্তিক আয়, ব্যয় ও সঞ্চয় (৩D লেভেল)',
        isStacked: false,
        height: 500,
        width: '100%',
        bar: { groupWidth: '70%' },
        legend: { position: 'top' },
        vAxis: { minValue: 0 },
        backgroundColor: 'transparent',
        annotations: {
          alwaysOutside: true
        }
      };

      const chart = new google.visualization.ColumnChart(document.getElementById('monthly3dChart'));
      chart.draw(data, options);
    });
  });
}

// ইউজার লগইন হলে চার্ট রেন্ডার
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    renderCategoryChart(user.uid);
    render3DMonthlyLevelChart(user.uid);
  }
});
