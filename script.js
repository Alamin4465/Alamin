firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    loadTransactions(user.uid);
  }
});

const db = firebase.firestore();
const form = document.getElementById("transactionForm");
const transactionTableBody = document.querySelector("#transactionTable tbody");
const summary = document.getElementById("summary");
const logoutBtn = document.getElementById("logoutBtn");

let allTransactions = [];
let currentFilter = "সব";

function loadTransactions(userId) {
  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .orderBy("timestamp", "desc")
    .onSnapshot((querySnapshot) => {
      allTransactions = [];
      querySnapshot.forEach((doc) => {
        allTransactions.push({ id: doc.id, ...doc.data() });
      });
      applyFilter();
    });
}

function applyFilter() {
  transactionTableBody.innerHTML = "";
  let incomeTotal = 0;
  let expenseTotal = 0;

  allTransactions.forEach((data) => {
    const { id, date, type, category, amount } = data;
    const amt = parseFloat(amount || 0);

    if (currentFilter === "সব" || currentFilter === type) {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${date || ""}</td>
        <td>${type || ""}</td>
        <td>${category || ""}</td>
        <td>${amt}</td>
        <td>
          <button class="editBtn action-btn" data-id="${id}">এডিট</button>
          <button class="deleteBtn action-btn" data-id="${id}">ডিলিট</button>
        </td>
      `;
      transactionTableBody.appendChild(row);
    }

    if (type === "আয়") incomeTotal += amt;
    else if (type === "ব্যয়") expenseTotal += amt;
  });

  const balance = incomeTotal - expenseTotal;
  const savingPercent = incomeTotal > 0 ? ((balance / incomeTotal) * 100).toFixed(2) : 0;

  summary.innerHTML = `
    মোট আয়: ${incomeTotal.toFixed(2)} টাকা |
    মোট ব্যয়: ${expenseTotal.toFixed(2)} টাকা |
    বর্তমান ব্যালেন্স: ${balance.toFixed(2)} টাকা |
    সঞ্চয়ের হার: ${savingPercent}%
  `;
}

// Filter buttons
document.getElementById("filterAll").addEventListener("click", () => {
  currentFilter = "সব";
  applyFilter();
});
document.getElementById("filterIncome").addEventListener("click", () => {
  currentFilter = "আয়";
  applyFilter();
});
document.getElementById("filterExpense").addEventListener("click", () => {
  currentFilter = "ব্যয়";
  applyFilter();
});

// Delete and Edit buttons
transactionTableBody.addEventListener("click", function (e) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const docId = e.target.getAttribute("data-id");

  if (e.target.classList.contains("deleteBtn")) {
    if (confirm("আপনি কি এই ট্রানজাকশন ডিলিট করতে চান?")) {
      db.collection("users").doc(user.uid).collection("transactions").doc(docId).delete();
    }
  }

  if (e.target.classList.contains("editBtn")) {
    const trans = allTransactions.find((t) => t.id === docId);
    if (trans) {
      form.date.value = trans.date;
      form.type.value = trans.type;
      form.category.value = trans.category;
      form.amount.value = trans.amount;

      form.setAttribute("data-edit-id", docId);
    }
  }
});

// Submit form (Add or Update)
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) return;

  const userId = user.uid;
  const date = form.date.value;
  const type = form.type.value;
  const category = form.category.value;
  const amount = form.amount.value;
  const editId = form.getAttribute("data-edit-id");

  const data = {
    date,
    type,
    category,
    amount,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    userId,
  };

  if (editId) {
    db.collection("users").doc(userId).collection("transactions").doc(editId).update(data).then(() => {
      form.reset();
      form.removeAttribute("data-edit-id");
    });
  } else {
    db.collection("users").doc(userId).collection("transactions").add(data).then(() => {
      form.reset();
    });
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
