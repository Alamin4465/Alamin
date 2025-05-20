document.getElementById("applyDateFilter").addEventListener("click", () => {
const monthValue = document.getElementById("monthFilter").value;
const dateValue = document.getElementById("dateFilter").value;
const user = firebase.auth().currentUser;

if (!user) return;

const userId = user.uid;
const db = firebase.firestore();
const filteredTableBody = document.querySelector("#filteredTransactionTable tbody");
filteredTableBody.innerHTML = "";

db.collection("users")
.doc(userId)
.collection("transactions")
.orderBy("timestamp", "desc")
.get()
.then(snapshot => {
let filteredData = [];
snapshot.forEach(doc => {
const data = doc.data();
const date = data.date;

if (monthValue && date.startsWith(monthValue)) {  
      filteredData.push(data);  
    } else if (dateValue && date === dateValue) {  
      filteredData.push(data);  
    }  
  });  

  let totalIncome = 0;  
  let totalExpense = 0;  

  filteredData.forEach(data => {  
    const row = document.createElement("tr");  
    const incomeAmount = data.type === "income" ? data.amount : "";  
    const expenseAmount = data.type === "expense" ? data.amount : "";  

    if (data.type === "income") totalIncome += parseFloat(data.amount);  
    if (data.type === "expense") totalExpense += parseFloat(data.amount);  

    row.innerHTML = `  
      <td>${data.date}</td>  
      <td>${data.category}</td>  
      <td>${incomeAmount}</td>  
      <td>${expenseAmount}</td>  
    `;  
    filteredTableBody.appendChild(row);  
  });  

  const summaryRow = document.createElement("tr");  
  summaryRow.innerHTML = `  
    <td colspan="2"><strong>মোট</strong></td>  
    <td><strong>${totalIncome}</strong></td>  
    <td><strong>${totalExpense}</strong></td>  
  `;  
  filteredTableBody.appendChild(summaryRow);  
});

});

এই রকম কোড দিলে আসে

