document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const ageInput = document.getElementById('age');
  const genderSelect = document.getElementById('gender');

  const emailStatus = document.getElementById('emailStatus');
  const passStatus = document.getElementById('passStatus');
  const confirmStatus = document.getElementById('confirmStatus');
  const passError = document.getElementById('passError');
  const confirmError = document.getElementById('confirmError');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value)) {
      emailInput.classList.add('valid');
      emailInput.classList.remove('invalid');
      emailStatus.textContent = '✅';
    } else {
      emailInput.classList.add('invalid');
      emailInput.classList.remove('valid');
      emailStatus.textContent = '❌';
    }
  });

  passwordInput.addEventListener('input', () => {
    if (validatePassword(passwordInput.value)) {
      passwordInput.classList.add('valid');
      passwordInput.classList.remove('invalid');
      passStatus.textContent = '✅';
      passError.textContent = '';
    } else {
      passwordInput.classList.add('invalid');
      passwordInput.classList.remove('valid');
      passStatus.textContent = '❌';
      passError.textContent = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
    }
  });

  confirmInput.addEventListener('input', () => {
    if (confirmInput.value === passwordInput.value && confirmInput.value !== '') {
      confirmInput.classList.add('valid');
      confirmInput.classList.remove('invalid');
      confirmStatus.textContent = '✅';
      confirmError.textContent = '';
    } else {
      confirmInput.classList.add('invalid');
      confirmInput.classList.remove('valid');
      confirmStatus.textContent = '❌';
      confirmError.textContent = 'পাসওয়ার্ড মিলছে না';
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    const age = ageInput.value.trim();
    const gender = genderSelect.value;

    // Validation Check
    if (!validateEmail(email)) {
      alert("সঠিক ইমেইল দিন");
      return;
    }

    if (!validatePassword(password)) {
      alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    if (password !== confirmPassword) {
      alert("পাসওয়ার্ড নিশ্চিতকরণ মিলছে না");
      return;
    }

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      await firebase.firestore().collection("users").doc(uid).set({
        name,
        email,
        age,
        gender,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("নিবন্ধন সফল হয়েছে!");
      window.location.href = "index.html"; // ড্যাশবোর্ড বা হোমপেজ
    } catch (error) {
      console.error("Error during registration:", error);
      alert("ত্রুটি: " + error.message);
    }
  });
});
