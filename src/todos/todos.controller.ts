import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import type { Todo } from './todo.model';
import { TodosService } from './todos.service';

@ApiTags('todos')
@ApiCookieAuth()
@Controller('todos')
@UseGuards(AuthenticatedGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all To-Dos for the current user' })
  @ApiResponse({ status: 200, description: 'List of To-Dos' })
  findAll(@Req() req: Request): Promise<Todo[]> {
    const user = (req as any).user;
    return this.todosService.findAll(user.id, user.role === Role.ADMIN);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific To-Do by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the To-Do' })
  @ApiResponse({ status: 200, description: 'The To-Do object' })
  @ApiResponse({ status: 404, description: 'To-Do not found' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Req() req: Request,
  ): Promise<Todo> {
    const user = (req as any).user;
    return this.todosService.findOne(id, user.id, user.role === Role.ADMIN);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new To-Do with an optional image' })
  @ApiResponse({ status: 201, description: 'To-Do created successfully' })
  create(
    @Body() dto: CreateTodoDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<Todo> {
    const userId = (req as any).user?.id;
    return this.todosService.create(dto, userId, image);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing To-Do' })
  @ApiParam({ name: 'id', description: 'UUID of the To-Do' })
  @ApiResponse({ status: 200, description: 'To-Do updated successfully' })
  @ApiResponse({ status: 404, description: 'To-Do not found' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() dto: UpdateTodoDto,
    @Req() req: Request,
  ): Promise<Todo> {
    const user = (req as any).user;
    return this.todosService.update(id, dto, user.id, user.role === Role.ADMIN);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a To-Do (ADMIN ONLY)' })
  @ApiParam({ name: 'id', description: 'UUID of the To-Do' })
  @ApiResponse({ status: 204, description: 'To-Do deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only ADMINs can delete' })
  @ApiResponse({ status: 404, description: 'To-Do not found' })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = (req as any).user;
    const userId: number = user?.id;
    const isAdmin: boolean = user?.role === Role.ADMIN;
    return this.todosService.remove(id, userId, isAdmin);
  }
}



