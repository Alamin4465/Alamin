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
    .where("timestamp", ">=", start)
    .where("timestamp", "<", end)
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
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let prevBalance = 0;

  const db = firebase.firestore();
  const transactionRef = db.collection("users").doc(userId).collection("transactions");

  transactionRef
    .where("timestamp", ">=", prevMonthStart)
    .where("timestamp", "<", currentMonthStart)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "income") prevBalance += data.amount || 0;
        else if (data.type === "expense") prevBalance -= data.amount || 0;
      });

      return transactionRef
        .where("timestamp", ">=", currentMonthStart)
        .where("timestamp", "<", currentMonthEnd)
        .get();
    })
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "income") monthlyIncome += data.amount || 0;
        else if (data.type === "expense") monthlyExpense += data.amount || 0;
      });

      const total = prevBalance + monthlyIncome - monthlyExpense;
      const monthName = new Date(currentMonthStart).toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const summaryTable = document.getElementById("monthlySummary");
      summaryTable.innerHTML = `
        <thead>
          <tr>
            <th>মাস</th>
            <th>বিবরণ</th>
            <th>আয় টাকা</th>
            <th>ব্যয় টাকা</th>
            <th>টাকা</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${monthName}</td>
            <td>লাস্ট টাকা</td>
            <td></td>
            <td></td>
            <td>${formatTaka(prevBalance)}</td>
          </tr>
          <tr>
            <td></td>
            <td>আয়</td>
            <td>${formatTaka(monthlyIncome)}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>ব্যয়</td>
            <td></td>
            <td>${formatTaka(monthlyExpense)}</td>
            <td>${formatTaka(prevBalance + monthlyIncome - monthlyExpense)}</td>
          </tr>
          <tr>
            <td></td>
            <td>মোট টাকা</td>
            <td></td>
            <td></td>
            <td>${formatTaka(total)}</td>
          </tr>
        </tbody>
      `;
      summaryTable.style.display = "table";
    });
}

function formatTaka(amount) {
  return "৳" + Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
