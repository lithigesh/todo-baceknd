import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import type { Request } from 'express';

import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ??
      'https://todo-baceknd.onrender.com/auth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error(
        'Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET in environment',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: unknown, user?: unknown) => void,
  ) {
    try {
      // Respect X-Forwarded-For when behind a proxy/load balancer
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        undefined;

      const user = await this.authService.upsertGoogleUser(profile, ip);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
