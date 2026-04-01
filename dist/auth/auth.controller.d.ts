import type { Request, Response } from 'express';
export declare class AuthController {
    googleLogin(): Promise<void>;
    googleCallback(req: Request, res: Response): Promise<void | (import("express-session").Session & Partial<import("express-session").SessionData>)>;
    me(req: Request): {
        id: any;
        email: any;
        name: any;
        role: any;
    } | null;
    logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
