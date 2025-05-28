// Registration Handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const age = document.getElementById('age').value.trim();
  const gender = document.getElementById('gender').value;

  // Validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("সঠিক ইমেইল প্রদান করুন");
    return;
  }

  if (password.length < 6) {
    alert("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
    return;
  }

  if (password !== confirmPassword) {
    alert("পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মিলছে না");
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    await db.collection('users').doc(uid).set({
      name,
      email,
      age,
      gender,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("রেজিস্ট্রেশন সফল হয়েছে!");
    window.location.href = "login.html";
  } catch (error) {
    alert("রেজিস্ট্রেশন ত্রুটি: " + error.message);
  }
});

// Login Handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("লগইন সফল হয়েছে!");
    window.location.href = "index.html";
  } catch (error) {
    alert("লগইন ত্রুটি: " + error.message);
  }
});
