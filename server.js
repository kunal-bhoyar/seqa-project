const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'requests.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Utility function to read requests from JSON file
function readRequests() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading requests.json:', error);
    return [];
  }
}

// Utility function to save requests to JSON file
function saveRequests(requests) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing requests.json:', error);
    return false;
  }
}

// Generate Next Request ID (e.g. REQ-001, REQ-002)
function generateNextId(requests) {
  let maxIdNum = 0;
  requests.forEach(req => {
    if (req.id && req.id.startsWith('REQ-')) {
      const numPart = parseInt(req.id.replace('REQ-', ''), 10);
      if (!isNaN(numPart) && numPart > maxIdNum) {
        maxIdNum = numPart;
      }
    }
  });
  const nextNum = maxIdNum + 1;
  return `REQ-${String(nextNum).padStart(3, '0')}`;
}

// REST APIs

// 1. Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'student' && password === 'student123') {
    return res.json({
      success: true,
      user: {
        username: 'student',
        name: 'Alex Johnson',
        role: 'Student',
        rollNo: 'CS-2024-042',
        department: 'Computer Science'
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials! Use student / student123'
    });
  }
});

// 2. GET all requests
app.get('/api/requests', (req, res) => {
  const requests = readRequests();
  res.json(requests);
});

// 3. GET single request by ID
app.get('/api/requests/:id', (req, res) => {
  const requests = readRequests();
  const request = requests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  res.json(request);
});

// 4. POST create new request
app.post('/api/requests', (req, res) => {
  const { type, title, description, requiredDate, attachment } = req.body;

  if (!type || !title || !description || !requiredDate) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const requests = readRequests();
  const newId = generateNextId(requests);

  const newRequest = {
    id: newId,
    type,
    title,
    description,
    requiredDate,
    attachment: attachment || 'None',
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0]
  };

  requests.unshift(newRequest); // prepend to show newest first
  saveRequests(requests);

  res.status(201).json({
    success: true,
    message: 'Request submitted successfully',
    request: newRequest
  });
});

// 5. PUT update request (Only when status is Pending)
app.put('/api/requests/:id', (req, res) => {
  const requests = readRequests();
  const index = requests.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Request not found' });
  }

  const existingRequest = requests[index];

  if (existingRequest.status !== 'Pending') {
    return res.status(403).json({ message: 'Editing is only allowed when status is Pending.' });
  }

  const { type, title, description, requiredDate, attachment } = req.body;

  requests[index] = {
    ...existingRequest,
    type: type || existingRequest.type,
    title: title || existingRequest.title,
    description: description || existingRequest.description,
    requiredDate: requiredDate || existingRequest.requiredDate,
    attachment: attachment !== undefined ? attachment : existingRequest.attachment
  };

  saveRequests(requests);
  res.json({ success: true, message: 'Request updated successfully', request: requests[index] });
});

// 6. DELETE request (Only when status is Pending)
app.delete('/api/requests/:id', (req, res) => {
  const requests = readRequests();
  const existingRequest = requests.find(r => r.id === req.params.id);

  if (!existingRequest) {
    return res.status(404).json({ message: 'Request not found' });
  }

  if (existingRequest.status !== 'Pending') {
    return res.status(403).json({ message: 'Deletion is only allowed when status is Pending.' });
  }

  const filteredRequests = requests.filter(r => r.id !== req.params.id);
  saveRequests(filteredRequests);

  res.json({ success: true, message: `Request ${req.params.id} deleted successfully` });
});

// 7. PATCH update status (Demo feature for Viva presentation)
app.patch('/api/requests/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be Pending, Approved, or Rejected.' });
  }

  const requests = readRequests();
  const request = requests.find(r => r.id === req.params.id);

  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  request.status = status;
  saveRequests(requests);

  res.json({ success: true, message: `Request status updated to ${status}`, request });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎓 College Request Management Portal Server Running`);
  console.log(`📍 Local URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
