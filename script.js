// Login check: লগইন না করলে login.html-এ পাঠানো হবে
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

// ট্রানজাকশন লোড করা
function loadTransactions(userId) {
  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .orderBy("timestamp", "desc")
    .onSnapshot((querySnapshot) => {
      transactionTableBody.innerHTML = "";
      let incomeTotal = 0;
      let expenseTotal = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");

        const date = data.date || "";
        const type = data.type || "";
        const category = data.category || "";
        const amount = parseFloat(data.amount || 0);

        if (type === "আয়") {
          incomeTotal += amount;
        } else {
          expenseTotal += amount;
        }

        row.innerHTML = `
          <td>${date}</td>
          <td>${type}</td>
          <td>${category}</td>
          <td>${amount}</td>
          <td><button class="deleteBtn" data-id="${doc.id}">ডিলিট</button></td>
        `;
        transactionTableBody.appendChild(row);
      });

      const balance = incomeTotal - expenseTotal;
      summary.innerHTML = `
        মোট আয়: ${incomeTotal} টাকা |
        মোট ব্যয়: ${expenseTotal} টাকা |
        বর্তমান ব্যালেন্স: ${balance} টাকা
      `;
    });
}

// ট্রানজাকশন যোগ করা
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const user = firebase.auth().currentUser;
  if (!user) return;

  const userId = user.uid;
  const date = form.date.value;
  const type = form.type.value;
  const category = form.category.value;
  const amount = form.amount.value;

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .add({
      date,
      type,
      category,
      amount,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userId
    })
    .then(() => {
      form.reset();
    });
});

// ডিলিট বাটনে ক্লিক করলে ডেটা মুছে ফেলা
transactionTableBody.addEventListener("click", function (e) {
  if (e.target.classList.contains("deleteBtn")) {
    const docId = e.target.getAttribute("data-id");
    const user = firebase.auth().currentUser;
    if (!user) return;

    db.collection("users")
      .doc(user.uid)
      .collection("transactions")
      .doc(docId)
      .delete();
  }
});

// লগআউট
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
