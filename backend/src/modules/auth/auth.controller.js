import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';
import redis from '../../lib/redis.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import { generateOtpCode } from '../../lib/otp.js';
import { sendOtpEmail } from '../../lib/mailer.js';

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

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await redis.set(`refresh:${user.id}`, refreshToken, {
      EX: 7 * 24 * 60 * 60,
    });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Register failed', error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
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
        email: user.email,
        name: user.name,
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpRequest.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    await sendOtpEmail({
      to: email,
      code,
      expiresAt,
    });

    return res.json({
      message: 'OTP sent successfully. Check your inbox.',
      expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to request reset', error: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code and new password are required' });
    }

    const otpRequest = await prisma.otpRequest.findFirst({
      where: {
        email,
        code,
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
      where: { email },
      data: { passwordHash },
    });

    await prisma.otpRequest.deleteMany({
      where: { email },
    });

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
}
