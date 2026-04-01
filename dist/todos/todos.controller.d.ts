import type { Request } from 'express';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import type { Todo } from './todo.model';
import { TodosService } from './todos.service';
export declare class TodosController {
    private readonly todosService;
    constructor(todosService: TodosService);
    findAll(req: Request): Promise<Todo[]>;
    findOne(id: string, req: Request): Promise<Todo>;
    create(dto: CreateTodoDto, req: Request, image?: Express.Multer.File): Promise<Todo>;
    update(id: string, dto: UpdateTodoDto, req: Request): Promise<Todo>;
    remove(id: string, req: Request): Promise<void>;
}
