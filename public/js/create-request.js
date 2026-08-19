document.addEventListener('DOMContentLoaded', () => {
  // Check auth session
  const currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    window.location.href = 'index.html';
    return;
  }

  const currentUser = JSON.parse(currentUserRaw);
  const userDisplay = document.getElementById('user-display');
  if (userDisplay) {
    userDisplay.textContent = `${currentUser.name || 'Student'} (${currentUser.username})`;
  }

  // Logout handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
  }

  // Set default required date to 5 days from today
  const dateInput = document.getElementById('required-date');
  if (dateInput) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    dateInput.value = futureDate.toISOString().split('T')[0];
  }

  // Form submission handler
  const form = document.getElementById('create-request-form');
  const successAlert = document.getElementById('success-alert');
  const errorAlert = document.getElementById('error-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successAlert.classList.add('hidden');
    errorAlert.classList.add('hidden');

    const type = document.getElementById('request-type').value;
    const title = document.getElementById('request-title').value.trim();
    const description = document.getElementById('request-desc').value.trim();
    const requiredDate = document.getElementById('required-date').value;
    const fileInput = document.getElementById('attachment');
    
    let attachmentName = 'None';
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      attachmentName = fileInput.files[0].name;
    }

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description,
          requiredDate,
          attachment: attachmentName
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        successAlert.innerHTML = `
          <div>
            <strong>✓ Request submitted successfully!</strong><br>
            Generated Request ID: <strong>${data.request.id}</strong><br>
            <div style="margin-top: 0.5rem;">
              <a href="requests.html" class="btn btn-primary btn-sm">View in My Requests</a>
              <a href="request-details.html?id=${data.request.id}" class="btn btn-outline btn-sm">View Details</a>
            </div>
          </div>
        `;
        successAlert.classList.remove('hidden');
        form.reset();

        // Re-set default date
        if (dateInput) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 5);
          dateInput.value = futureDate.toISOString().split('T')[0];
        }
      } else {
        errorAlert.textContent = data.message || 'Failed to submit request.';
        errorAlert.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      errorAlert.textContent = 'Server connection error. Please try again.';
      errorAlert.classList.remove('hidden');
    }
  });
});
