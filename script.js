firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    const userId = user.uid;
    const transactionForm = document.getElementById("transactionForm");
    const tableBody = document.querySelector("#transactionTable tbody");
    const totalIncomeEl = document.getElementById("totalIncome");
    const totalExpenseEl = document.getElementById("totalExpense");
    const balanceEl = document.getElementById("balance");

    // লগআউট
    document.getElementById("logoutBtn").addEventListener("click", () => {
      firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
      });
    });

    // ডেটা সাবমিট
    transactionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const date = document.getElementById("date").value;
      const type = document.getElementById("type").value;
      const category = document.getElementById("category").value.trim();
      const amount = parseFloat(document.getElementById("amount").value);

      if (!date || !type || !category || isNaN(amount)) return;

      const timestamp = firebase.firestore.Timestamp.fromDate(new Date(date));

      db.collection("users").doc(userId).collection("transactions").add({
        date,
        type,
        category,
        amount,
        timestamp,
        userId
      }).then(() => {
        transactionForm.reset();
        loadTransactions();
      });
    });

    // লোড ফাংশন
    function loadTransactions() {
      db.collection("users").doc(userId).collection("transactions")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
          tableBody.innerHTML = "";
          let totalIncome = 0;
          let totalExpense = 0;

          querySnapshot.forEach((doc) => {
            const data = doc.data();

            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${data.date}</td>
              <td>${data.type}</td>
              <td>${data.category}</td>
              <td>${data.amount}</td>
              <td><button data-id="${doc.id}" class="deleteBtn">ডিলিট</button></td>
            `;
            tableBody.appendChild(row);

            if (data.type === "income") {
              totalIncome += data.amount;
            } else {
              totalExpense += data.amount;
            }
          });

          totalIncomeEl.textContent = totalIncome;
          totalExpenseEl.textContent = totalExpense;
          balanceEl.textContent = totalIncome - totalExpense;

          // ডিলিট
          document.querySelectorAll(".deleteBtn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const docId = btn.getAttribute("data-id");
              db.collection("users").doc(userId).collection("transactions").doc(docId).delete()
                .then(() => loadTransactions());
            });
          });
        });
    }

    loadTransactions();
  }
});
