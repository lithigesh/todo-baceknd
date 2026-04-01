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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let TodosService = class TodosService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    todoSelect = {
        id: true,
        title: true,
        completed: true,
        imageUrl: true,
    };
    async findAll(userId, isAdmin = false) {
        const where = isAdmin ? {} : { userId };
        return this.prisma.todo.findMany({
            where,
            orderBy: { id: 'asc' },
            select: this.todoSelect,
        });
    }
    async findOne(id, userId, isAdmin = false) {
        const where = isAdmin ? { id } : { id, userId };
        const todo = await this.prisma.todo.findFirst({
            where,
            select: this.todoSelect,
        });
        if (!todo) {
            throw new common_1.NotFoundException(`Todo ${id} not found`);
        }
        return todo;
    }
    async create(dto, userId, image) {
        const title = dto?.title?.trim();
        if (!title) {
            throw new common_1.BadRequestException('title is required');
        }
        let imageUrl;
        if (image) {
            const result = await this.cloudinaryService.uploadImage(image);
            if ('secure_url' in result) {
                imageUrl = result.secure_url;
            }
        }
        return this.prisma.todo.create({
            data: {
                title,
                userId,
                ...(imageUrl ? { imageUrl } : {}),
            },
            select: this.todoSelect,
        });
    }
    async update(id, dto, userId, isAdmin = false) {
        await this.findOne(id, userId, isAdmin);
        const data = {};
        if (dto.title !== undefined) {
            const title = dto.title.trim();
            if (!title) {
                throw new common_1.BadRequestException('title cannot be empty');
            }
            data.title = title;
        }
        if (dto.completed !== undefined) {
            data.completed = Boolean(dto.completed);
        }
        try {
            return await this.prisma.todo.update({
                where: { id },
                data,
                select: this.todoSelect,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Todo ${id} not found`);
            }
            throw error;
        }
    }
    async remove(id, userId, isAdmin = false) {
        if (isAdmin) {
            const todo = await this.prisma.todo.findUnique({
                where: { id },
                select: { id: true },
            });
            if (!todo) {
                throw new common_1.NotFoundException(`Todo ${id} not found`);
            }
        }
        else {
            await this.findOne(id, userId, false);
        }
        try {
            await this.prisma.todo.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Todo ${id} not found`);
            }
            throw error;
        }
    }
};
exports.TodosService = TodosService;
exports.TodosService = TodosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], TodosService);
//# sourceMappingURL=todos.service.js.map