try {
      const activeSession = JSON.parse(localStorage.getItem('activeUser'));
      if (activeSession && activeSession.email && activeSession.firstName) {
        window.location.href = 'dashboard.html';
      }
    } catch (e) {
      localStorage.removeItem('activeUser');
    }

    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const gotoSignup = document.getElementById('gotoSignup');
    const gotoLogin = document.getElementById('gotoLogin');
    const alertBox = document.getElementById('alertBox');

    function hideAlert() {
      alertBox.style.display = 'none';
      alertBox.innerText = '';
    }

    function showAlert(msg) {
      alertBox.innerText = msg;
      alertBox.style.display = 'block';
    }

    function showLogin() {
      hideAlert();
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
    }

    function showSignup() {
      hideAlert();
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
    }

    loginTab.addEventListener('click', showLogin);
    signupTab.addEventListener('click', showSignup);
    gotoSignup.addEventListener('click', showSignup);
    gotoLogin.addEventListener('click', showLogin);

    // SIGN UP LOGIC
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();

      const email = document.getElementById('signup-email').value.toLowerCase().trim();
      const password = document.getElementById('signup-password').value;
      const confirmPass = document.getElementById('confirm-password').value;
      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();

      if (password !== confirmPass) {
        showAlert("Passwords do not match.");
        return;
      }

      const userData = { email, password, firstName, lastName };
      localStorage. setItem(`user_${email}`, JSON.stringify(userData));
      localStorage.setItem('activeUser', JSON.stringify(userData));
      window.location.href = 'dashboard.html';
    });

    // LOG IN LOGIC
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();

      const email = document.getElementById('login-email').value.toLowerCase().trim();
      const password = document.getElementById('login-password').value;
      const storedUser = localStorage.getItem(`user_${email}`);

      if (!storedUser) {
        showAlert("No account found with this email. Please register first.");
        return;
      }

      let userData;
      try {
        userData = JSON.parse(storedUser);
      } catch(err) {
        showAlert("Account data error. Please register again.");
        return;
      }

      if (userData.password !== password) {
        showAlert("Incorrect password. Please try again.");
        return;
      }

      localStorage.setItem('activeUser', JSON.stringify(userData));
      window.location.href = 'dashboarsrd.html';
    });