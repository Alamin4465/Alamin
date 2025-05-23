// ডেট ফিল্টার পরিবর্তনে
document.getElementById("dateFilter").addEventListener("change", () => {
  const date = document.getElementById("dateFilter").value;
  if (date) {
    const user = firebase.auth().currentUser;
    if (user) {
      filterByDate(user.uid, date);
      calculateDailySummary(user.uid, date);
    }
  }
});

// মাস ফিল্টার পরিবর্তনে
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

// রিসেট বাটনে ক্লিক করলে সব ক্লিয়ার
document.getElementById("resetFilterBtn").addEventListener("click", () => {
  document.getElementById("dateFilter").value = "";
  document.getElementById("monthFilter").value = "";
  document.querySelector("#filteredTable tbody").innerHTML = "";
  document.getElementById("monthlySummary").style.display = "none";
});

// তারিখ অনুসারে ফিল্টার
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

// মাস অনুসারে ফিল্টার
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

// মাস ভিত্তিক সামারি
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
      const monthName = new Date(currentMonthStart).toLocaleString("bn-BD", {
        month: "short",
        year: "numeric",
      });

      const summaryTable = document.getElementById("monthlySummary");
      summaryTable.innerHTML = `
        <thead>
          <tr>
            <th>মাস</th>
            <th>বিবরণ</th>
            <th>আয়</th>
            <th>ব্যয়</th>
            <th>টাকা</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="4" style="border: 2px solid #000; color: black;">${monthName}</td>
            <td>শেষ টাকা</td>
            <td></td>
            <td></td>
            <td>${formatTaka(prevBalance)}</td>
          </tr>
          <tr>
            
            <td>মাসের আয়</td>
            <td>${formatTaka(monthlyIncome)}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            
            <td>মাসের ব্যয়</td>
            <td></td>
            <td>${formatTaka(monthlyExpense)}</td>
            <td>${formatTaka(total)}</td>
          </tr>
          <tr>
          
            <td>মোট</td>
            <td></td>
            <td></td>
            <td>${formatTaka(total)}</td>
          </tr>
        </tbody>
      `;
      summaryTable.style.display = "table";
    });
}

// তারিখ ভিত্তিক সামারি
function calculateDailySummary(userId, date) {
  const selectedDate = new Date(date);
  const prevDate = new Date(selectedDate);
  prevDate.setDate(prevDate.getDate() - 1);

  let income = 0;
  let expense = 0;
  let prevBalance = 0;

  const db = firebase.firestore();
  const transactionRef = db.collection("users").doc(userId).collection("transactions");

  transactionRef
    .where("timestamp", ">=", new Date(prevDate.setHours(0, 0, 0, 0)))
    .where("timestamp", "<", new Date(prevDate.setHours(23, 59, 59, 999)))
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "income") prevBalance += data.amount || 0;
        else if (data.type === "expense") prevBalance -= data.amount || 0;
      });

      return transactionRef
        .where("timestamp", ">=", new Date(selectedDate.setHours(0, 0, 0, 0)))
        .where("timestamp", "<", new Date(selectedDate.setHours(23, 59, 59, 999)))
        .get();
    })
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "income") income += data.amount || 0;
        else if (data.type === "expense") expense += data.amount || 0;
      });

      const total = prevBalance + income - expense;
      const dateLabel = new Date(date).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      const summaryTable = document.getElementById("monthlySummary");
      summaryTable.innerHTML = `
        <thead>
          <tr>
            <th>তারিখ</th>
            <th>বিবরণ</th>
            <th>আয়</th>
            <th>ব্যয়</th>
            <th>টাকা</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="4" style="border: 2px solid #000; color: black;">${dateLabel}</td>
            <td colspan="3">শেষ টাকা</td>
            
            <td>${formatTaka(prevBalance)}</td>
          </tr>
          <tr>
            
            <td>আজকের আয়</td>
            <td>${formatTaka(income)}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>আজকের ব্যয়</td>
            <td></td>
            <td>${formatTaka(expense)}</td>
            <td>${formatTaka(prevBalance + income - expense)}</td>
          </tr>
          <tr>
            
            <td>মোট</td>
            <td></td>
            <td></td>
            <td>${formatTaka(total)}</td>
          </tr>
        </tbody>
      `;
      summaryTable.style.display = "table";
    });
}

// টাকা ফরম্যাট বাংলায়
function formatTaka(amount) {
  return "৳" + Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
