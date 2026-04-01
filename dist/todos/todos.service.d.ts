import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import type { Todo } from './todo.model';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class TodosService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    private readonly todoSelect;
    findAll(userId: number, isAdmin?: boolean): Promise<Todo[]>;
    findOne(id: string, userId: number, isAdmin?: boolean): Promise<Todo>;
    create(dto: CreateTodoDto, userId: number, image?: Express.Multer.File): Promise<Todo>;
    update(id: string, dto: UpdateTodoDto, userId: number, isAdmin?: boolean): Promise<Todo>;
    remove(id: string, userId: number, isAdmin?: boolean): Promise<void>;
}
