import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { GoogleAuthGuard } from './google-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth2 Login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google login page' })
  async googleLogin() {
    // Starts the Google OAuth2 redirect flow.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth2 Callback URL' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to frontend after successful login',
  })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const redirectTo = process.env.AUTH_SUCCESS_REDIRECT ?? '/';

    // Ensure the session (and cookie) is saved before redirecting.
    if (req.session) {
      return req.session.save(() => res.redirect(redirectTo));
    }

    return res.redirect(redirectTo);
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  @ApiResponse({ status: 200, description: 'User profile object or null' })
  me(@Req() req: Request) {
    const user: any = (req as any).user;
    return user
      ? {
          id: user.id,
          email: user.email ?? null,
          name: user.name ?? null,
          role: user.role ?? null,
        }
      : null;
  }

  @Post('logout')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Log out from the application' })
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  async logout(@Req() req: Request, @Res() res: Response) {
    await new Promise<void>((resolve) => {
      const logoutFn = (req as any).logout;
      if (typeof logoutFn !== 'function') return resolve();

      logoutFn.call(req, () => resolve());
    });

    await new Promise<void>((resolve) => {
      if (!req.session) return resolve();
      req.session.destroy(() => resolve());
    });

    res.clearCookie('connect.sid');
    return res.status(204).send();
  }
}

