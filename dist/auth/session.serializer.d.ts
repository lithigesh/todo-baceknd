import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';
export declare class SessionSerializer extends PassportSerializer {
    private readonly authService;
    constructor(authService: AuthService);
    serializeUser(user: any, done: (err: unknown, id?: unknown) => void): void;
    deserializeUser(userId: unknown, done: (err: unknown, user?: unknown) => void): Promise<void>;
}
