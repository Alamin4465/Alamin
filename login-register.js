// login-register.js

// Firebase initialization should already be in firebase-config.js
const auth = firebase.auth();
const db = firebase.firestore();

// ======= Registration Logic =======
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const ageInput = document.getElementById("age");
  const genderSelect = document.getElementById("gender");

  const emailStatus = document.getElementById("emailStatus");
  const passStatus = document.getElementById("passStatus");
  const confirmStatus = document.getElementById("confirmStatus");
  const passError = document.getElementById("passError");
  const confirmError = document.getElementById("confirmError");
  const submitBtn = document.getElementById("submitBtn");

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    return password.length >= 8;
  }

  function checkValidity() {
    const emailValid = validateEmail(emailInput.value);
    const passwordValid = validatePassword(passwordInput.value);
    const passwordsMatch = passwordInput.value === confirmPasswordInput.value;

    emailInput.classList.toggle("valid", emailValid);
    emailInput.classList.toggle("invalid", !emailValid);
    emailStatus.textContent = emailValid ? "✔️" : "❌";

    passwordInput.classList.toggle("valid", passwordValid);
    passwordInput.classList.toggle("invalid", !passwordValid);
    passStatus.textContent = passwordValid ? "✔️" : "❌";
    passError.textContent = passwordValid ? "" : "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";

    confirmPasswordInput.classList.toggle("valid", passwordsMatch);
    confirmPasswordInput.classList.toggle("invalid", !passwordsMatch);
    confirmStatus.textContent = passwordsMatch ? "✔️" : "❌";
    confirmError.textContent = passwordsMatch ? "" : "পাসওয়ার্ড মিলছে না";

    submitBtn.disabled = !(
      nameInput.value.trim() &&
      emailValid &&
      passwordValid &&
      passwordsMatch &&
      ageInput.value &&
      genderSelect.value
    );
  }

  emailInput.addEventListener("input", checkValidity);
  passwordInput.addEventListener("input", checkValidity);
  confirmPasswordInput.addEventListener("input", checkValidity);
  nameInput.addEventListener("input", checkValidity);
  ageInput.addEventListener("input", checkValidity);
  genderSelect.addEventListener("change", checkValidity);

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const age = ageInput.value;
    const gender = genderSelect.value;

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await db.collection("users").doc(user.uid).set({
        name,
        email,
        age,
        gender,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("নিবন্ধন সফল হয়েছে!");
      window.location.href = "index.html";
    } catch (error) {
      alert("নিবন্ধনে সমস্যা হয়েছে: " + error.message);
    }
  });
}

// ======= Login Logic =======
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = "index.html";
    } catch (error) {
      alert("লগইন ব্যর্থ: " + error.message);
    }
  });
}
