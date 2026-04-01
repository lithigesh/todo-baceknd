import { Profile, Strategy } from 'passport-google-oauth20';
import type { Request } from 'express';
import { AuthService } from './auth.service';
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly authService;
    constructor(authService: AuthService);
    validate(req: Request, accessToken: string, refreshToken: string, profile: Profile, done: (err: unknown, user?: unknown) => void): Promise<void>;
}
export {};
