let currentFilter = "all";
let allTransactions = [];

// বাংলা নাম্বার ফাংশন (৳ টাকার জন্য সঠিক ফরম্যাট)
function toBanglaNumber(num) {
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  let fixed = parseInt(num) || 0;
  return fixed.toString().split('').map(d => banglaDigits[d] || d).join('') + " ৳";
}

function toBanglaPercentage(num) {
  const banglaDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return parseFloat(num).toFixed(2).split('').map(d => {
    if (d === '.') return '.';
    return banglaDigits[d] || d;
  }).join('') + " %";
}

// অটোমেটিক ইউজার চেক
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    document.querySelector(".container").style.display = "block";
    loadFullSummary(user.uid);
    loadUserInfo(user);
    loadTransactions(user.uid);
  }
});

// ইউজার ইনফো দেখানো
function loadUserInfo(user) {
  document.getElementById("user-info").textContent = `স্বাগতম, ${user.email}`;
}

// পূর্ণ সারাংশ লোড
function loadFullSummary(userId) {
  const db = firebase.firestore();
  db.collection("users").doc(userId).collection("transactions").onSnapshot(snapshot => {
    let totalIncome = 0;
    let totalExpense = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const amount = parseFloat(data.amount || 0);
      if (data.type === "income") totalIncome += amount;
      else if (data.type === "expense") totalExpense += amount;
    });

    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    document.getElementById("totalIncome").textContent = toBanglaNumber(totalIncome);
    document.getElementById("totalExpense").textContent = toBanglaNumber(totalExpense);
    document.getElementById("balance").textContent = toBanglaNumber(savings);
    document.getElementById("alwaysMonthlySavings").textContent = toBanglaNumber(savings);
    document.getElementById("alwaysSavingsPercentage").textContent = toBanglaPercentage(savingsRate);
  });
}

// ট্রানজেকশন লোড ও টেবিল রেন্ডার
function loadTransactions(userId) {
  const db = firebase.firestore();
  const tbody = document.querySelector("#transactionTable tbody");

  db.collection("users")
    .doc(userId)
    .collection("transactions")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      tbody.innerHTML = "";
      allTransactions = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);
        const type = data.type || "";

        if (currentFilter !== "all" && type !== currentFilter) return;

        allTransactions.push({ ...data, id: doc.id });

        const row = document.createElement("tr");
        row.className = type === "income" ? "income-row" : "expense-row";

        row.innerHTML = `
          <td>${data.date || ""}</td>
          <td>${type === "income" ? "আয়" : "ব্যয়"}</td>
          <td>${data.category || ""}</td>
          <td>${toBanglaNumber(amount)}</td>
          <td>
            <button class="editBtn" data-id="${doc.id}">এডিট</button>
            <button class="deleteBtn" data-id="${doc.id}">ডিলিট</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      // চার্ট কল - আলাদা ফাইলে renderChart ফাংশন থাকবে
      if (typeof renderChart === "function") {
        renderChart(allTransactions, currentFilter);
      }
    });
}

// ফর্ম সাবমিট হ্যান্ডলার
function submitHandler(e) {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) return;

  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amountStr = document.getElementById("amount").value;
  const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''));

  if (!date || !type || !category || isNaN(amount)) {
    alert("সকল ফিল্ড সঠিকভাবে পূরণ করুন");
    return;
  }

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

document.getElementById("transactionForm").addEventListener("submit", submitHandler);

// টেবিলের এডিট ও ডিলিট বাটন হ্যান্ডলার
document.querySelector("#transactionTable tbody").addEventListener("click", e => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const docId = e.target.getAttribute("data-id");
  if (!docId) return;

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

      // সাবমিট ইভেন্ট আপডেট করা যাতে আপডেট করে
      document.getElementById("transactionForm").onsubmit = function(ev) {
        ev.preventDefault();

        const updatedAmountStr = document.getElementById("amount").value;
        const updatedAmount = parseFloat(updatedAmountStr.replace(/[^\d.-]/g, ''));

        const updatedData = {
          date: document.getElementById("date").value,
          type: document.getElementById("type").value,
          category: document.getElementById("category").value,
          amount: updatedAmount,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        docRef.update(updatedData).then(() => {
          document.getElementById("transactionForm").reset();
          // সাবমিট হ্যান্ডলার আগের মতো সেট করা
          document.getElementById("transactionForm").onsubmit = submitHandler;
          loadTransactions(user.uid);
        });
      };
    });
  }
});

// টাইপ অনুযায়ী ক্যাটেগরি লোড
const incomeCategories = ["বেতন", "ব্যবসা", "অন্যান্য"];
const expenseCategories = [
  "বাসা ভাড়া", "মোবাইল রিচার্জ", "বিদ্যুৎ বিল", "পরিবহন", "দোকান বিল",
  "কেনাকাটা", "গাড়ির খরচ", "কাচা বাজার", "বাড়ি", "হাস্পাতাল",
  "ব্যক্তিগত", "অন্যান্য", "গাড়ি তেল"
];

document.getElementById("type").addEventListener("change", function () {
  const type = this.value;
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = '<option value="">ক্যাটেগরি নির্বাচন করুন</option>';

  let categories = [];
  if (type === "income") categories = incomeCategories;
  else if (type === "expense") categories = expenseCategories;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
});

// ফিল্টার বাটন হ্যান্ডলার
document.querySelectorAll(".filterBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filterBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.getAttribute("data-filter");
    const user = firebase.auth().currentUser;
    if (user) loadTransactions(user.uid);
  });
});

// লগআউট
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
