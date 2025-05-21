let currentFilter = "all";

// ইউজার লগইন থাকলে ডেটা লোড
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    document.querySelector(".container").style.display = "block";
    loadFullSummary(user.uid);     // সামারি একবার লোড হবে
    loadTransactions(user.uid);    // টেবিল বারবার লোড হবে (ফিল্টার অনুযায়ী)
    loadUserInfo(user);
  }
});

// ইউজার তথ্য
function loadUserInfo(user) {
  document.getElementById("user-info").textContent = `স্বাগতম, ${user.email}`;
}

// সামারি একবার হিসাব করে দেখাবে (সব ডেটা ভিত্তিক)
function loadFullSummary(userId) {
  const db = firebase.firestore();
  db.collection("users").doc(userId).collection("transactions").get().then(snapshot => {
    let totalIncome = 0;
    let totalExpense = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const amount = parseFloat(data.amount || 0);
      if (data.type === "income") totalIncome += amount;
      else if (data.type === "expense") totalExpense += amount;
    });

    const savings = totalIncome - totalExpense;
    const totalSavings = totalBalance;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    document.getElementById("totalIncome").textContent = totalIncome.toFixed(2);
    document.getElementById("totalExpense").textContent = totalExpense.toFixed(2);
    document.getElementById("balance").textContent = savings.toFixed(2);
    document.getElementById("alwaysSavingsPercentage").textContent = savingsRate.toFixed(2);
    document.getElementById("alwaysMonthlySavings").textContent = totalSavings.toFixed(2);
  });
}

// টেবিল আপডেট (ফিল্টার অনুযায়ী), কিন্তু সামারিতে কোন পরিবর্তন হবে না
function loadTransactions(userId) {
  const db = firebase.firestore();
  const tbody = document.querySelector("#transactionTable tbody");
  tbody.innerHTML = "";

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      tbody.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);
        const type = data.type || "";

        // ফিল্টার
        if (currentFilter !== "all" && type !== currentFilter) return;

        const row = document.createElement("tr");
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
    });
}

// ফর্ম সাবমিট (নতুন এন্ট্রি)
document.getElementById("transactionForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) return;

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

// এডিট / ডিলিট হ্যান্ডলার
document.querySelector("#transactionTable tbody").addEventListener("click", e => {
  const user = firebase.auth().currentUser;
  const docId = e.target.getAttribute("data-id");
  const docRef = firebase.firestore().collection("users").doc(user.uid).collection("transactions").doc(docId);

  if (e.target.classList.contains("deleteBtn")) {
    if (confirm("আপনি কি ডিলিট করতে চান?")) {
      docRef.delete();
    }
  }

  if (e.target.classList.contains("editBtn")) {
    docRef.get().then(doc => {
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
          document.getElementById("transactionForm").reset();
          document.getElementById("transactionForm").onsubmit = null;
          document.getElementById("transactionForm").addEventListener("submit", submitHandler);
        });
      };
    });
  }
});

// ফিল্টার বাটন হ্যান্ডলার
document.querySelectorAll(".filterBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filterBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");

    const user = firebase.auth().currentUser;
    if (user) {
      loadTransactions(user.uid); // টেবিল আপডেট
    }
  });
});

// লগআউট
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
