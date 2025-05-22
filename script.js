let currentFilter = null;
let allTransactions = [];
let chart;

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    document.querySelector(".container").style.display = "block";
    loadFullSummary(user.uid);
    loadUserInfo(user);
  }
});

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

function loadUserInfo(user) {
  document.getElementById("user-info").textContent = `স্বাগতম, ${user.email}`;
}

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

function loadTransactions(userId) {
  if (!currentFilter) return;

  const db = firebase.firestore();
  const tbody = document.querySelector("#transactionTable tbody");
  tbody.innerHTML = "";

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

        allTransactions.push(data);

        const typeClass = type === "income" ? "row-income" : "row-expense";

const row = document.createElement("tr");
row.className = typeClass;
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

      if (typeof renderChart === "function") {
        renderChart(allTransactions, currentFilter);
      }
    });
}

function submitHandler(e) {
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
      loadTransactions(user.uid);
    });
}

document.getElementById("transactionForm").addEventListener("submit", submitHandler);

document.querySelector("#transactionTable tbody").addEventListener("click", e => {
  const user = firebase.auth().currentUser;
  const docId = e.target.getAttribute("data-id");
  const docRef = firebase.firestore().collection("users").doc(user.uid).collection("transactions").doc(docId);

  if (e.target.classList.contains("deleteBtn")) {
    if (confirm("আপনি কি ডিলিট করতে চান?")) {
      docRef.delete().then(() => loadTransactions(user.uid));
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
          document.getElementById("transactionForm").onsubmit = submitHandler;
          loadTransactions(user.uid);
        });
      };
    });
  }
});

document.querySelectorAll(".filterBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filterBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");

    const user = firebase.auth().currentUser;
    if (user) {
      loadTransactions(user.uid);
    }
  });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
