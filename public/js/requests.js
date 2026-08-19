let allRequests = [];

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

  // Filter dropdown listener
  const filterSelect = document.getElementById('filter-status');
  if (filterSelect) {
    filterSelect.addEventListener('change', renderRequestsTable);
  }

  // Edit Modal controls
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  const editForm = document.getElementById('edit-request-form');
  if (editForm) {
    editForm.addEventListener('submit', handleEditSubmit);
  }

  // Initial load
  loadRequests();
});

async function loadRequests() {
  try {
    const response = await fetch('/api/requests');
    if (!response.ok) throw new Error('Failed to fetch requests');
    allRequests = await response.json();
    renderRequestsTable();
  } catch (error) {
    console.error('Error loading requests:', error);
    const tbody = document.getElementById('requests-table-body');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 2rem; color: var(--rejected-color);">
            Error loading requests from server.
          </td>
        </tr>
      `;
    }
  }
}

function renderRequestsTable() {
  const tbody = document.getElementById('requests-table-body');
  const filterValue = document.getElementById('filter-status').value;

  let filtered = allRequests;
  if (filterValue !== 'ALL') {
    filtered = allRequests.filter(r => r.status === filterValue);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-muted);">
          No ${filterValue !== 'ALL' ? filterValue : ''} requests found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(req => {
    const isPending = req.status === 'Pending';

    return `
      <tr>
        <td><strong>${escapeHtml(req.id)}</strong></td>
        <td>${escapeHtml(req.type)}</td>
        <td>${escapeHtml(req.title)}</td>
        <td>${escapeHtml(req.requiredDate)}</td>
        <td>
          <span class="badge badge-${req.status.toLowerCase()}">${escapeHtml(req.status)}</span>
        </td>
        <td>
          <!-- Demo Status Change Selector for Viva -->
          <select class="form-select" style="padding: 0.25rem 0.4rem; font-size: 0.8rem; width: auto;" onchange="changeStatus('${req.id}', this.value)">
            <option value="Pending" ${req.status === 'Pending' ? 'selected' : ''}>Set Pending</option>
            <option value="Approved" ${req.status === 'Approved' ? 'selected' : ''}>Set Approved</option>
            <option value="Rejected" ${req.status === 'Rejected' ? 'selected' : ''}>Set Rejected</option>
          </select>
        </td>
        <td>
          <div class="flex-gap">
            <a href="request-details.html?id=${escapeHtml(req.id)}" class="btn btn-outline btn-sm" title="View Details">View</a>
            
            ${isPending ? `
              <button onclick="openEditModal('${req.id}')" class="btn btn-secondary btn-sm" title="Edit Request">Edit</button>
              <button onclick="deleteRequest('${req.id}')" class="btn btn-danger btn-sm" title="Delete Request">Delete</button>
            ` : `
              <button class="btn btn-secondary btn-sm btn-disabled" disabled title="Only Pending requests can be edited">Edit</button>
              <button class="btn btn-danger btn-sm btn-disabled" disabled title="Only Pending requests can be deleted">Delete</button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Open Edit Modal for a Pending request
function openEditModal(id) {
  const request = allRequests.find(r => r.id === id);
  if (!request) return;

  if (request.status !== 'Pending') {
    showAlert('Only Pending requests can be edited!', 'danger');
    return;
  }

  document.getElementById('edit-id').value = request.id;
  document.getElementById('edit-req-id').textContent = request.id;
  document.getElementById('edit-type').value = request.type;
  document.getElementById('edit-title').value = request.title;
  document.getElementById('edit-desc').value = request.description;
  document.getElementById('edit-date').value = request.requiredDate;

  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

// Save Edit Changes (PUT)
async function handleEditSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('edit-id').value;
  const type = document.getElementById('edit-type').value;
  const title = document.getElementById('edit-title').value.trim();
  const description = document.getElementById('edit-desc').value.trim();
  const requiredDate = document.getElementById('edit-date').value;

  try {
    const response = await fetch(`/api/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, description, requiredDate })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      closeEditModal();
      showAlert(`✓ Request ${id} updated successfully!`, 'success');
      loadRequests();
    } else {
      alert(data.message || 'Failed to update request.');
    }
  } catch (error) {
    console.error('Error updating request:', error);
    alert('Server error while updating request.');
  }
}

// Delete Request (DELETE)
async function deleteRequest(id) {
  const request = allRequests.find(r => r.id === id);
  if (!request) return;

  if (request.status !== 'Pending') {
    showAlert('Only Pending requests can be deleted!', 'danger');
    return;
  }

  if (!confirm(`Are you sure you want to delete request ${id} ("${request.title}")?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/requests/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showAlert(`✓ Request ${id} deleted successfully!`, 'success');
      loadRequests();
    } else {
      showAlert(data.message || 'Failed to delete request.', 'danger');
    }
  } catch (error) {
    console.error('Error deleting request:', error);
    showAlert('Server error while deleting request.', 'danger');
  }
}

// Viva Demo: Change Status (PATCH)
async function changeStatus(id, newStatus) {
  try {
    const response = await fetch(`/api/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showAlert(`✓ Status for ${id} changed to "${newStatus}"!`, 'success');
      loadRequests();
    } else {
      showAlert(data.message || 'Failed to change status.', 'danger');
    }
  } catch (error) {
    console.error('Error changing status:', error);
    showAlert('Server error while updating status.', 'danger');
  }
}

function showAlert(message, type = 'success') {
  const alertBox = document.getElementById('alert-box');
  if (!alertBox) return;

  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove('hidden');

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
