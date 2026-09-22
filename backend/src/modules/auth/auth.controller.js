import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';
import redis from '../../lib/redis.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import { generateOtpCode } from '../../lib/otp.js';
import { enqueueWhatsAppMessage } from '../../queues/whatsapp.queue.js';
import { normalizeWhatsAppNumber, passwordResetOtpMessage, registrationOtpMessage } from '../../lib/whatsapp.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS);
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function requestRegistrationOtp(req, res) {
  try {
    const name = String(req.body.name || '').trim();
    const phone = normalizeWhatsAppNumber(req.body.phone);

    if (name.length < 3) {
      return res.status(400).json({ message: 'Full name must contain at least 3 characters' });
    }

    if (!/^\d{8,15}$/.test(phone)) {
      return res.status(400).json({ message: 'A valid WhatsApp phone number is required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await redis.set(`registration:${phone}`, JSON.stringify({ name, phone }), {
      EX: 10 * 60,
    });

    await prisma.otpRequest.deleteMany({ where: { phone, purpose: 'registration' } });
    await prisma.otpRequest.create({ data: { phone, code, purpose: 'registration', expiresAt } });
    await enqueueWhatsAppMessage({
      phone,
      type: 'registration-otp',
      text: registrationOtpMessage({ code, expiresAt }),
    });

    return res.json({ message: 'Verification code queued for WhatsApp delivery.', expiresAt });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send registration code', error: error.message });
  }
}

export async function verifyRegistrationOtp(req, res) {
  try {
    const phone = normalizeWhatsAppNumber(req.body.phone);
    const { code } = req.body;

    if (!/^\d{8,15}$/.test(phone) || !code || !/^\d{6}$/.test(String(code))) {
      return res.status(400).json({ message: 'Phone and a valid 6-digit code are required' });
    }

    const otpRequest = await prisma.otpRequest.findFirst({
      where: { phone, code: String(code), purpose: 'registration' },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRequest || otpRequest.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const pendingRegistration = await redis.get(`registration:${phone}`);
    if (!pendingRegistration) {
      return res.status(400).json({ message: 'Registration session expired. Please register again.' });
    }

    return res.json({ message: 'WhatsApp phone verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Registration verification failed', error: error.message });
  }
}

export async function completeRegistration(req, res) {
  try {
    const phone = normalizeWhatsAppNumber(req.body.phone);
    const { code, password } = req.body;

    if (!/^\d{8,15}$/.test(phone) || !code || !password || !/^\d{6}$/.test(String(code))) {
      return res.status(400).json({ message: 'Phone, password and a valid 6-digit code are required' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters' });
    }

    const otpRequest = await prisma.otpRequest.findFirst({
      where: { phone, code: String(code), purpose: 'registration' },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRequest || otpRequest.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const pendingRegistration = await redis.get(`registration:${phone}`);
    if (!pendingRegistration) {
      return res.status(400).json({ message: 'Registration session expired. Please register again.' });
    }

    const registration = JSON.parse(pendingRegistration);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { phone: registration.phone, name: registration.name, passwordHash },
    });

    await redis.del(`registration:${phone}`);
    await prisma.otpRequest.deleteMany({ where: { phone, purpose: 'registration' } });

    return res.status(201).json({
      message: 'Account created successfully. Please log in.',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}

export async function login(req, res) {
  try {
    const phone = normalizeWhatsAppNumber(req.body.phone);
    const { password } = req.body;

    if (!/^\d{8,15}$/.test(phone) || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await redis.set(`refresh:${user.id}`, refreshToken, {
      EX: 7 * 24 * 60 * 60,
    });

    setRefreshCookie(res, refreshToken);

    return res.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshTokenFromCookie = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshTokenFromCookie) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const payload = verifyRefreshToken(refreshTokenFromCookie);
    const storedToken = await redis.get(`refresh:${payload.id}`);

    if (!storedToken || storedToken !== refreshTokenFromCookie) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    await redis.set(`refresh:${user.id}`, newRefreshToken, {
      EX: 7 * 24 * 60 * 60,
    });

    setRefreshCookie(res, newRefreshToken);

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token invalid', error: error.message });
  }
}

export async function logout(req, res) {
  try {
    const { user } = req;
    await redis.del(`refresh:${user.id}`);
    clearRefreshCookie(res);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed', error: error.message });
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const phone = normalizeWhatsAppNumber(req.body.phone);

    if (!/^\d{8,15}$/.test(phone)) {
      return res.status(400).json({ message: 'WhatsApp phone is required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpRequest.create({
      data: {
        phone,
        code,
        purpose: 'password_reset',
        expiresAt,
      },
    });

    await enqueueWhatsAppMessage({
      phone,
      type: 'password-reset-otp',
      text: passwordResetOtpMessage({
      code,
      expiresAt,
      }),
    });

    return res.json({
      message: 'OTP sent successfully on WhatsApp.',
      expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to request reset', error: error.message });
  }
}

export async function verifyPasswordResetOtp(req, res) {
  try {
    const phone = normalizeWhatsAppNumber(req.body.phone);
    const { code } = req.body;

    if (!/^\d{8,15}$/.test(phone) || !code || !/^\d{6}$/.test(String(code))) {
      return res.status(400).json({ message: 'Phone and a valid 6-digit code are required' });
    }

    const otpRequest = await prisma.otpRequest.findFirst({
      where: { phone, code: String(code), purpose: 'password_reset' },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRequest || otpRequest.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const phone = normalizeWhatsAppNumber(req.body.phone);
    const { code, newPassword } = req.body;

    if (!/^\d{8,15}$/.test(phone) || !code || !newPassword) {
      return res.status(400).json({ message: 'Phone, code and new password are required' });
    }

    const otpRequest = await prisma.otpRequest.findFirst({
      where: {
        phone,
        code,
        purpose: 'password_reset',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRequest) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (new Date(otpRequest.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { phone },
      data: { passwordHash },
    });

    await prisma.otpRequest.deleteMany({
      where: { phone },
    });

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
}
