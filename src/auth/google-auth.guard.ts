import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    // Prefer explicit env config, but fall back to the current request host/port.
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ??
      `${req.protocol}://${req.get('host')}/auth/google/callback`;

    return {
      callbackURL,
      scope: ['profile', 'email'],
      session: true,
    };
  }
}
