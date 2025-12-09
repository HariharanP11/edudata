// src/controllers/auth.sequelize.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import twilio from 'twilio';

import { User, OtpSession } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// OTP config
const ENABLE_OTP = (process.env.ENABLE_OTP ?? 'true') !== 'false';
const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const OTP_RATE_LIMIT_COUNT = Number(process.env.OTP_RATE_LIMIT_COUNT || 3);
const OTP_RATE_LIMIT_WINDOW_MINUTES = Number(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES || 10);

// Twilio config (optional)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';

let twilioClient: any = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.warn('Twilio init failed:', err);
    twilioClient = null;
  }
}

async function sendOtpToContact(contact: string, code: string) {
  // 1) Try SMS via Twilio when contact looks like a phone number
  if (twilioClient && contact && contact.startsWith('+')) {
    try {
      await twilioClient.messages.create({
        body: `Your EduData OTP is: ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        from: TWILIO_FROM_NUMBER,
        to: contact,
      });
      return { via: 'sms' };
    } catch (err) {
      console.warn('Twilio send failed:', err);
    }
  }

  // 2) Fallback: just log to console (for dev/demo)
  console.log(`[OTP] contact=${contact} code=${code}`);
  return { via: 'console' };
}

function signJwt(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

// ---------- signup ----------
export async function signup(req: Request, res: Response) {
  try {
    const { email, password, display_name, role } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const existing = await (User as any).findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await (User as any).create({
      email,
      password_hash: hash,
      display_name,
      role: role || 'student',
    });

    if (!ENABLE_OTP) {
      const token = signJwt(user);
      return res.json({ user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name }, token });
    }

    // With OTP enabled, require login to start a session instead of issuing token here
    return res.json({ ok: true, message: 'User created. Please login to receive OTP.' });
  } catch (err) {
    console.error('signup error:', err);
    return res.status(500).json({ error: String(err) });
  }
}

// ---------- login (password check -> maybe OTP session) ----------
export async function login(req: Request, res: Response) {
  try {
    const { email, id, loginId, password } = req.body || {};
    if (!password) return res.status(400).json({ message: 'Missing password' });

    const where: any = {};
    if (email) where.email = email;
    else if (loginId || id) where.login_id = loginId || id;
    else return res.status(400).json({ message: 'Provide email or loginId' });

    const user = await (User as any).findOne({ where });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    if (!ENABLE_OTP) {
      const token = signJwt(user);
      return res.json({
        user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name },
        token,
      });
    }

    const contact = user.phone || user.email; // assume columns exist / will be added
    const windowAgo = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60_000);

    const recentCount = await (OtpSession as any).count({
      where: {
        contact,
        created_at: { $gte: windowAgo },
      },
    });
    if (recentCount >= OTP_RATE_LIMIT_COUNT) {
      return res.status(429).json({
        message: `Too many OTP attempts. Try again after ${OTP_RATE_LIMIT_WINDOW_MINUTES} minutes.`,
      });
    }

    const code = String(Math.floor(Math.random() * 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
    const sessionToken = crypto.randomBytes(16).toString('hex');
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

    await (OtpSession as any).create({
      token: sessionToken,
      user_id: user.id,
      contact,
      code_hash: hashedCode,
      expires_at: expiresAt,
      used: false,
    });

    await sendOtpToContact(contact, code);

    return res.json({
      otpRequired: true,
      sessionToken,
      message: 'OTP sent to registered contact.',
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: String(err) });
  }
}

// ---------- verifyOtp ----------
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { sessionToken, code } = req.body || {};
    if (!sessionToken || !code) return res.status(400).json({ message: 'sessionToken and code required' });

    const session = await (OtpSession as any).findOne({ where: { token: sessionToken } });
    if (!session) return res.status(400).json({ message: 'Invalid or expired OTP session' });
    if (session.used) return res.status(400).json({ message: 'OTP already used' });
    if (session.expires_at < new Date()) return res.status(400).json({ message: 'OTP expired' });

    const ok = await bcrypt.compare(String(code), session.code_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid OTP code' });

    session.used = true;
    await session.save();

    const user = await (User as any).findByPk(session.user_id);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const token = signJwt(user);
    return res.json({
      user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name },
      token,
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ error: String(err) });
  }
}

// ---------- resendOtp ----------
export async function resendOtp(req: Request, res: Response) {
  try {
    const { sessionToken } = req.body || {};
    if (!sessionToken) return res.status(400).json({ message: 'sessionToken required' });

    const old = await (OtpSession as any).findOne({ where: { token: sessionToken } });
    if (!old) return res.status(400).json({ message: 'Invalid sessionToken' });
    if (old.used) return res.status(400).json({ message: 'OTP already used' });

    const windowAgo = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW_MINUTES * 60_000);
    const recentCount = await (OtpSession as any).count({
      where: {
        contact: old.contact,
        created_at: { $gte: windowAgo },
      },
    });
    if (recentCount >= OTP_RATE_LIMIT_COUNT) {
      return res.status(429).json({
        message: `Too many OTP attempts. Try again after ${OTP_RATE_LIMIT_WINDOW_MINUTES} minutes.`,
      });
    }

    const code = String(Math.floor(Math.random() * 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
    const newToken = crypto.randomBytes(16).toString('hex');
    const hashed = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

    await (OtpSession as any).create({
      token: newToken,
      user_id: old.user_id,
      contact: old.contact,
      code_hash: hashed,
      expires_at: expiresAt,
      used: false,
    });

    await sendOtpToContact(old.contact, code);

    return res.json({ sessionToken: newToken, message: 'OTP resent' });
  } catch (err) {
    console.error('resendOtp error:', err);
    return res.status(500).json({ error: String(err) });
  }
}

// For now, resendOtpEmail can delegate to resendOtp or be specialized later.
export async function resendOtpEmail(req: Request, res: Response) {
  return resendOtp(req, res);
}

// ---------- me ----------
export async function me(req: any, res: Response) {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });

    const user = await (User as any).findByPk(id, {
      attributes: ['id', 'email', 'display_name', 'role'],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(user);
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
