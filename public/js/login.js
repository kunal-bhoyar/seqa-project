document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const alertBox = document.getElementById('login-alert');

  // If user is already logged in, redirect to dashboard
  if (localStorage.getItem('currentUser')) {
    window.location.href = 'dashboard.html';
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.classList.add('hidden');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save user details to localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
      } else {
        alertBox.textContent = data.message || 'Invalid username or password';
        alertBox.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Login error:', error);
      alertBox.textContent = 'Server connection error. Please try again.';
      alertBox.classList.remove('hidden');
    }
  });
});
