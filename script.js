firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // ইউজার লগইন না থাকলে login.html-এ রিডাইরেক্ট
    window.location.href = "login.html";
  } else {
    // ইউজার লগইন আছে, তাই UI লোড করো
    document.querySelector(".container").style.display = "block";
    loadTransactions(user.uid);
    loadUserInfo(user);
  }
});

// UI প্রথমে লুকিয়ে রাখো index.html এ (style.css বা inline style দিয়ে)
// যেমন: .container { display: none; } 
// তারপর ইউজার লগইন হলে দেখাবে উপরের কোড

function loadUserInfo(user) {
  const userInfoDiv = document.getElementById("user-info");
  userInfoDiv.textContent = `স্বাগতম, ${user.email}`;
}

function loadTransactions(userId) {
  const db = firebase.firestore();
  const transactionTableBody = document.querySelector("#transactionTable tbody");
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
      transactionTableBody.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement("tr");

        const date = data.date || "";
        const type = data.type || "";
        const category = data.category || "";
        const amount = parseFloat(data.amount || 0);

        if (type === "income") incomeTotal += amount;
        else if (type === "expense") expenseTotal += amount;

        row.innerHTML = `
          <td>${date}</td>
          <td>${type === "income" ? "আয়" : "ব্যয়"}</td>
          <td>${category}</td>
          <td>${amount}</td>
          <td><button class="deleteBtn" data-id="${doc.id}">ডিলিট</button></td>
        `;
        transactionTableBody.appendChild(row);
      });

      totalIncomeEl.textContent = incomeTotal;
      totalExpenseEl.textContent = expenseTotal;
      balanceEl.textContent = incomeTotal - expenseTotal;
    });
}

// ডিলিট বাটন হ্যান্ডলিং
document.querySelector("#transactionTable tbody").addEventListener("click", e => {
  if (e.target.classList.contains("deleteBtn")) {
    const docId = e.target.getAttribute("data-id");
    const user = firebase.auth().currentUser;
    if (!user) return;

    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .collection("transactions")
      .doc(docId)
      .delete();
  }
});

// ফর্ম সাবমিট - নতুন ট্রানজাকশন যোগ করা
document.getElementById("transactionForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) return alert("অনুগ্রহ করে প্রথমে লগইন করুন");

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
});

// লগআউট
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
