let editDocId = null; // এডিট মোডে কোন ডকুমেন্ট চলছে

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    document.querySelector(".container").style.display = "block";
    loadTransactions(user.uid);
    loadUserInfo(user);
  }
});

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
          <td>
            <button class="editBtn" data-id="${doc.id}">এডিট</button>
            <button class="deleteBtn" data-id="${doc.id}">মুছে ফেলুন</button>
          </td>
        `;
        transactionTableBody.appendChild(row);
      });

      totalIncomeEl.textContent = incomeTotal;
      totalExpenseEl.textContent = expenseTotal;
      balanceEl.textContent = incomeTotal - expenseTotal;
    });
}

// ডিলিট ও এডিট বাটনের ইভেন্ট হ্যান্ডলার
document.querySelector("#transactionTable tbody").addEventListener("click", e => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (e.target.classList.contains("deleteBtn")) {
    const docId = e.target.getAttribute("data-id");
    if (confirm("আপনি কি নিশ্চিত মুছে ফেলতে চান?")) {
      firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .collection("transactions")
        .doc(docId)
        .delete()
        .then(() => {
          alert("লেনদেন সফলভাবে মুছে ফেলা হয়েছে।");
          if (editDocId === docId) {
            editDocId = null;
            document.getElementById("transactionForm").reset();
            document.querySelector("#transactionForm button[type='submit']").textContent = "সংরক্ষণ করুন";
          }
        })
        .catch(err => {
          alert("মুছে ফেলা যায়নি: " + err.message);
        });
    }
  }

  else if (e.target.classList.contains("editBtn")) {
    const docId = e.target.getAttribute("data-id");
    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .collection("transactions")
      .doc(docId)
      .get()
      .then(doc => {
        if (!doc.exists) return alert("লেনদেন পাওয়া যায়নি!");
        const data = doc.data();

        // ফর্মে ডেটা লোড করো
        document.getElementById("date").value = data.date || "";
        document.getElementById("type").value = data.type || "";

        // টাইপ অনুযায়ী ক্যাটেগরি লোড করো (event trigger করো)
        const typeSelect = document.getElementById("type");
        typeSelect.dispatchEvent(new Event('change'));

        document.getElementById("category").value = data.category || "";
        document.getElementById("amount").value = data.amount || "";

        // এডিট আইডি সেট করো
        editDocId = docId;

        // সাবমিট বাটনের টেক্সট বদলাও
        document.querySelector("#transactionForm button[type='submit']").textContent = "আপডেট করুন";
      });
  }
});

// ফর্ম সাবমিট
document.getElementById("transactionForm").addEventListener("submit", e => {
  e.preventDefault();

  const user = firebase.auth().currentUser;
  if (!user) return alert("অনুগ্রহ করে প্রথমে লগইন করুন।");

  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);

  const transactionsRef = firebase.firestore()
    .collection("users")
    .doc(user.uid)
    .collection("transactions");

  if (editDocId) {
    // আপডেট মোড
    transactionsRef.doc(editDocId).update({
      date,
      type,
      category,
      amount
    }).then(() => {
      alert("লেনদেন সফলভাবে আপডেট হয়েছে।");
      editDocId = null;
      document.getElementById("transactionForm").reset();
      document.querySelector("#transactionForm button[type='submit']").textContent = "সংরক্ষণ করুন";
    }).catch(err => {
      alert("আপডেটে সমস্যা হয়েছে: " + err.message);
    });
  } else {
    // নতুন এন্ট্রি
    transactionsRef.add({
      date,
      type,
      category,
      amount,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      alert("লেনদেন সফলভাবে সংরক্ষণ হয়েছে।");
      document.getElementById("transactionForm").reset();
    }).catch(err => {
      alert("লেনদেন সংরক্ষণে সমস্যা হয়েছে: " + err.message);
    });
  }
});

// লগআউট
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
