# 🎓 College Request Management Portal

A clean, modern, and user-friendly web application for college students to submit, track, and manage service requests (Bonafide Certificates, Leave Applications, ID Card Replacements, etc.).

Built as a lightweight Node.js Express project with JSON persistence for academic assignment and viva demo.

---

## 🌟 Key Features

- **🔑 Student Authentication:** Simple login system with demo credentials.
- **📊 Interactive Dashboard:** Overview cards displaying total, pending, approved, and rejected requests along with recent submissions.
- **✍️ Quick Request Creation:** Short & easy form to submit new requests with auto-generated IDs (`REQ-001`, `REQ-002`, etc.).
- **📋 Request Management:** Comprehensive table with status filtering, viewing, editing, and deleting options.
- **🔒 Smart Business Rules:** Only **Pending** requests can be edited or deleted. Approved or Rejected requests are locked for security.
- **⚡ Viva Demo Switcher:** Quick status toggle buttons built-in for instant viva demo presentation.
- **💾 JSON File Database:** Simple persistence using `data/requests.json` without requiring external database setup.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Vanilla Blue Theme), JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** JSON File Storage (`fs` module)
- **Architecture:** RESTful API Architecture

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v14 or higher).

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/college-request-portal.git
cd college-request-portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the application
```bash
npm start
```

### 4. Open in Browser
Visit **`http://localhost:3000`** in your browser.

---

## 🔐 Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Student** | `student` | `student123` |

---

## 📁 File Structure

```text
college-request-portal/
├── server.js               # Express server & REST API endpoints
├── package.json            # Dependencies & start script
├── .gitignore              # Ignored files (node_modules, system files)
│
├── data/
│   └── requests.json       # JSON file database
│
└── public/                 # Frontend client static files
    ├── index.html          # Login page
    ├── dashboard.html      # Dashboard page
    ├── create-request.html # Create request form page
    ├── requests.html       # My Requests table & edit modal
    ├── request-details.html# Single request details page
    ├── css/
    │   └── style.css       # Clean, modern stylesheet
    └── js/
        ├── login.js        # Auth client logic
        ├── dashboard.js    # Dashboard logic
        ├── create-request.js # Form submission logic
        ├── requests.js     # Table CRUD & filter logic
        └── request-details.js # Details view logic
```

---

## 📝 License
This project is open-source under the MIT License. Developed for educational assignment purposes.
