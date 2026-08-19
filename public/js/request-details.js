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

  // Get ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');

  if (!requestId) {
    renderError('No Request ID specified in URL.');
    return;
  }

  loadRequestDetails(requestId);
});

async function loadRequestDetails(id) {
  const container = document.getElementById('details-container');
  try {
    const response = await fetch(`/api/requests/${id}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Request not found');
      throw new Error('Failed to load request details');
    }

    const req = await response.json();
    renderDetails(req);
  } catch (error) {
    renderError(error.message);
  }
}

function renderDetails(req) {
  const container = document.getElementById('details-container');
  const isPending = req.status === 'Pending';

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
      <div>
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">REQUEST ID</span>
        <h2 style="font-size: 1.75rem; color: var(--primary-color);">${escapeHtml(req.id)}</h2>
      </div>
      <div>
        <span class="badge badge-${req.status.toLowerCase()}" style="font-size: 0.95rem; padding: 0.4rem 1rem;">
          ${escapeHtml(req.status)}
        </span>
      </div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Request Type</div>
      <div class="detail-value"><strong>${escapeHtml(req.type)}</strong></div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Request Title</div>
      <div class="detail-value">${escapeHtml(req.title)}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Description</div>
      <div class="detail-value" style="white-space: pre-wrap;">${escapeHtml(req.description)}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Required Date</div>
      <div class="detail-value">${escapeHtml(req.requiredDate)}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Submission Date</div>
      <div class="detail-value">${escapeHtml(req.createdAt || 'N/A')}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Attachment</div>
      <div class="detail-value">
        ${req.attachment && req.attachment !== 'None' 
          ? `📎 <span style="text-decoration: underline; color: var(--primary-color); cursor: pointer;">${escapeHtml(req.attachment)}</span>`
          : '<span style="color: var(--text-muted);">No attachment attached</span>'}
      </div>
    </div>

    <!-- Viva Demo Status Toggle Section -->
    <div style="margin-top: 2rem; padding: 1.25rem; background-color: var(--primary-light); border-radius: 8px; border: 1px solid #bfdbfe;">
      <strong style="color: #1e40af; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">
        ⚡ Viva Demo Quick Status Switcher:
      </strong>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button onclick="updateStatus('${req.id}', 'Pending')" class="btn btn-secondary btn-sm" ${req.status === 'Pending' ? 'disabled' : ''}>Set Pending</button>
        <button onclick="updateStatus('${req.id}', 'Approved')" class="btn btn-primary btn-sm" style="background-color: var(--approved-color);" ${req.status === 'Approved' ? 'disabled' : ''}>Approve Request</button>
        <button onclick="updateStatus('${req.id}', 'Rejected')" class="btn btn-danger btn-sm" ${req.status === 'Rejected' ? 'disabled' : ''}>Reject Request</button>
      </div>
    </div>

    <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
      <a href="requests.html" class="btn btn-secondary">Back to List</a>
      
      ${isPending ? `
        <button onclick="deleteFromDetails('${req.id}')" class="btn btn-danger">Delete Request</button>
      ` : `
        <button class="btn btn-danger btn-disabled" disabled title="Only Pending requests can be deleted">Delete (Disabled)</button>
      `}
    </div>
  `;
}

async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`/api/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showAlert(`✓ Request status successfully changed to "${newStatus}"`);
      loadRequestDetails(id);
    } else {
      alert(data.message || 'Failed to update status.');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Server error updating status.');
  }
}

async function deleteFromDetails(id) {
  if (!confirm(`Are you sure you want to delete request ${id}?`)) return;

  try {
    const response = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (response.ok && data.success) {
      alert(`Request ${id} deleted successfully.`);
      window.location.href = 'requests.html';
    } else {
      alert(data.message || 'Failed to delete request.');
    }
  } catch (error) {
    console.error('Error deleting request:', error);
    alert('Server error deleting request.');
  }
}

function showAlert(message) {
  const alertBox = document.getElementById('details-alert');
  if (!alertBox) return;

  alertBox.textContent = message;
  alertBox.classList.remove('hidden');

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 3500);
}

function renderError(msg) {
  const container = document.getElementById('details-container');
  container.innerHTML = `
    <div class="text-center" style="padding: 2rem;">
      <h3 style="color: var(--rejected-color); margin-bottom: 0.5rem;">Error</h3>
      <p style="color: var(--text-muted);">${escapeHtml(msg)}</p>
      <a href="requests.html" class="btn btn-primary" style="margin-top: 1.5rem; display: inline-block;">Back to My Requests</a>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
