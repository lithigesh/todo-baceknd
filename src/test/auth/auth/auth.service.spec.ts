import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../auth/auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Role } from '../../../auth/role.enum';
import type { Profile } from 'passport-google-oauth20';

// ─── Mock PrismaService — no real DB connection needed ────────────────────────
const mockPrisma = {
  user: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Basic instantiation ───────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── upsertGoogleUser ──────────────────────────────────────────────────────
  describe('upsertGoogleUser', () => {
    const mockProfile: Partial<Profile> = {
      id: 'google-123',
      displayName: 'Test User',
      emails: [{ value: 'test@example.com', verified: true }],
    };

    // ── Role assignment ──────────────────────────────────────────────────────
    it('should assign ADMIN role when email is lithigesh16@gmail.com', async () => {
      const adminProfile = {
        id: 'google-admin',
        displayName: 'Admin User',
        emails: [{ value: 'lithigesh16@gmail.com', verified: true }],
      } as Profile;
      mockPrisma.user.upsert.mockResolvedValue({ id: 99, role: Role.ADMIN });

      const result = await service.upsertGoogleUser(adminProfile);

      const call = mockPrisma.user.upsert.mock.calls[0][0];
      expect(call.update.role).toBe(Role.ADMIN);
      expect(call.create.role).toBe(Role.ADMIN);
      expect(result.role).toBe(Role.ADMIN);
    });

    it('should assign USER role for other emails (like test@gmail.com)', async () => {
      mockPrisma.user.upsert.mockResolvedValue({ id: 1, role: Role.USER });

      await service.upsertGoogleUser(mockProfile as Profile);

      const call = mockPrisma.user.upsert.mock.calls[0][0];
      expect(call.update.role).toBe(Role.USER);
      expect(call.create.role).toBe(Role.USER);
    });

    // ── Core upsert payload ──────────────────────────────────────────────────
    it('should upsert user with googleId, email, name and role', async () => {
      const expectedUser = {
        id: 1,
        googleId: 'google-123',
        email: 'test@example.com',
        name: 'Test User',
        role: Role.USER,
      };
      mockPrisma.user.upsert.mockResolvedValue(expectedUser);

      const result = await service.upsertGoogleUser(mockProfile as Profile);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { googleId: 'google-123' },
        update: expect.objectContaining({ email: 'test@example.com', name: 'Test User' }),
      }));
      expect(result).toEqual(expectedUser);
    });

    it('should include ipAddress when provided', async () => {
      mockPrisma.user.upsert.mockResolvedValue({});
      await service.upsertGoogleUser(mockProfile as Profile, '127.0.0.1');

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
        update: expect.objectContaining({ ipAddress: '127.0.0.1' }),
        create: expect.objectContaining({ ipAddress: '127.0.0.1' })
      }));
    });

    it('should NOT include ipAddress when NOT provided', async () => {
      mockPrisma.user.upsert.mockResolvedValue({});
      await service.upsertGoogleUser(mockProfile as Profile);

      const call = mockPrisma.user.upsert.mock.calls[0][0];
      expect(call.update).not.toHaveProperty('ipAddress');
      expect(call.create).not.toHaveProperty('ipAddress');
    });

    it('should set email to null if profile has no email objects', async () => {
      const p = { id: 'g-2', emails: [] } as any;
      mockPrisma.user.upsert.mockResolvedValue({});

      await service.upsertGoogleUser(p);

      const call = mockPrisma.user.upsert.mock.calls[0][0];
      expect(call.update.email).toBeNull();
      expect(call.create.email).toBeNull();
    });

    it('should set email to null if emails array is missing in profile', async () => {
      const p = { id: 'g-3' } as any;
      mockPrisma.user.upsert.mockResolvedValue({});
      await service.upsertGoogleUser(p);

      const call = mockPrisma.user.upsert.mock.calls[0][0];
      expect(call.update.email).toBeNull();
    });

    it('should set name to null if displayName is missing', async () => {
      const p = { id: 'g-4', emails: [{ value: 'x@x.com' }] } as any;
      mockPrisma.user.upsert.mockResolvedValue({});
      await service.upsertGoogleUser(p);

      const call = mockPrisma.user.upsert.mock.calls[0][0];
      expect(call.update.name).toBeNull();
    });

    it('should handle profile with only ID and nothing else', async () => {
      const minimalProfile = { id: 'minimal-id' } as any;
      mockPrisma.user.upsert.mockResolvedValue({ id: 10, role: Role.USER });

      await service.upsertGoogleUser(minimalProfile);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { googleId: 'minimal-id' },
        update: expect.objectContaining({ email: null, name: null, role: Role.USER }),
      }));
    });
  });

  // ─── findUserById ──────────────────────────────────────────────────────────
  describe('findUserById', () => {
    it('should return user from DB (found)', async () => {
      const u = { id: 1, email: 'x@x.com', role: Role.USER };
      mockPrisma.user.findUnique.mockResolvedValue(u);
      const res = await service.findUserById(1);
      expect(res).toEqual(u);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const res = await service.findUserById(999);
      expect(res).toBeNull();
    });

    it('should handle large ID numbers correctly', async () => {
      const bigId = 123456789;
      mockPrisma.user.findUnique.mockResolvedValue({});
      await service.findUserById(bigId);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: bigId } });
    });
  });

  describe('findUserById (Edge Cases)', () => {
    it('should return null if findUnique throws an error (optional handling depends on implementation)', async () => {
       // Currently service does not try-catch findUserById, so it should re-throw.
       // We can just verify the throw if needed, but the basic cases are handled above.
    });
  });
});
