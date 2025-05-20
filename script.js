let editingDocId = null;

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
            <button class="deleteBtn" data-id="${doc.id}">ডিলিট</button>
          </td>
        `;
        transactionTableBody.appendChild(row);
      });

      totalIncomeEl.textContent = incomeTotal;
      totalExpenseEl.textContent = expenseTotal;
      balanceEl.textContent = incomeTotal - expenseTotal;
    });
}

document.querySelector("#transactionTable tbody").addEventListener("click", e => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (e.target.classList.contains("deleteBtn")) {
    const docId = e.target.getAttribute("data-id");
    if (confirm("আপনি কি এই ট্রানজেকশন মুছে ফেলতে চান?")) {
      firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .collection("transactions")
        .doc(docId)
        .delete()
        .then(() => {
          alert("ট্রানজেকশন সফলভাবে মুছে ফেলা হয়েছে!");
        })
        .catch(err => {
          alert("মুছে ফেলতে সমস্যা হয়েছে: " + err.message);
        });
    }
  }

  if (e.target.classList.contains("editBtn")) {
    editingDocId = e.target.getAttribute("data-id");
    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .collection("transactions")
      .doc(editingDocId)
      .get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          document.getElementById("date").value = data.date || "";
          document.getElementById("type").value = data.type || "";
          // ক্যাটেগরি লোড করার জন্য টাইপ onchange ট্রিগার করো
          const event = new Event('change');
          document.getElementById("type").dispatchEvent(event);
          document.getElementById("category").value = data.category || "";
          document.getElementById("amount").value = data.amount || "";
        }
      });
  }
});

document.getElementById("transactionForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) return alert("অনুগ্রহ করে প্রথমে লগইন করুন");

  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);

  const db = firebase.firestore();

  if (editingDocId) {
    // আপডেট মোড
    db.collection("users")
      .doc(user.uid)
      .collection("transactions")
      .doc(editingDocId)
      .update({
        date,
        type,
        category,
        amount,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        alert("ট্রানজেকশন সফলভাবে আপডেট হয়েছে!");
        resetForm();
      })
      .catch(err => {
        alert("আপডেট করতে সমস্যা হয়েছে: " + err.message);
      });
  } else {
    // নতুন ট্রানজেকশন যোগ
    db.collection("users")
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
        alert("নতুন ট্রানজেকশন সফলভাবে সংরক্ষিত হয়েছে!");
        resetForm();
      })
      .catch(err => {
        alert("সংরক্ষণ করতে সমস্যা হয়েছে: " + err.message);
      });
  }
});

function resetForm() {
  editingDocId = null;
  document.getElementById("transactionForm").reset();
  // ক্যাটেগরি অপশন রিসেট করতে চাইলে
  document.getElementById("category").innerHTML = '<option value="">ক্যাটেগরি নির্বাচন করুন</option>';
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
