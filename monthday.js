document.getElementById("dateFilter").addEventListener("change", () => {
  const date = document.getElementById("dateFilter").value;
  if (date) {
    const user = firebase.auth().currentUser;
    if (user) filterByDate(user.uid, date);
    document.getElementById("monthlySummary").style.display = "none";
  }
});

document.getElementById("monthFilter").addEventListener("change", () => {
  const month = document.getElementById("monthFilter").value;
  if (month) {
    const user = firebase.auth().currentUser;
    if (user) {
      const formattedMonth = new Date(month + "-01").toLocaleString("en-US", {
        year: "numeric",
        month: "short"
      });
      document.getElementById("monthName").textContent = formattedMonth;
      filterByMonth(user.uid, month);
      calculateMonthlySummary(user.uid, month);
    }
  }
});

document.getElementById("resetFilterBtn").addEventListener("click", () => {
  document.getElementById("dateFilter").value = "";
  document.getElementById("monthFilter").value = "";
  document.querySelector("#filteredTable tbody").innerHTML = "";
  document.getElementById("monthlySummary").style.display = "none";
});

function filterByDate(userId, date) {
  const db = firebase.firestore();
  const tbody = document.querySelector("#filteredTable tbody");
  tbody.innerHTML = "";

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .where("date", "==", date)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const tr = document.createElement("tr");
        const income = data.type === "income" ? formatTaka(data.amount) : "";
        const expense = data.type === "expense" ? formatTaka(data.amount) : "";
        tr.innerHTML = `
          <td>${data.date || ""}</td>
          <td>${data.category || ""}</td>
          <td>${income}</td>
          <td>${expense}</td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function filterByMonth(userId, month) {
  const db = firebase.firestore();
  const tbody = document.querySelector("#filteredTable tbody");
  tbody.innerHTML = "";

  const [year, mon] = month.split("-");
  const start = new Date(`${year}-${mon}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .where("timestamp", ">=", firebase.firestore.Timestamp.fromDate(start))
    .where("timestamp", "<", firebase.firestore.Timestamp.fromDate(end))
    .orderBy("timestamp", "asc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const income = data.type === "income" ? formatTaka(data.amount) : "";
        const expense = data.type === "expense" ? formatTaka(data.amount) : "";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.date || ""}</td>
          <td>${data.category || ""}</td>
          <td>${income}</td>
          <td>${expense}</td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function calculateMonthlySummary(userId, month) {
  const [year, mon] = month.split("-");
  const currentMonthStart = new Date(`${year}-${mon}-01`);
  const currentMonthEnd = new Date(currentMonthStart);
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);

  const prevMonthStart = new Date(currentMonthStart);
  const prevMonthEnd = new Date(currentMonthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let prevBalance = 0;

  const db = firebase.firestore();
  const transactionRef = db.collection("users").doc(userId).collection("transactions");

  transactionRef
    .where("timestamp", ">=", firebase.firestore.Timestamp.fromDate(prevMonthStart))
    .where("timestamp", "<", firebase.firestore.Timestamp.fromDate(currentMonthStart))
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "income") prevBalance += data.amount || 0;
        else if (data.type === "expense") prevBalance -= data.amount || 0;
      });

      return transactionRef
        .where("timestamp", ">=", firebase.firestore.Timestamp.fromDate(currentMonthStart))
        .where("timestamp", "<", firebase.firestore.Timestamp.fromDate(currentMonthEnd))
        .get();
    })
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "income") monthlyIncome += data.amount || 0;
        else if (data.type === "expense") monthlyExpense += data.amount || 0;
      });

      const total = prevBalance + monthlyIncome - monthlyExpense;

      document.getElementById("prevBalance").textContent = formatTaka(prevBalance);
      document.getElementById("monthlyIncome").textContent = formatTaka(monthlyIncome);
      document.getElementById("monthlyExpense").textContent = formatTaka(monthlyExpense);
      document.getElementById("totalBalance").textContent = formatTaka(total);

      document.getElementById("monthlySummary").style.display = "table";
    });
}

function formatTaka(amount) {
  return "৳" + Number(amount).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
