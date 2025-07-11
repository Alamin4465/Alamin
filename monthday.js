function transactionFilter() {
  const content = document.getElementById('content');
  content.innerHTML = `
   <h2 class="titel">লেনদেন ফিল্টার</h2>
<div class="tabs">
  <button class="tab-btn active" onclick="showTab(event, 'dateFilterTab')">তারিখ/মাস ফিল্টার</button>
  <button class="tab-btn" onclick="showTab(event, 'typeFilterTab')">টাইপ/ক্যাটাগরি ফিল্টার</button>
</div>

<!-- তারিখ/মাস ফিল্টার ট্যাব -->
<div id="dateFilterTab" class="tab-content">
<div class="Filter-monthday">
      <div class="monthday">
    <h2>মাস ও তারিখ ফিল্টার</h2>

    <div class="filter-row">
      <div class="filter-group">
        <label for="dateFilter">তারিখ নির্বাচন করুন:</label>
        <input type="date" id="dateFilter" />
      </div>

      <div class="filter-group">
        <label for="monthFilter">মাস নির্বাচন করুন:</label>
        <input type="month" id="monthFilter" />
      </div>

      <div class="reset-group">
        <button id="resetFilterBtn">রিসেট</button>
      </div>
    </div>
  </div>

      <div class="monthdaytable">
        <table id="filteredTable" border="1" style="margin-top: 10px; width: 100%;">
          <thead>
            <tr>
              <th>তারিখ/মাস</th>
              <th>ক্যাটাগরি</th>
              <th>আয় টাকা</th>
              <th>ব্যয় টাকা</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>

        <table id="monthlySummary" border="1" style="margin-top: 10px; width: 100%; display: none;"></table>
      </div>

      <canvas id="filterSummaryChart" width="400" height="250" style="margin-top: 20px;"></canvas>
    </div>
</div>

<!-- টাইপ/ক্যাটাগরি ফিল্টার ট্যাব -->
<div id="typeFilterTab" class="tab-content" style="display: none;">
  <div class="Filter-monthday">
<div class="monthday">
  <h2>টাইপ/ক্যাটাগরি ফিল্টার</h2>

  <label for="typeSelector">টাইপ:</label>
  <select id="typeSelector">
    <option value="">-- নির্বাচন করুন --</option>
    <option value="income">আয়</option>
    <option value="expense">ব্যয়</option>
  </select>

  <label for="categorySelector">ক্যাটাগরি:</label>
  <select id="categorySelector" disabled>
    <option value="">প্রথমে টাইপ নির্বাচন করুন</option>
  </select>
</div>
    <div class="table-section">
      <table id="typeFilteredTable" border="1" style="width: 100%; margin-top: 10px;">
        <thead>
          <tr>
            <th>তারিখ</th>
            <th>ক্যাটাগরি</th>
            <th>টাকা</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="3" class="message">টাইপ নির্বাচন করুন</td>
          </tr>
        </tbody>
      </table>
    </div>
</div>
  </div>
  
  `;

  let filterSummaryChart = null;
  let currentUser = null;

  firebase.auth().onAuthStateChanged((user) => {
    if (user) currentUser = user;
  });

  function formatTaka(amount) {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }

  window.showTab = function (event, tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    if (event) event.currentTarget.classList.add('active');
  };

  const dateFilter = document.getElementById("dateFilter");
  const monthFilter = document.getElementById("monthFilter");
  const resetBtn = document.getElementById("resetFilterBtn");
  const filteredTable = document.querySelector("#filteredTable tbody");
  const summaryEl = document.getElementById("monthlySummary");

  resetBtn.addEventListener("click", () => {
    dateFilter.value = "";
    monthFilter.value = "";
    filteredTable.innerHTML = "<tr><td colspan='4' class='message'>ফিল্টার প্রয়োগ করুন</td></tr>";
    summaryEl.style.display = "none";
    if (filterSummaryChart) {
      filterSummaryChart.destroy();
      filterSummaryChart = null;
    }
  });

  dateFilter.addEventListener("change", () => {
    monthFilter.value = "";
    if (dateFilter.value) filterByDate(dateFilter.value);
  });

  monthFilter.addEventListener("change", () => {
    dateFilter.value = "";
    if (monthFilter.value) filterByMonth(monthFilter.value);
  });

  initTypeFilter();

  function initTypeFilter() {
    const typeSelector = document.getElementById("typeSelector");
    const categorySelector = document.getElementById("categorySelector");
    const tbody = document.querySelector("#typeFilteredTable tbody");

    const incomeCategories = ["বেতন", "ব্যবসা", "অন্যান্য", "বাইক"];
    const expenseCategories = [
      "বাসা ভাড়া", "মোবাইল রিচার্জ", "বিদ্যুৎ বিল", "পরিবহন", "দোকান বিল",
      "কেনাকাটা", "গাড়ির খরচ", "কাচা বাজার", "বাড়ি", "হাস্পাতাল",
      "ব্যক্তিগত", "অন্যান্য", "গাড়ির তেল", "নাস্তা", "খাওয়া",
      "চুলকাটানো", "লাইফ স্টাইল", "সঞ্চয়"
    ];

    function initCategories() {
      const selectedType = typeSelector.value;
      if (!selectedType) {
        categorySelector.innerHTML = '<option value="">প্রথমে টাইপ নির্বাচন করুন</option>';
        categorySelector.disabled = true;
        return;
      }
      categorySelector.disabled = false;
      categorySelector.innerHTML = '<option value="">-- সব ক্যাটাগরি --</option>';
      const categories = selectedType === "income" ? incomeCategories : expenseCategories;
      categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelector.appendChild(option);
      });
    }

    async function loadFilteredTransactions() {
      const selectedType = typeSelector.value;
      const selectedCategory = categorySelector.value;
      tbody.innerHTML = '<tr><td colspan="3" class="message">ডেটা লোড হচ্ছে...</td></tr>';

      if (!currentUser) {
        tbody.innerHTML = '<tr><td colspan="3" class="error">অনুগ্রহ করে লগইন করুন</td></tr>';
        return;
      }

      if (!selectedType) {
        tbody.innerHTML = '<tr><td colspan="3" class="message">টাইপ নির্বাচন করুন</td></tr>';
        return;
      }

      try {
        let query = db.collection("users").doc(currentUser.uid).collection("transactions").where("type", "==", selectedType);
        if (selectedCategory) {
          query = query.where("category", "==", selectedCategory);
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
          tbody.innerHTML = '<tr><td colspan="3" class="message">কোনো লেনদেন পাওয়া যায়নি</td></tr>';
          return;
        }

        const transactions = snapshot.docs.map(doc => doc.data());
        transactions.sort((a, b) => b.timestamp - a.timestamp);

        tbody.innerHTML = "";
        transactions.forEach(tx => {
          const amountClass = tx.type === "income" ? "income" : "expense";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${tx.date || "N/A"}</td>
            <td>${tx.category || "N/A"}</td>
            <td class="${amountClass}">${formatTaka(tx.amount)}</td>
          `;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Firestore Error:", error);
        let errorMessage = "ডেটা লোডে সমস্যা হয়েছে";
        if (error.message.includes("index")) {
          errorMessage += `<br><small>সমাধান: Firebase কনসোলে একটি ইনডেক্স তৈরি করুন</small>`;
        }
        tbody.innerHTML = `<tr><td colspan="3" class="error">${errorMessage}</td></tr>`;
      }
    }

    typeSelector.addEventListener("change", () => {
      initCategories();
      loadFilteredTransactions();
    });

    categorySelector.addEventListener("change", loadFilteredTransactions);

    initCategories();
  }

  document.getElementById("dateFilter").addEventListener("change", () => {
    const date = document.getElementById("dateFilter").value;
    const user = firebase.auth().currentUser;
    if (user && date) {
      filterByDate(user.uid, date);
      calculateDailySummary(user.uid, date);
    }
  });

  document.getElementById("monthFilter").addEventListener("change", () => {
    const month = document.getElementById("monthFilter").value;
    const user = firebase.auth().currentUser;
    if (user && month) {
      filterByMonth(user.uid, month);
      calculateMonthlySummary(user.uid, month);
    }
  });

  function filterByDate(userId, date) {
    const db = firebase.firestore();
    const tbody = document.querySelector("#filteredTable tbody");
    tbody.innerHTML = "";

    db.collection("users")
      .doc(userId)
      .collection("transactions")
      .where("date", "==", date)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          const income = data.type === "income" ? formatTaka(data.amount) : "";
          const expense = data.type === "expense" ? formatTaka(data.amount) : "";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${data.date || ""}</td>
            <td>${data.category || ""}</td>
            <td>${income}</td>
            <td>${expense}</td>
          `;
          tbody.appendChild(tr);
        });
      });
  }

  function filterByMonth(userId, month) {
    const db = firebase.firestore();
    const tbody = document.querySelector("#filteredTable tbody");
    tbody.innerHTML = "";

    const [year, mon] = month.split("-");
    const start = new Date(`${year}-${mon}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    db.collection("users")
      .doc(userId)
      .collection("transactions")
      .where("timestamp", ">=", start)
      .where("timestamp", "<", end)
      .orderBy("timestamp", "asc")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          const income = data.type === "income" ? formatTaka(data.amount) : "";
          const expense = data.type === "expense" ? formatTaka(data.amount) : "";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${data.date || ""}</td>
            <td>${data.category || ""}</td>
            <td>${income}</td>
            <td>${expense}</td>
          `;
          tbody.appendChild(tr);
        });
      });
  }

  function calculateDailySummary(userId, date) {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    let income = 0, expense = 0, prevBalance = 0;

    const db = firebase.firestore();
    const ref = db.collection("users").doc(userId).collection("transactions");

    ref.where("timestamp", "<", selectedDate).get().then(snapshot => {
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.type === "income") prevBalance += d.amount || 0;
        else if (d.type === "expense") prevBalance -= d.amount || 0;
      });

      return ref.where("timestamp", ">=", selectedDate).where("timestamp", "<", nextDay).get();
    }).then(snapshot => {
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.type === "income") income += d.amount || 0;
        else if (d.type === "expense") expense += d.amount || 0;
      });

      const total = prevBalance + income - expense;
      const dateLabel = new Date(date).toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });

      const summaryTable = document.getElementById("monthlySummary");
      summaryTable.innerHTML = `
        <thead>
          <tr>
            <th>তারিখ</th>
            <th>বিবরণ</th>
            <th>আয়</th>
            <th>ব্যয়</th>
            <th>টাকা</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="4"><b>${dateLabel}</b></td>
            <td colspan="3">শেষ টাকা</td>
            <td>${formatTaka(prevBalance)}</td>
          </tr>
          <tr>
            <td>আজকের আয়</td>
            <td>${formatTaka(income)}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>আজকের ব্যয়</td>
            <td></td>
            <td>${formatTaka(expense)}</td>
            <td>${formatTaka(total)}</td>
          </tr>
          <tr>
            <td colspan="3">মোট</td>
            <td>${formatTaka(total)}</td>
          </tr>
        </tbody>
      `;
      summaryTable.style.display = "table";
      drawFilterSummaryChart(`${dateLabel} - আয় বনাম ব্যয়`, income, expense);
    });
  }

  function calculateMonthlySummary(userId, month) {
    const [year, mon] = month.split("-");
    const start = new Date(`${year}-${mon}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    let income = 0, expense = 0, prevBalance = 0;

    const db = firebase.firestore();
    const ref = db.collection("users").doc(userId).collection("transactions");

    ref.where("timestamp", "<", start).get().then(snapshot => {
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.type === "income") prevBalance += d.amount || 0;
        else if (d.type === "expense") prevBalance -= d.amount || 0;
      });

      return ref.where("timestamp", ">=", start).where("timestamp", "<", end).get();
    }).then(snapshot => {
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.type === "income") income += d.amount || 0;
        else if (d.type === "expense") expense += d.amount || 0;
      });

      const total = prevBalance + income - expense;
      const monthLabel = start.toLocaleString("bn-BD", { year: 'numeric', month: 'long' });

      const summaryTable = document.getElementById("monthlySummary");
      summaryTable.innerHTML = `
        <thead>
          <tr>
            <th>মাস</th>
            <th>বিবরণ</th>
            <th>আয়</th>
            <th>ব্যয়</th>
            <th>টাকা</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="4"><b>${monthLabel}</b></td>
            <td colspan="3">শেষ টাকা</td>
            <td>${formatTaka(prevBalance)}</td>
          </tr>
          <tr>
            <td>মাসের আয়</td>
            <td>${formatTaka(income)}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>মাসের ব্যয়</td>
            <td></td>
            <td>${formatTaka(expense)}</td>
            <td>${formatTaka(total)}</td>
          </tr>
          <tr>
            <td colspan="3">মোট</td>
            <td>${formatTaka(total)}</td>
          </tr>
        </tbody>
      `;
      summaryTable.style.display = "table";
      drawFilterSummaryChart(`${monthLabel} - আয় বনাম ব্যয়`, income, expense);
    });
  }
}
