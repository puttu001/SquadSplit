import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../shared/utils/response';
import { env } from '../../config/env';
import { AppError } from '../../shared/middleware/error.middleware';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'Registration successful. Please verify your email.', 201);
    } catch (err) { next(err); }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) { next(err); }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);
      sendSuccess(res, tokens, 'Tokens refreshed');
    } catch (err) { next(err); }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      sendSuccess(res, null, 'Logged out');
    } catch (err) { next(err); }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      sendSuccess(res, null, 'If that email exists, a reset link has been sent');
    } catch (err) { next(err); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, null, 'Password reset successful');
    } catch (err) { next(err); }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.verifyEmail(req.body.email, req.body.otp);
      sendSuccess(res, null, 'Email verified successfully');
    } catch (err) { next(err); }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resendVerification(req.body.email);
      sendSuccess(res, null, 'If that email exists and is unverified, a new link has been sent');
    } catch (err) { next(err); }
  }
  async googleRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      if (!env.GOOGLE_CLIENT_ID) throw new AppError(500, 'Google login is not configured');

      const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id',     env.GOOGLE_CLIENT_ID);
      url.searchParams.set('redirect_uri',  redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope',         'openid email profile');
      url.searchParams.set('access_type',   'offline');
      url.searchParams.set('prompt',        'consent');
      res.redirect(url.toString());
    } catch (err) { next(err); }
  }

  async googleCallback(req: Request, res: Response, _next: NextFunction) {
    try {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw new AppError(500, 'Google login is not configured');
      }

      const { code } = req.query;
      if (!code || typeof code !== 'string') throw new AppError(400, 'Missing authorization code');

      const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          code,
          client_id:     env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri:  redirectUri,
          grant_type:    'authorization_code',
        }),
      });
      const tokenData = await tokenRes.json() as { id_token?: string };
      if (!tokenData.id_token) throw new AppError(400, 'Failed to authenticate with Google');

      const payload = JSON.parse(Buffer.from(tokenData.id_token.split('.')[1], 'base64url').toString());
      if (!payload.email_verified) throw new AppError(400, 'Google email is not verified');

      const result = await authService.googleLogin({
        googleId:  payload.sub,
        email:     payload.email,
        name:      payload.name,
        avatarUrl: payload.picture,
      });

      const params = new URLSearchParams({
        accessToken:  result.accessToken,
        refreshToken: result.refreshToken,
        user:         JSON.stringify(result.user),
      });
      res.redirect(`${env.CLIENT_URL}/auth/google/callback#${params.toString()}`);
    } catch {
      res.redirect(`${env.CLIENT_URL}/login?error=google_auth_failed`);
    }
  }
}

export const authController = new AuthController();
