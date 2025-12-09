// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req,res) => {
  try {
    const { email, password, display_name, role } = req.body;
    const existing = await User.findOne({ where: { email }});
    if (existing) return res.status(400).json({ message: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash: hash, display_name, role: role || 'student' });
    res.json({ ok: true, userId: user.id });
  } catch(err){ console.error(err); res.status(500).json({ message: 'error' }); }
});

router.post('/login', async (req,res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name }});
  } catch (err) { console.error(err); res.status(500).json({ message:'error' }); }
});

module.exports = router;
