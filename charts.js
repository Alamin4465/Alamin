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
