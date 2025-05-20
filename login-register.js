// রেজিস্ট্রেশন
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;

      return db.collection("users").doc(userId).set({
        name,
        email,
        age,
        gender,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("রেজিস্ট্রেশন সফল!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("রেজিস্ট্রেশন ব্যর্থ: " + error.message);
    });
});

// লগইন
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("লগইন ব্যর্থ: " + error.message);
    });
});
