import type { Profile } from 'passport-google-oauth20';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertGoogleUser(profile: Profile, ip?: string): Promise<{
        email: string | null;
        id: number;
        googleId: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        ipAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findUserById(id: number): Promise<{
        email: string | null;
        id: number;
        googleId: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        ipAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
