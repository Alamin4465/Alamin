document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // লগইন সফল
      alert("সফলভাবে লগইন হয়েছে!");
      window.location.href = "index.html"; // ড্যাশবোর্ডে পাঠিয়ে দিন
    })
    .catch((error) => {
      // এরর দেখান
      alert("লগইন ব্যর্থ: " + error.message);
    });
});
