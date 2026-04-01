import { Injectable } from '@nestjs/common';
import type { Profile } from 'passport-google-oauth20';

import { PrismaService } from '../prisma/prisma.service';
import { Role } from './role.enum';

/** The single admin email — this account is always kept as ADMIN */
const ADMIN_EMAIL = 'lithigesh16@gmail.com';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertGoogleUser(profile: Profile, ip?: string) {
    console.log('[AuthService] Attempting to upsert user for Google ID:', profile.id);
    const googleId = profile.id;

    const primaryEmail = profile.emails?.[0]?.value ?? null;
    const displayName = profile.displayName ?? null;
    const role = primaryEmail === ADMIN_EMAIL ? Role.ADMIN : Role.USER;

    return this.prisma.user.upsert({
      where: { googleId },
      update: {
        email: primaryEmail,
        name: displayName,
        role,
        ...(ip ? { ipAddress: ip } : {}),
      },
      create: {
        googleId,
        email: primaryEmail,
        name: displayName,
        role,
        ...(ip ? { ipAddress: ip } : {}),
      },
    });
  }

  async findUserById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

