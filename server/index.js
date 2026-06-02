require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const DUMMYJSON_BASE_URL = process.env.DUMMYJSON_BASE_URL || 'https://dummyjson.com';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:4174',
    'http://127.0.0.1:4174'
  ],
  credentials: true,
}));
app.use(express.json());

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  maidenName: user.maidenName,
  age: user.age,
  gender: user.gender,
  phone: user.phone,
  birthDate: user.birthDate,
  image: user.image,
});

async function fetchDummyUsers() {
  const response = await axios.get(`${DUMMYJSON_BASE_URL}/users`);
  return response.data.users || [];
}

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = await fetchDummyUsers();
    const matchedUser = users.find((user) => user.username === username && user.password === password);

    if (!matchedUser) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const payload = {
      sub: matchedUser.id,
      username: matchedUser.username,
      email: matchedUser.email,
      firstName: matchedUser.firstName,
      lastName: matchedUser.lastName,
      maidenName: matchedUser.maidenName,
      age: matchedUser.age,
      gender: matchedUser.gender,
      phone: matchedUser.phone,
      birthDate: matchedUser.birthDate,
      image: matchedUser.image,
    };
    //....................................................
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '60s' });
    const refreshToken = jwt.sign({ sub: matchedUser.id, type: 'refresh', username: matchedUser.username }, JWT_SECRET, { expiresIn: '180s' });
    //....................................................
    return res.json({
      user: sanitizeUser(matchedUser),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error?.message);
    return res.status(500).json({ message: 'Failed to authenticate user.' });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const users = await fetchDummyUsers();
    const matchedUser = users.find((user) => String(user.id) === String(decoded.sub));

    if (!matchedUser) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const payload = {
      sub: matchedUser.id,
      username: matchedUser.username,
      email: matchedUser.email,
      firstName: matchedUser.firstName,
      lastName: matchedUser.lastName,
      maidenName: matchedUser.maidenName,
      age: matchedUser.age,
      gender: matchedUser.gender,
      phone: matchedUser.phone,
      birthDate: matchedUser.birthDate,
      image: matchedUser.image,
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '60s' });

    return res.json({
      accessToken: newAccessToken,
      user: sanitizeUser(matchedUser),
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    console.error('Refresh error:', error?.message);
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
});

app.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';

    if (!token) {
      return res.status(401).json({ message: 'Missing bearer token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return res.json({
      user: {
        id: decoded.sub,
        username: decoded.username,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        maidenName: decoded.maidenName,
        age: decoded.age,
        gender: decoded.gender,
        phone: decoded.phone,
        birthDate: decoded.birthDate,
        image: decoded.image,
      },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }

    return res.status(401).json({ message: 'Invalid token.' });
  }
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Auth server listening on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Retrying on port ${nextPort}.`);
      startServer(nextPort);
      return;
    }

    console.error('Server startup error:', error);
    process.exit(1);
  });
};


// Fake database
let tasks = [];

// GET all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// ADD task
app.post("/tasks", (req, res) => {
    console.log("BODY:", req.body);

    const newTask = {
        id: Date.now(),
        title: req.body.title,
        completed: false
    };

    tasks.push(newTask);
    res.json(newTask);
});

// TOGGLE complete
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  res.json({ message: "Updated" });
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  tasks = tasks.filter(task => task.id !== id);
  res.json({ message: "Deleted" });
});

startServer(Number(PORT));
