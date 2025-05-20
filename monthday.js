const filterDateInput = document.getElementById("filterDate");
const filterMonthInput = document.getElementById("filterMonth");
const resetFilterBtn = document.getElementById("resetFilter");
const filteredTableBody = document.querySelector("#filteredTable tbody");

filterDateInput.addEventListener("change", () => {
  const user = firebase.auth().currentUser;
  if (user) {
    filterByDate(user.uid, filterDateInput.value);
  }
});

filterMonthInput.addEventListener("change", () => {
  const user = firebase.auth().currentUser;
  if (user) {
    filterByMonth(user.uid, filterMonthInput.value);
  }
});

resetFilterBtn.addEventListener("click", () => {
  filterDateInput.value = "";
  filterMonthInput.value = "";
  filteredTableBody.innerHTML = "";
});

function filterByDate(userId, date) {
  const db = firebase.firestore();
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .where("timestamp", ">=", start)
    .where("timestamp", "<", end)
    .orderBy("timestamp")
    .get()
    .then(snapshot => {
      showFilteredResults(snapshot, date);
    });
}

function filterByMonth(userId, month) {
  const db = firebase.firestore();
  const [year, mon] = month.split("-");
  const start = new Date(`${year}-${mon}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .where("timestamp", ">=", start)
    .where("timestamp", "<", end)
    .orderBy("timestamp")
    .get()
    .then(snapshot => {
      showFilteredResults(snapshot, month);
    });
}

function showFilteredResults(snapshot, label) {
  filteredTableBody.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const income = data.type === "income" ? data.amount : "";
    const expense = data.type === "expense" ? data.amount : "";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.date || label}</td>
      <td>${data.category || ""}</td>
      <td>${income}</td>
      <td>${expense}</td>
    `;
    filteredTableBody.appendChild(row);
  });
}
