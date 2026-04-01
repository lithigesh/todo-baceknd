import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import type { Todo } from './todo.model';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TodosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private readonly todoSelect = {
    id: true,
    title: true,
    completed: true,
    imageUrl: true,
  } as const;

  async findAll(userId: number, isAdmin = false): Promise<Todo[]> {
    const where = isAdmin ? {} : { userId };
    return this.prisma.todo.findMany({
      where,
      orderBy: { id: 'asc' },
      select: this.todoSelect,
    });
  }

  async findOne(id: string, userId: number, isAdmin = false): Promise<Todo> {
    const where = isAdmin ? { id } : { id, userId };
    const todo = await this.prisma.todo.findFirst({
      where,
      select: this.todoSelect,
    });

    if (!todo) {
      throw new NotFoundException(`Todo ${id} not found`);
    }

    return todo;
  }

  async create(
    dto: CreateTodoDto,
    userId: number,
    image?: Express.Multer.File,
  ): Promise<Todo> {
    const title = dto?.title?.trim();
    if (!title) {
      throw new BadRequestException('title is required');
    }

    let imageUrl: string | undefined;
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

  async update(
    id: string,
    dto: UpdateTodoDto,
    userId: number,
    isAdmin = false,
  ): Promise<Todo> {
    await this.findOne(id, userId, isAdmin);

    const data: Prisma.TodoUpdateInput = {};

    if (dto.title !== undefined) {
      const title = dto.title.trim();
      if (!title) {
        throw new BadRequestException('title cannot be empty');
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Todo ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string, userId: number, isAdmin = false): Promise<void> {
    // Admins can delete any todo; regular users only their own
    // In this system, only admins call remove anyway due to controller guards
    if (isAdmin) {
      const todo = await this.prisma.todo.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!todo) {
        throw new NotFoundException(`Todo ${id} not found`);
      }
    } else {
      await this.findOne(id, userId, false); // ownership check
    }

    try {
      await this.prisma.todo.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Todo ${id} not found`);
      }
      throw error;
    }
  }
}


