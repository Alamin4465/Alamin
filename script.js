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

// ইউজারের তথ্য দেখানোর ফাংশন
function loadUserInfo(user) {
  const userInfoDiv = document.getElementById("user-info");
  userInfoDiv.textContent = `স্বাগতম, ${user.email}`;
}

const db = firebase.firestore();
const transactionTableBody = document.querySelector("#transactionTable tbody");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");

let editingDocId = null; // এডিটিং মোড ট্র্যাক করার জন্য

// ট্রানজেকশন লোড ফাংশন
function loadTransactions(userId) {
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
            <button class="editBtn" data-id="${doc.id}" data-date="${date}" data-type="${type}" data-category="${category}" data-amount="${amount}">এডিট</button>
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

// ডিলিট বাটনের হ্যান্ডলার
transactionTableBody.addEventListener("click", e => {
  if (e.target.classList.contains("deleteBtn")) {
    const docId = e.target.getAttribute("data-id");
    const user = firebase.auth().currentUser;
    if (!user) return;

    if (e.target.classList.contains("deleteBtn")) {
  const docId = e.target.getAttribute("data-id");
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (confirm("আপনি কি এই ট্রানজেকশন মুছে ফেলতে চান?")) {
    db.collection("users")
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
  }

  // এডিট বাটনের হ্যান্ডলার
  if (e.target.classList.contains("editBtn")) {
    const docId = e.target.getAttribute("data-id");
    const date = e.target.getAttribute("data-date");
    const type = e.target.getAttribute("data-type");
    const category = e.target.getAttribute("data-category");
    const amount = e.target.getAttribute("data-amount");

    editingDocId = docId; // এডিট মোডে প্রবেশ

    // ফর্মে ডাটা পূরণ করা
    document.getElementById("date").value = date;
    document.getElementById("type").value = type;
    // ক্যাটেগরি আপডেট করার জন্য ইভেন্ট ট্রিগার করো
    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = '<option value="">ক্যাটেগরি নির্বাচন করুন</option>';
    const incomeCategories = ["বেতন", "ব্যবসা", "অন্যান্য"];
    const expenseCategories = [
      "বাসা ভাড়া", "মোবাইল রিচার্জ", "বিদ্যুৎ বিল", "পরিবহন", "দোকান বিল",
      "কেনাকাটা", "গাড়ির খরচ", "কাচা বাজার", "বাড়ি", "হাস্পাতাল",
      "ব্যক্তিগত", "অন্যান্য"
    ];
    let categories = [];
    if (type === "income") categories = incomeCategories;
    else if (type === "expense") categories = expenseCategories;

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      if (cat === category) option.selected = true;
      categorySelect.appendChild(option);
    });

    document.getElementById("amount").value = amount;

    // সাবমিট বাটনের টেক্সট চেঞ্জ করো
    document.querySelector("#transactionForm button[type='submit']").textContent = "আপডেট করুন";
  }
});

// টাইপ পরিবর্তনের সাথে সাথে ক্যাটেগরি আপডেট
document.getElementById("type").addEventListener("change", function () {
  const type = this.value;
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = '<option value="">ক্যাটেগরি নির্বাচন করুন</option>';

  const incomeCategories = ["বেতন", "ব্যবসা", "অন্যান্য"];
  const expenseCategories = [
    "বাসা ভাড়া", "মোবাইল রিচার্জ", "বিদ্যুৎ বিল", "পরিবহন", "দোকান বিল",
    "কেনাকাটা", "গাড়ির খরচ", "কাচা বাজার", "বাড়ি", "হাস্পাতাল",
    "ব্যক্তিগত", "অন্যান্য"
  ];

  const categories = type === "income" ? incomeCategories : type === "expense" ? expenseCategories : [];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
});

// ফর্ম সাবমিট হ্যান্ডলার (নতুন যোগ বা আপডেট)
document.getElementById("transactionForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) return alert("অনুগ্রহ করে প্রথমে লগইন করুন");

  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!date || !type || !category || !amount) {
    alert("অনুগ্রহ করে সকল তথ্য সঠিকভাবে পূরণ করুন।");
    return;
  }

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
}else {
    // নতুন ট্রানজেকশন যোগ করা
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
        alert("ট্রানজেকশন সফলভাবে সংরক্ষণ হয়েছে!");
        resetForm();
      })
      .catch(err => {
        alert("সংরক্ষণ করতে সমস্যা হয়েছে: " + err.message);
      });
  }
});

// ফর্ম রিসেট ফাংশন
function resetForm() {
  editingDocId = null;
  document.getElementById("transactionForm").reset();
  document.querySelector("#transactionForm button[type='submit']").textContent = "সংরক্ষণ করুন";
  document.getElementById("category").innerHTML = '<option value="">ক্যাটেগরি নির্বাচন করুন</option>';
}

// লগআউট বাটন
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
