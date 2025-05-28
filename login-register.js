
// রেজিস্ট্রেশন ফর্ম যাচাই ও সাবমিট
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const name = document.getElementById('name');
  const age = document.getElementById('age');
  const gender = document.getElementById('gender');
  const submitBtn = document.getElementById('submitBtn');

  const emailStatus = document.getElementById('emailStatus');
  const passStatus = document.getElementById('passStatus');
  const confirmStatus = document.getElementById('confirmStatus');
  const passError = document.getElementById('passError');
  const confirmError = document.getElementById('confirmError');

  // ইনপুট যাচাই
  function validateInputs() {
    let valid = true;

    // Email যাচাই
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
      email.classList.add('invalid');
      email.classList.remove('valid');
      emailStatus.innerText = "❌";
      valid = false;
    } else {
      email.classList.remove('invalid');
      email.classList.add('valid');
      emailStatus.innerText = "✅";
    }

    // পাসওয়ার্ড যাচাই
    if (password.value.length < 8) {
      password.classList.add('invalid');
      password.classList.remove('valid');
      passStatus.innerText = "❌";
      passError.innerText = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
      valid = false;
    } else {
      password.classList.remove('invalid');
      password.classList.add('valid');
      passStatus.innerText = "✅";
      passError.innerText = "";
    }

    // কনফার্ম পাসওয়ার্ড যাচাই
    if (confirmPassword.value !== password.value || confirmPassword.value === "") {
      confirmPassword.classList.add('invalid');
      confirmPassword.classList.remove('valid');
      confirmStatus.innerText = "❌";
      confirmError.innerText = "পাসওয়ার্ড মেলেনি";
      valid = false;
    } else {
      confirmPassword.classList.remove('invalid');
      confirmPassword.classList.add('valid');
      confirmStatus.innerText = "✅";
      confirmError.innerText = "";
    }

    submitBtn.disabled = !valid;
  }

  email.addEventListener('input', validateInputs);
  password.addEventListener('input', validateInputs);
  confirmPassword.addEventListener('input', validateInputs);

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    auth.createUserWithEmailAndPassword(email.value, password.value)
      .then((cred) => {
        return db.collection('users').doc(cred.user.uid).set({
          name: name.value,
          email: email.value,
          age: age.value,
          gender: gender.value
        });
      })
      .then(() => {
        alert("নিবন্ধন সফল হয়েছে!");
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert("ভুল: " + error.message);
      });
  });
}

// লগইন ফর্ম
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginEmail = document.getElementById('loginEmail').value.trim();
    const loginPassword = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(loginEmail, loginPassword)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert("লগইন ব্যর্থ: " + error.message);
      });
  });
}
