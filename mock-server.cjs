const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Demo users for testing different roles
const DEMO_USERS = [
  {
    id: 'user-1',
    email: 'admin@demo.edu.gh',
    password: 'Admin@1234',
    name: 'Kwame Asante',
    role: 'SCHOOL_ADMIN',
    schoolId: 'school-1',
    schoolName: 'Accra Academy',
  },
  {
    id: 'user-2',
    email: 'teacher@demo.edu.gh',
    password: 'Teacher@1234',
    name: 'Ama Serwaa',
    role: 'CLASS_TEACHER',
    schoolId: 'school-1',
    schoolName: 'Accra Academy',
  },
  {
    id: 'user-3',
    email: 'super@demo.edu.gh',
    password: 'Super@1234',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    schoolId: null,
    schoolName: 'EduPortal Platform',
  },
];

// POST /auth/login
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({
    accessToken: 'mock-jwt-token-' + user.role,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
    },
  });
});

// POST /schools/register
app.post('/api/v1/schools/register', (req, res) => {
  const { name, email, password, headmasterName, plan } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  res.status(201).json({
    success: true,
    message: "Mock registration successful. Under review.",
    data: {
      id: 'school_mock_' + Date.now(),
      name,
      status: 'PENDING',
      plan: plan || 'BASIC',
    }
  });
});

// GET /schools
app.get('/api/v1/schools', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', name: 'Sunshine Academy', email: 'admin@sunshine.edu.gh', status: 'ACTIVE', plan: 'Premium' },
      { id: '2', name: 'Hilltop School', email: 'admin@hilltop.edu.gh', status: 'PENDING', plan: 'Basic' }
    ]
  });
});

// PATCH /schools/:id/status
app.patch('/api/v1/schools/:id/status', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      status: req.body.status
    }
  });
});

// POST /auth/refresh
app.post('/api/v1/auth/refresh', (req, res) => {
  res.json({ accessToken: 'mock-jwt-token-refreshed' });
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[Mock API] Running on http://localhost:${PORT}`);
  console.log('[Mock API] Demo accounts:');
  console.log('  admin@demo.edu.gh / Admin@1234  → SCHOOL_ADMIN');
  console.log('  teacher@demo.edu.gh / Teacher@1234  → CLASS_TEACHER');
  console.log('  super@demo.edu.gh / Super@1234  → SUPER_ADMIN');
  console.log('[Mock API] Register: POST /api/v1/auth/register');
});