"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const google_auth_guard_1 = require("./google-auth.guard");
let AuthController = class AuthController {
    async googleLogin() {
    }
    async googleCallback(req, res) {
        const redirectTo = process.env.AUTH_SUCCESS_REDIRECT ?? '/';
        if (req.session) {
            return req.session.save(() => res.redirect(redirectTo));
        }
        return res.redirect(redirectTo);
    }
    me(req) {
        const user = req.user;
        return user
            ? {
                id: user.id,
                email: user.email ?? null,
                name: user.name ?? null,
                role: user.role ?? null,
            }
            : null;
    }
    async logout(req, res) {
        await new Promise((resolve) => {
            const logoutFn = req.logout;
            if (typeof logoutFn !== 'function')
                return resolve();
            logoutFn.call(req, () => resolve());
        });
        await new Promise((resolve) => {
            if (!req.session)
                return resolve();
            req.session.destroy(() => resolve());
        });
        res.clearCookie('connect.sid');
        return res.status(204).send();
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Google OAuth2 Login' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirect to Google login page' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Google OAuth2 Callback URL' }),
    (0, swagger_1.ApiResponse)({
        status: 302,
        description: 'Redirect to frontend after successful login',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current logged-in user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile object or null' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Log out from the application' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Successfully logged out' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth')
], AuthController);
//# sourceMappingURL=auth.controller.js.map