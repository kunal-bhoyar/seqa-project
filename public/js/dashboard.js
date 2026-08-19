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

  // Load Dashboard Data
  fetchDashboardData();
});

async function fetchDashboardData() {
  try {
    const response = await fetch('/api/requests');
    if (!response.ok) throw new Error('Failed to fetch requests');
    const requests = await response.json();

    // Calculate Statistics
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-approved').textContent = approved;
    document.getElementById('stat-rejected').textContent = rejected;

    // Render Recent Requests Table (Top 5)
    const recentRequestsBody = document.getElementById('recent-requests-body');
    const recent = requests.slice(0, 5);

    if (recent.length === 0) {
      recentRequestsBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">
            No requests found. Click "+ New Request" to create your first request.
          </td>
        </tr>
      `;
      return;
    }

    recentRequestsBody.innerHTML = recent.map(req => `
      <tr>
        <td><strong>${escapeHtml(req.id)}</strong></td>
        <td>${escapeHtml(req.type)}</td>
        <td>${escapeHtml(req.title)}</td>
        <td>${escapeHtml(req.requiredDate)}</td>
        <td>
          <span class="badge badge-${req.status.toLowerCase()}">${escapeHtml(req.status)}</span>
        </td>
        <td>
          <a href="request-details.html?id=${escapeHtml(req.id)}" class="btn btn-outline btn-sm">View</a>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    const recentRequestsBody = document.getElementById('recent-requests-body');
    if (recentRequestsBody) {
      recentRequestsBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 2rem; color: var(--rejected-color);">
            Error loading requests data from server.
          </td>
        </tr>
      `;
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
