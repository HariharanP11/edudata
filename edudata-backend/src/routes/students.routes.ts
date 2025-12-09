// edudata-backend/src/routes/students.routes.ts
import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { StudentProfile, User } from '../models';
import { Op } from 'sequelize';

const router = Router();

router.get('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { q, year } = req.query as any;
    const where: any = {};
    if (year) where.year = year;
    if (q) where[Op.or] = [{ name: { [Op.like]: `%${q}%` } }, { institution: { [Op.like]: `%${q}%` } }];

    const students = await StudentProfile.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'display_name', 'role'] }],
      order: [['updated_at', 'DESC']],
    });
    return res.json({ students });
  } catch (err) {
    console.error('GET /api/students error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const payload = req.body;
    const { user_id } = payload;
    if (!user_id) return res.status(400).json({ message: 'user_id required' });

    let profile = await StudentProfile.findOne({ where: { user_id } });
    if (profile) { await profile.update(payload); profile = await StudentProfile.findOne({ where: { user_id } }); }
    else { profile = await StudentProfile.create(payload); }

    return res.json({ ok: true, profile });
  } catch (err) {
    console.error('POST /api/students error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const profile = await StudentProfile.findOne({ where: { user_id: userId }, include: [{ model: User, as: 'user', attributes: ['id', 'email', 'display_name'] }] });
    if (!profile) return res.status(404).json({ message: 'No profile found' });
    return res.json({ profile });
  } catch (err) {
    console.error('GET /api/students/me error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:user_id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ where: { user_id: req.params.user_id }, include: [{ model: User, as: 'user', attributes: ['id', 'email', 'display_name'] }] });
    if (!profile) return res.status(404).json({ message: 'No profile found' });
    return res.json({ profile });
  } catch (err) {
    console.error('GET /api/students/:user_id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:user_id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const updated = await StudentProfile.update(req.body, { where: { user_id: req.params.user_id } });
    if (!updated || (Array.isArray(updated) && updated[0] === 0)) return res.status(404).json({ message: 'Profile not found' });
    const profile = await StudentProfile.findOne({ where: { user_id: req.params.user_id } });
    return res.json({ ok: true, profile });
  } catch (err) {
    console.error('PUT /api/students/:user_id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:user_id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const deleted = await StudentProfile.destroy({ where: { user_id: req.params.user_id } });
    if (!deleted) return res.status(404).json({ message: 'Profile not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/students/:user_id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
