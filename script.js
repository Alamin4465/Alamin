let currentFilter = "all";

// ইউজার চেক
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    document.querySelector(".container").style.display = "block";
    loadTransactions(user.uid); // টেবিল
    loadSummary(user.uid);      // সর্বমোট সামারি
    loadUserInfo(user);
  }
});

// ইউজার ইনফো
function loadUserInfo(user) {
  const userInfoDiv = document.getElementById("user-info");
  userInfoDiv.textContent = `স্বাগতম, ${user.email}`;
}

// সবসময়কার সামারি হিসাব (পুরো ডেটা থেকে)
function loadSummary(userId) {
  const db = firebase.firestore();

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .get()
    .then(snapshot => {
      let fullIncome = 0;
      let fullExpense = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);
        if (data.type === "income") fullIncome += amount;
        else if (data.type === "expense") fullExpense += amount;
      });

      const totalBalance = fullIncome - fullExpense;
      const savingsRate = fullIncome > 0 ? (totalBalance / fullIncome) * 100 : 0;

      document.getElementById("alwaysMonthlySavings").textContent = totalBalance.toFixed(2);
      document.getElementById("alwaysSavingsPercentage").textContent = savingsRate.toFixed(2);
    });
}

// ফিল্টার অনুযায়ী টেবিল আপডেট
function loadTransactions(userId) {
  const db = firebase.firestore();
  const tbody = document.querySelector("#transactionTable tbody");

  const totalIncomeEl = document.getElementById("totalIncome");
  const totalExpenseEl = document.getElementById("totalExpense");
  const balanceEl = document.getElementById("balance");

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      let incomeTotal = 0;
      let expenseTotal = 0;
      tbody.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        const type = data.type || "";
        if (currentFilter !== "all" && type !== currentFilter) return;

        const amount = parseFloat(data.amount || 0);
        const row = document.createElement("tr");

        if (type === "income") {
          incomeTotal += amount;
          row.classList.add("income-row");
        } else if (type === "expense") {
          expenseTotal += amount;
          row.classList.add("expense-row");
        }

        row.innerHTML = `
          <td>${data.date || ""}</td>
          <td>${type === "income" ? "আয়" : "ব্যয়"}</td>
          <td>${data.category || ""}</td>
          <td>${amount}</td>
          <td>
            <button class="editBtn" data-id="${doc.id}">এডিট</button>
            <button class="deleteBtn" data-id="${doc.id}">ডিলিট</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      totalIncomeEl.textContent = incomeTotal.toFixed(2);
      totalExpenseEl.textContent = expenseTotal.toFixed(2);
      balanceEl.textContent = (incomeTotal - expenseTotal).toFixed(2);
    });
}

// নতুন ট্রান্সজেকশন যোগ
document.getElementById("transactionForm").addEventListener("submit", submitHandler);

function submitHandler(e) {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) return alert("অনুগ্রহ করে লগইন করুন");

  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);

  firebase.firestore()
    .collection("users")
    .doc(user.uid)
    .collection("transactions")
    .add({
      date,
      type,
      category,
      amount,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      document.getElementById("transactionForm").reset();
    });
}

// ডিলিট / এডিট
document.querySelector("#transactionTable tbody").addEventListener("click", e => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const docId = e.target.getAttribute("data-id");
  const docRef = firebase.firestore().collection("users").doc(user.uid).collection("transactions").doc(docId);

  // ডিলিট
  if (e.target.classList.contains("deleteBtn")) {
    if (confirm("আপনি কি নিশ্চিত এই তথ্যটি ডিলিট করতে চান?")) {
      docRef.delete().then(() => {
        alert("লেনদেন ডিলিট হয়েছে");
      });
    }
  }

  // এডিট
  if (e.target.classList.contains("editBtn")) {
    docRef.get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        document.getElementById("date").value = data.date || "";
        document.getElementById("type").value = data.type || "";
        document.getElementById("type").dispatchEvent(new Event("change"));
        document.getElementById("category").value = data.category || "";
        document.getElementById("amount").value = data.amount || "";

        document.getElementById("transactionForm").onsubmit = function (ev) {
          ev.preventDefault();
          const updatedData = {
            date: document.getElementById("date").value,
            type: document.getElementById("type").value,
            category: document.getElementById("category").value,
            amount: parseFloat(document.getElementById("amount").value),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          };

          docRef.update(updatedData).then(() => {
            alert("লেনদেন আপডেট হয়েছে");
            document.getElementById("transactionForm").reset();
            document.getElementById("transactionForm").onsubmit = null;
            document.getElementById("transactionForm").addEventListener("submit", submitHandler);
          });
        };
      }
    });
  }
});

// ফিল্টার বাটন হ্যান্ডলিং
document.querySelectorAll(".filterBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filterBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");

    const user = firebase.auth().currentUser;
    if (user) {
      loadTransactions(user.uid); // কেবল টেবিল আপডেট
    }
  });
});

// লগআউট
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
