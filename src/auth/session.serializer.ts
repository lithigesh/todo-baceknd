import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: (err: unknown, id?: unknown) => void) {
    done(null, user?.id);
  }

  async deserializeUser(
    userId: unknown,
    done: (err: unknown, user?: unknown) => void,
  ) {
    try {
      const id =
        typeof userId === 'number'
          ? userId
          : typeof userId === 'string'
            ? Number.parseInt(userId, 10)
            : NaN;

      if (!Number.isFinite(id)) {
        done(null, null);
        return;
      }

      const user = await this.authService.findUserById(id);
      done(null, user ?? null);
    } catch (error) {
      done(error);
    }
  }
}
