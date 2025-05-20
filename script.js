let currentFilter = "all";

// ইউজার অথেন্টিকেশন চেক
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    document.querySelector(".container").style.display = "block";
    loadTransactions(user.uid);
    loadUserInfo(user);
  }
});

// ইউজার ইনফো দেখানো
function loadUserInfo(user) {
  const userInfoDiv = document.getElementById("user-info");
  userInfoDiv.textContent = `স্বাগতম, ${user.email}`;
}

// ট্রান্সজেকশন লোড
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
        const type = data.type || "";

        // ফিল্টার
        if (currentFilter !== "all" && currentFilter !== type) return;

        const row = document.createElement("tr");
        const date = data.date || "";
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

// ফিল্টার চেঞ্জ হ্যান্ডলার
document.getElementById("filterType")?.addEventListener("change", e => {
  currentFilter = e.target.value;
  const user = firebase.auth().currentUser;
  if (user) {
    loadTransactions(user.uid);
  }
});

// ট্রান্সজেকশন যোগ
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

// ডিলিট ও এডিট বাটন হ্যান্ডলিং
document.querySelector("#transactionTable tbody").addEventListener("click", e => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const docId = e.target.getAttribute("data-id");
  const row = e.target.closest("tr");

  // ডিলিট
  if (e.target.classList.contains("deleteBtn")) {
    if (confirm("আপনি কি নিশ্চিতভাবে এই লেনদেন মুছে ফেলতে চান?")) {
      firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .collection("transactions")
        .doc(docId)
        .delete()
        .then(() => {
          alert("লেনদেন সফলভাবে ডিলিট হয়েছে!");
        });
    }
  }

  // এডিট
  if (e.target.classList.contains("editBtn")) {
    const date = row.children[0].textContent;
    const typeText = row.children[1].textContent;
    const category = row.children[2].textContent;
    const amount = row.children[3].textContent;

    // ফর্মে মান বসানো
    document.getElementById("date").value = date;
    document.getElementById("type").value = typeText === "আয়" ? "income" : "expense";

    // ক্যাটেগরি রিফ্রেশ
    const event = new Event("change");
    document.getElementById("type").dispatchEvent(event);
    document.getElementById("category").value = category;
    document.getElementById("amount").value = amount;

    // সাবমিট বোতাম পরিবর্তন
    const submitBtn = document.querySelector("#transactionForm button[type='submit']");
    submitBtn.textContent = "আপডেট করুন";

    // আপডেট সাবমিশন হ্যান্ডলিং
    submitBtn.onclick = function updateHandler(event) {
      event.preventDefault();

      const newDate = document.getElementById("date").value;
      const newType = document.getElementById("type").value;
      const newCategory = document.getElementById("category").value;
      const newAmount = parseFloat(document.getElementById("amount").value);

      if (confirm("আপনি কি নিশ্চিতভাবে এই লেনদেন আপডেট করতে চান?")) {
        firebase.firestore()
          .collection("users")
          .doc(user.uid)
          .collection("transactions")
          .doc(docId)
          .update({
            date: newDate,
            type: newType,
            category: newCategory,
            amount: newAmount
          })
          .then(() => {
            alert("লেনদেন সফলভাবে আপডেট হয়েছে!");
            document.getElementById("transactionForm").reset();
            submitBtn.textContent = "সংরক্ষণ করুন";
            submitBtn.onclick = null;
          });
      }
    };
  }
});

// লগআউট
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
