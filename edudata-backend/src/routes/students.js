// routes/students.js
const express = require('express');
const { StudentProfile } = require('../models');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Teacher creates/updates student profile
router.post('/', auth, requireRole('teacher'), async (req,res) => {
  try {
    const { user_id, name, aadhaar_last4, year, institution, cgpa, attendance, projects, placement_status, company, package_lpa, other_fields } = req.body;
    if (!user_id) return res.status(400).json({ message: 'user_id required' });

    // find existing
    let profile = await StudentProfile.findOne({ where: { user_id } });
    if (profile) {
      await profile.update({ name, aadhaar_last4, year, institution, cgpa, attendance, projects, placement_status, company, package_lpa, other_fields });
      profile = await StudentProfile.findOne({ where: { user_id } });
    } else {
      profile = await StudentProfile.create({ user_id, name, aadhaar_last4, year, institution, cgpa, attendance, projects, placement_status, company, package_lpa, other_fields });
    }
    res.json({ ok: true, profile });
  } catch (err) { console.error(err); res.status(500).json({ message: 'error' }); }
});

// Student gets their own profile
router.get('/me', auth, async (req,res) => {
  try {
    const profile = await StudentProfile.findOne({ where: { user_id: req.user.id }});
    if (!profile) return res.status(404).json({ message: 'No profile' });
    res.json({ profile });
  } catch (err) { console.error(err); res.status(500).json({ message: 'error' }); }
});

// Teacher gets profile by user_id
router.get('/:user_id', auth, requireRole('teacher'), async (req,res) => {
  try {
    const profile = await StudentProfile.findOne({ where: { user_id: req.params.user_id }});
    if (!profile) return res.status(404).json({ message: 'No profile' });
    res.json({ profile });
  } catch (err) { console.error(err); res.status(500).json({ message: 'error' }); }
});

module.exports = router;
