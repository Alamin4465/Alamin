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
        width: 500
      },
      series: [...incomeData, ...expenseData],
      labels: [...labels.map(l => "আয় - " + l), ...labels.map(l => "ব্যয় - " + l)],
      title: { text: "আয় ও ব্যয় (ক্যাটাগরি অনুযায়ী)" },
      plotOptions: {
        pie: {
          donut: { size: '45%' }
        }
      }
    };

    const chart = new ApexCharts(document.querySelector("#categoryChart"), options);
    chart.render();
  });
}

function renderMonthlyChart(userId) {
  const db = firebase.firestore();
  db.collection("users").doc(userId).collection("transactions").get().then(snapshot => {
    const monthData = {};

    snapshot.forEach(doc => {
      const { date, type, amount } = doc.data();
      const month = (date || "").substring(0, 7); // YYYY-MM
      if (!monthData[month]) monthData[month] = { income: 0, expense: 0 };

      if (type === "income") monthData[month].income += parseFloat(amount);
      else if (type === "expense") monthData[month].expense += parseFloat(amount);
    });

    const months = Object.keys(monthData).sort();
    const incomeSeries = months.map(m => monthData[m].income);
    const expenseSeries = months.map(m => monthData[m].expense);
    const balanceSeries = months.map(m => monthData[m].income - monthData[m].expense);

    const options = {
      chart: {
        type: 'bar',
        height: 400,
        stacked: false,
        toolbar: { show: true }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          endingShape: 'rounded'
        }
      },
      series: [
        { name: 'আয়', data: incomeSeries },
        { name: 'ব্যয়', data: expenseSeries },
        { name: 'সঞ্চয়', data: balanceSeries }
      ],
      xaxis: { categories: months },
      title: { text: 'মাসভিত্তিক আয়, ব্যয় ও সঞ্চয়' },
      dataLabels: { enabled: true }
    };

    const chart = new ApexCharts(document.querySelector("#monthlyChart"), options);
    chart.render();
  });
}

// ইউজার লগইন চেক করে চার্ট রেন্ডারিং
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    renderCategoryChart(user.uid);
    renderMonthlyChart(user.uid);
  }
});

function render3DMonthlyLevelChart(userId) {
  const db = firebase.firestore();
  db.collection("users").doc(userId).collection("transactions").get().then(snapshot => {
    const monthData = {};

    snapshot.forEach(doc => {
      const { date, type, amount } = doc.data();
      const month = (date || "").substring(0, 7); // YYYY-MM
      if (!monthData[month]) monthData[month] = { income: 0, expense: 0 };

      if (type === "income") monthData[month].income += parseFloat(amount);
      else if (type === "expense") monthData[month].expense += parseFloat(amount);
    });

    const months = Object.keys(monthData).sort();
    const dataArray = [['মাস', 'আয়', { role: 'style' }, 'ব্যয়', { role: 'style' }, 'সঞ্চয়', { role: 'style' }]];

    months.forEach(month => {
      const income = monthData[month].income;
      const expense = monthData[month].expense;
      const saving = income - expense;

      dataArray.push([
        month,
        income, 'color: green',
        expense, 'color: red',
        saving, 'color: gold'
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
        // 3D ইফেক্টের জন্য
        is3D: true
      };

      const chart = new google.visualization.ColumnChart(document.getElementById('monthly3dChart'));
      chart.draw(data, options);
    });
  });
}

// লগইন হওয়ার পরে কল করুন
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    render3DMonthlyLevelChart(user.uid);
  }
});
