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
exports.TodosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const authenticated_guard_1 = require("../auth/authenticated.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const role_enum_1 = require("../auth/role.enum");
const create_todo_dto_1 = require("./dto/create-todo.dto");
const update_todo_dto_1 = require("./dto/update-todo.dto");
const todos_service_1 = require("./todos.service");
let TodosController = class TodosController {
    todosService;
    constructor(todosService) {
        this.todosService = todosService;
    }
    findAll(req) {
        const user = req.user;
        return this.todosService.findAll(user.id, user.role === role_enum_1.Role.ADMIN);
    }
    findOne(id, req) {
        const user = req.user;
        return this.todosService.findOne(id, user.id, user.role === role_enum_1.Role.ADMIN);
    }
    create(dto, req, image) {
        const userId = req.user?.id;
        return this.todosService.create(dto, userId, image);
    }
    update(id, dto, req) {
        const user = req.user;
        return this.todosService.update(id, dto, user.id, user.role === role_enum_1.Role.ADMIN);
    }
    remove(id, req) {
        const user = req.user;
        const userId = user?.id;
        const isAdmin = user?.role === role_enum_1.Role.ADMIN;
        return this.todosService.remove(id, userId, isAdmin);
    }
};
exports.TodosController = TodosController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve all To-Dos for the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of To-Dos' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific To-Do by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID of the To-Do' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The To-Do object' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'To-Do not found' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '7' }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new To-Do with an optional image' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'To-Do created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_todo_dto_1.CreateTodoDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing To-Do' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID of the To-Do' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'To-Do updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'To-Do not found' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '7' }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_todo_dto_1.UpdateTodoDto, Object]),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a To-Do (ADMIN ONLY)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'UUID of the To-Do' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'To-Do deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden: Only ADMINs can delete' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'To-Do not found' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '7' }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "remove", null);
exports.TodosController = TodosController = __decorate([
    (0, swagger_1.ApiTags)('todos'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Controller)('todos'),
    (0, common_1.UseGuards)(authenticated_guard_1.AuthenticatedGuard),
    __metadata("design:paramtypes", [todos_service_1.TodosService])
], TodosController);
//# sourceMappingURL=todos.controller.js.map