import { db, auth } from './firebase-config.js';
import {
  collection, query, where, getDocs, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-lite.js';

// DOM Elements
const dateInput = document.getElementById('dateFilter');
const monthInput = document.getElementById('monthFilter');
const resetButton = document.getElementById('resetFilter');
const tableBody = document.getElementById('tableBody');

// Summary DOM elements
const prevBalanceEl = document.getElementById('prevBalance');
const currIncomeEl = document.getElementById('currIncome');
const currExpenseEl = document.getElementById('currExpense');
const totalBalanceEl = document.getElementById('totalBalance');
const summarySection = document.getElementById('summarySection');

auth.onAuthStateChanged(async (user) => {
  if (user) {
    loadAllData(user.uid);

    dateInput.addEventListener("change", () => {
      if (dateInput.value) {
        filterByDate(user.uid, dateInput.value);
        monthInput.value = "";
      }
    });

    monthInput.addEventListener("change", () => {
      if (monthInput.value) {
        filterByMonth(user.uid, monthInput.value);
        dateInput.value = "";
      }
    });

    resetButton.addEventListener("click", () => {
      dateInput.value = "";
      monthInput.value = "";
      loadAllData(user.uid);
    });
  }
});

// Load all data (reset)
async function loadAllData(uid) {
  const ref = collection(db, "users", uid, "transactions");
  const snapshot = await getDocs(ref);
  renderTable(snapshot.docs.map(doc => doc.data()));
  clearSummary(); // hide summary section
}

// Filter by date
async function filterByDate(uid, selectedDate) {
  const start = Timestamp.fromDate(new Date(selectedDate));
  const end = Timestamp.fromDate(new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1)));

  const q = query(
    collection(db, "users", uid, "transactions"),
    where("timestamp", ">=", start),
    where("timestamp", "<", end)
  );
  const snapshot = await getDocs(q);
  renderTable(snapshot.docs.map(doc => doc.data()));
  clearSummary(); // hide summary when filtering by date
}

// Filter by month with summary
async function filterByMonth(uid, selectedMonth) {
  const [year, month] = selectedMonth.split("-");
  const currentStart = new Date(year, month - 1, 1);
  const currentEnd = new Date(year, month, 1);
  const previousStart = new Date(year, month - 2, 1);
  const previousEnd = new Date(year, month - 1, 1);

  const transRef = collection(db, "users", uid, "transactions");

  // Previous month summary
  const prevQuery = query(
    transRef,
    where("timestamp", ">=", Timestamp.fromDate(previousStart)),
    where("timestamp", "<", Timestamp.fromDate(previousEnd))
  );
  const prevSnap = await getDocs(prevQuery);
  let prevIncome = 0, prevExpense = 0;
  prevSnap.forEach(doc => {
    const d = doc.data();
    if (d.type === "income") prevIncome += Number(d.amount);
    if (d.type === "expense") prevExpense += Number(d.amount);
  });
  const carryForward = prevIncome - prevExpense;

  // Current month summary
  const currQuery = query(
    transRef,
    where("timestamp", ">=", Timestamp.fromDate(currentStart)),
    where("timestamp", "<", Timestamp.fromDate(currentEnd))
  );
  const currSnap = await getDocs(currQuery);
  let currIncome = 0, currExpense = 0;
  const currentData = [];

  currSnap.forEach(doc => {
    const d = doc.data();
    currentData.push(d);
    if (d.type === "income") currIncome += Number(d.amount);
    if (d.type === "expense") currExpense += Number(d.amount);
  });

  const totalBalance = carryForward + currIncome - currExpense;

  // Show data and summary
  renderTable(currentData);
  updateSummary(carryForward, currIncome, currExpense, totalBalance);
}

// Render table
function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(item => {
    const date = item.timestamp.toDate().toLocaleDateString("bn-BD");
    const row = `
      <tr>
        <td>${date}</td>
        <td>${item.category || ""}</td>
        <td>${item.type}</td>
        <td>${item.amount}</td>
      </tr>`;
    tableBody.innerHTML += row;
  });
}

// Update summary section
function updateSummary(prev, income, expense, total) {
  prevBalanceEl.innerText = prev;
  currIncomeEl.innerText = income;
  currExpenseEl.innerText = expense;
  totalBalanceEl.innerText = total;
  summarySection.style.display = "block";
}

// Hide summary
function clearSummary() {
  prevBalanceEl.innerText = "";
  currIncomeEl.innerText = "";
  currExpenseEl.innerText = "";
  totalBalanceEl.innerText = "";
  summarySection.style.display = "none";
}
