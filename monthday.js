// রিসেট বাটনে ক্লিক করলে সব ক্লিয়ার
document.getElementById("resetFilterBtn").addEventListener("click", () => {
  document.getElementById("dateFilter").value = "";
  document.getElementById("monthFilter").value = "";
  document.querySelector("#filteredTable tbody").innerHTML = "";
  document.getElementById("monthlySummary").style.display = "none";
});

// তারিখ অনুযায়ী টেবিল ফিল্টার (মোট টাকা সহ)
function filterByDate(userId, date) {
  const db = firebase.firestore();
  const tbody = document.querySelector("#filteredTable tbody");
  tbody.innerHTML = "";

  let totalIncome = 0;
  let totalExpense = 0;

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .where("date", "==", date)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const income = data.type === "income" ? data.amount || 0 : 0;
        const expense = data.type === "expense" ? data.amount || 0 : 0;

        totalIncome += income;
        totalExpense += expense;

        const incomeFormatted = data.type === "income" ? formatTaka(income) : "";
        const expenseFormatted = data.type === "expense" ? formatTaka(expense) : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.date || ""}</td>
          <td>${data.category || ""}</td>
          <td>${incomeFormatted}</td>
          <td>${expenseFormatted}</td>
        `;
        tbody.appendChild(tr);
      });

      // মোট সারি যোগ করা
      const totalRow = document.createElement("tr");
      totalRow.innerHTML = `
        <td colspan="2" style="font-weight: bold;">মোট</td>
        <td style="font-weight: bold;">${formatTaka(totalIncome)}</td>
        <td style="font-weight: bold;">${formatTaka(totalExpense)}</td>
      `;
      tbody.appendChild(totalRow);

      // নিট টাকা সারি যোগ করা
      const netRow = document.createElement("tr");
      netRow.innerHTML = `
        <td colspan="3" style="font-weight: bold; text-align: right;">মোট টাকা (আয় - ব্যয়)</td>
        <td style="font-weight: bold;">${formatTaka(totalIncome - totalExpense)}</td>
      `;
      tbody.appendChild(netRow);
    });
}


// টাকা ফরম্যাট বাংলায়
function formatTaka(amount) {
  return "৳" + Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
