document.getElementById("applyDateFilter").addEventListener("click", () => {
  const monthValue = document.getElementById("monthFilter").value;  // Format: YYYY-MM
  const dateValue = document.getElementById("dateFilter").value;    // Format: YYYY-MM-DD
  const user = firebase.auth().currentUser;
  if (!user) return;

  const userId = user.uid;
  const db = firebase.firestore();
  const filteredTableBody = document.querySelector("#filteredTransactionTable tbody");
  filteredTableBody.innerHTML = "";

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .orderBy("timestamp", "desc")
    .get()
    .then(snapshot => {
      let filteredData = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.date; // "YYYY-MM-DD"

        if (monthValue && date.startsWith(monthValue)) {
          filteredData.push(data);
        } else if (dateValue && date === dateValue) {
          filteredData.push(data);
        }
      });

      let totalIncome = 0;
      let totalExpense = 0;

      filteredData.forEach(data => {
        const incomeAmount = data.type === "income" ? data.amount : "";
        const expenseAmount = data.type === "expense" ? data.amount : "";

        if (data.type === "income") totalIncome += parseFloat(data.amount);
        if (data.type === "expense") totalExpense += parseFloat(data.amount);

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.date}</td>
          <td>${data.category}</td>
          <td>${incomeAmount}</td>
          <td>${expenseAmount}</td>
        `;
        filteredTableBody.appendChild(row);
      });

      if (filteredData.length === 0) {
        filteredTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">কোনো লেনদেন পাওয়া যায়নি</td></tr>`;
        return;
      }

      const summaryRow = document.createElement("tr");
      summaryRow.innerHTML = `
        <td colspan="2" style="font-weight:bold;">মোট</td>
        <td style="font-weight:bold;">${totalIncome.toFixed(2)}</td>
        <td style="font-weight:bold;">${totalExpense.toFixed(2)}</td>
      `;
      filteredTableBody.appendChild(summaryRow);
    });
});
