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



// ইনপুট ফিল্ডগুলো রেফারেন্স করুন
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const ageInput = document.getElementById('age');
const genderSelect = document.getElementById('gender');
const submitBtn = document.getElementById('submitBtn');

const emailStatus = document.getElementById('emailStatus');
const passStatus = document.getElementById('passStatus');
const confirmStatus = document.getElementById('confirmStatus');
const passError = document.getElementById('passError');
const confirmError = document.getElementById('confirmError');

// ইমেইল চেক
emailInput.addEventListener('input', () => {
  const email = emailInput.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(email)) {
    emailInput.classList.add('valid');
    emailInput.classList.remove('invalid');
    emailStatus.textContent = '✔️';
  } else {
    emailInput.classList.add('invalid');
    emailInput.classList.remove('valid');
    emailStatus.textContent = '❌';
  }

  checkFormValidity();
});

// পাসওয়ার্ড চেক
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;

  if (password.length >= 6) {
    passwordInput.classList.add('valid');
    passwordInput.classList.remove('invalid');
    passStatus.textContent = '✔️';
    passError.textContent = '';
  } else {
    passwordInput.classList.add('invalid');
    passwordInput.classList.remove('valid');
    passStatus.textContent = '❌';
    passError.textContent = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
  }

  checkFormValidity();
  validateConfirmPassword();
});

// কনফার্ম পাসওয়ার্ড চেক
confirmPasswordInput.addEventListener('input', validateConfirmPassword);

function validateConfirmPassword() {
  if (confirmPasswordInput.value === passwordInput.value && passwordInput.value.length >= 6) {
    confirmPasswordInput.classList.add('valid');
    confirmPasswordInput.classList.remove('invalid');
    confirmStatus.textContent = '✔️';
    confirmError.textContent = '';
  } else {
    confirmPasswordInput.classList.add('invalid');
    confirmPasswordInput.classList.remove('valid');
    confirmStatus.textContent = '❌';
    confirmError.textContent = 'পাসওয়ার্ড মিলছে না';
  }

  checkFormValidity();
}

// সব ফিল্ড ভ্যালিড কিনা চেক করে সাবমিট বাটন একটিভ করে
function checkFormValidity() {
  const isValid =
    nameInput.value.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value) &&
    passwordInput.value.length >= 6 &&
    passwordInput.value === confirmPasswordInput.value &&
    ageInput.value !== '' &&
    genderSelect.value !== '';

  submitBtn.disabled = !isValid;
}

// রেজিস্ট্রেশন সাবমিট
document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const age = parseInt(ageInput.value);
  const gender = genderSelect.value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      // Firestore-এ ইউজারের অতিরিক্ত তথ্য সেভ করা
      return firebase.firestore().collection('users').doc(uid).set({
        name,
        email,
        age,
        gender,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("সফলভাবে নিবন্ধন সম্পন্ন হয়েছে!");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert("রেজিস্ট্রেশন ব্যর্থ: " + error.message);
    });
});
