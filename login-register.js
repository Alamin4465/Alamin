// Email validation function
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Show visual feedback
const emailInput = document.getElementById("email");
if (emailInput) {
  emailInput.addEventListener("input", () => {
    if (validateEmail(emailInput.value)) {
      emailInput.classList.add("valid");
      emailInput.classList.remove("invalid");
    } else {
      emailInput.classList.add("invalid");
      emailInput.classList.remove("valid");
    }
  });
}

// Registration
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;

  if (!validateEmail(email)) {
    alert("সঠিক ইমেইল লিখুন!");
    return;
  }

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
