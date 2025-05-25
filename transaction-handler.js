
// Realtime listener for transactions
function loadTransactions(user) {
  const tbody = document.querySelector("#transactionTable tbody");
  firebase.firestore()
    .collection("users")
    .doc(user.uid)
    .collection("transactions")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      tbody.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.date}</td>
          <td>${data.type}</td>
          <td>${data.category}</td>
          <td>${data.amount} ৳</td>
          <td>
            <button class="editBtn" data-id="${doc.id}">এডিট</button>
            <button class="deleteBtn" data-id="${doc.id}">ডিলিট</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    });
}

// Edit and delete button actions
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
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        docRef.update(updatedData).then(() => {
          document.getElementById("transactionForm").reset();
          document.getElementById("transactionForm").onsubmit = submitHandler;
        });
      };
    });
  }
});
