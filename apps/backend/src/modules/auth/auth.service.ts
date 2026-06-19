import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../shared/middleware/error.middleware';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt';
import { sendMail, buildVerifyEmailHtml, buildResetPasswordHtml } from '../../shared/utils/email';
import type { RegisterInput, LoginInput } from './auth.validation';

export class AuthService {
  async register(input: RegisterInput) {
    const existingEmail    = await prisma.user.findUnique({ where: { email: input.email } });
    const existingUsername = await prisma.user.findUnique({ where: { username: input.username } });

    // If same email exists but is not yet verified, resend OTP instead of rejecting
    if (existingEmail && !existingEmail.isEmailVerified) {
      if (existingUsername && existingUsername.id !== existingEmail.id) {
        throw new AppError(409, 'Username taken');
      }
      await prisma.emailVerificationToken.deleteMany({ where: { userId: existingEmail.id } });
      const otp       = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.emailVerificationToken.create({ data: { userId: existingEmail.id, token: otp, expiresAt } });
      await sendMail({
        to:      existingEmail.email,
        subject: 'Your SquadSplit verification code',
        html:    buildVerifyEmailHtml(existingEmail.name, otp),
      });
      return { userId: existingEmail.id };
    }

    if (existingEmail) throw new AppError(409, 'Email already in use');
    if (existingUsername) throw new AppError(409, 'Username taken');

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email: input.email, username: input.username, name: input.name, passwordHash },
    });

    const otp       = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token: otp, expiresAt },
    });

    await sendMail({
      to:      user.email,
      subject: 'Your SquadSplit verification code',
      html:    buildVerifyEmailHtml(user.name, otp),
    });

    return { userId: user.id };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(400, 'Invalid or expired code');

    const record = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, token: otp },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new AppError(400, 'Invalid or expired code');
    }

    await prisma.user.update({
      where: { id: user.id },
      data:  { isEmailVerified: true },
    });
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // silent — don't reveal existence

    if (user.isEmailVerified) {
      throw new AppError(400, 'Email is already verified');
    }

    // Delete any existing tokens for this user
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

    const otp       = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token: otp, expiresAt },
    });

    await sendMail({
      to: user.email,
      subject: 'Your SquadSplit verification code',
      html: buildVerifyEmailHtml(user.name, otp),
    });
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AppError(401, 'Invalid credentials');

    if (!user.passwordHash) throw new AppError(401, 'This account uses Google login');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid credentials');

    if (!user.isEmailVerified) throw new AppError(403, 'Please verify your email before logging in');
    if (!user.isActive) throw new AppError(403, 'Account suspended');

    const accessToken  = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        userId:    user.id,
        token:     refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);
    if (!payload) throw new AppError(401, 'Invalid refresh token');

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, 'Refresh token expired or not found');
    }

    await prisma.refreshToken.delete({ where: { token } });

    const accessToken  = signAccessToken({ userId: payload.userId, email: payload.email });
    const refreshToken = signRefreshToken({ userId: payload.userId, email: payload.email });

    await prisma.refreshToken.create({
      data: {
        userId:    payload.userId,
        token:     refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // don't reveal existence

    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your SquadSplit password',
      html: buildResetPasswordHtml(user.name, resetLink),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.used || record.expiresAt < new Date()) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await prisma.passwordResetToken.update({ where: { token }, data: { used: true } });
  }

  async googleLogin(profile: { googleId: string; email: string; name: string; avatarUrl?: string }) {
    let user = await prisma.user.findUnique({ where: { googleId: profile.googleId } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.email } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data:  { googleId: profile.googleId, isEmailVerified: true },
        });
      } else {
        const base     = profile.email.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 20);
        const username = base + '_' + Math.random().toString(36).slice(2, 6);
        user = await prisma.user.create({
          data: {
            email:           profile.email,
            name:            profile.name,
            username,
            googleId:        profile.googleId,
            avatarUrl:       profile.avatarUrl,
            isEmailVerified: true,
          },
        });
      }
    }

    if (!user.isActive) throw new AppError(403, 'Account suspended');

    const accessToken  = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }
}

export const authService = new AuthService();
