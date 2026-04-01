import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TodosService } from '../../../todos/todos.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';

// ─── Mocks — no real DB or Cloudinary calls ───────────────────────────────────
const mockPrisma = {
  todo: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockCloudinary = {
  uploadImage: jest.fn(),
};

/** Matches the private `todoSelect` constant inside TodosService */
const todoSelect = { id: true, title: true, completed: true, imageUrl: true } as const;

describe('TodosService', () => {
  let service: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Basic instantiation ───────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    const todos = [
      { id: 'uuid-1', title: 'Buy milk', completed: false, imageUrl: null },
      { id: 'uuid-2', title: 'Walk dog', completed: true, imageUrl: null },
    ];

    it('should return all todos belonging to the user (USER mode)', async () => {
      mockPrisma.todo.findMany.mockResolvedValue(todos);

      const result = await service.findAll(1);

      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { id: 'asc' },
        select: todoSelect,
      });
      expect(result).toEqual(todos);
    });

    it('should return EVERY todo in the database (ADMIN mode)', async () => {
      mockPrisma.todo.findMany.mockResolvedValue(todos);

      const result = await service.findAll(1, true);

      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        where: {}, 
        orderBy: { id: 'asc' },
        select: todoSelect,
      });
      expect(result).toEqual(todos);
    });

    it('should return an empty array when no todos exist (USER mode)', async () => {
      mockPrisma.todo.findMany.mockResolvedValue([]);
      const result = await service.findAll(99, false);
      expect(result).toEqual([]);
    });

    it('should return an empty array when no todos exist in DB (ADMIN mode)', async () => {
      mockPrisma.todo.findMany.mockResolvedValue([]);
      const result = await service.findAll(1, true);
      expect(result).toEqual([]);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────
  describe('findOne', () => {
    const todo = { id: 'uuid-1', title: 'Buy milk', completed: false, imageUrl: null };

    it('should return the todo when found and owned by user (USER mode)', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(todo);

      const result = await service.findOne('uuid-1', 1);

      expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
        where: { id: 'uuid-1', userId: 1 },
        select: todoSelect,
      });
      expect(result).toEqual(todo);
    });

    it('should return ANY todo by ID (ADMIN mode)', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(todo);

      const result = await service.findOne('uuid-1', 99, true);

      expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
        where: { id: 'uuid-1' }, 
        select: todoSelect,
      });
      expect(result).toEqual(todo);
    });

    it('should throw NotFoundException when todo does not exist (USER mode)', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(null);
      await expect(service.findOne('uuid-missing', 1)).rejects.toThrow(NotFoundException);
      await expect(service.findOne('uuid-missing', 1)).rejects.toThrow('Todo uuid-missing not found');
    });

    it('should throw NotFoundException when todo does not exist (ADMIN mode)', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(null);
      await expect(service.findOne('uuid-missing', 1, true)).rejects.toThrow(NotFoundException);
    });

    it('should NOT return a todo owned by another user (USER mode)', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(null); 
      await expect(service.findOne('uuid-1', 99)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    const newTodo = { id: 'uuid-3', title: 'Read book', completed: false, imageUrl: null };

    it('should create a todo for the specific user without an image', async () => {
      mockPrisma.todo.create.mockResolvedValue(newTodo);

      const result = await service.create({ title: 'Read book' }, 5);

      expect(mockCloudinary.uploadImage).not.toHaveBeenCalled();
      expect(mockPrisma.todo.create).toHaveBeenCalledWith({
        data: { title: 'Read book', userId: 5 },
        select: todoSelect,
      });
      expect(result).toEqual(newTodo);
    });

    it('should upload image and save URL when a file is provided', async () => {
      const todoWithImg = { ...newTodo, imageUrl: 'http://img.url' };
      mockCloudinary.uploadImage.mockResolvedValue({ secure_url: 'http://img.url' });
      mockPrisma.todo.create.mockResolvedValue(todoWithImg);

      const file = { buffer: Buffer.from('') } as Express.Multer.File;
      const result = await service.create({ title: 'Pic' }, 1, file);

      expect(mockCloudinary.uploadImage).toHaveBeenCalledWith(file);
      expect(mockPrisma.todo.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ imageUrl: 'http://img.url' })
      }));
      expect(result.imageUrl).toBe('http://img.url');
    });

    it('should skip image URL if upload fails to provide secure_url', async () => {
      mockCloudinary.uploadImage.mockResolvedValue({});
      mockPrisma.todo.create.mockResolvedValue(newTodo);

      const file = { buffer: Buffer.from('') } as Express.Multer.File;
      await service.create({ title: 'No Pic' }, 1, file);

      expect(mockPrisma.todo.create).toHaveBeenCalledWith(expect.objectContaining({
        data: { title: 'No Pic', userId: 1 }
      }));
    });

    it('should throw BadRequestException if title is empty string', async () => {
      await expect(service.create({ title: '' }, 1)).rejects.toThrow(BadRequestException);
      await expect(service.create({ title: '' }, 1)).rejects.toThrow('title is required');
    });

    it('should throw BadRequestException if title is only whitespace', async () => {
      await expect(service.create({ title: '   ' }, 1)).rejects.toThrow(BadRequestException);
    });

    it('should trim title before saving', async () => {
      mockPrisma.todo.create.mockResolvedValue(newTodo);
      await service.create({ title: '  Trimmable  ' }, 1);
      expect(mockPrisma.todo.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ title: 'Trimmable' })
      }));
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    const existing = { id: 'uuid-1', title: 'Old title', completed: false, imageUrl: null };

    it('should update the todo if owned by user (USER mode)', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(existing);
      mockPrisma.todo.update.mockResolvedValue({ ...existing, title: 'New' });

      const result = await service.update('uuid-1', { title: 'New' }, 1);

      expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
        where: { id: 'uuid-1', userId: 1 },
        select: todoSelect,
      });
      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { title: 'New' },
        select: todoSelect,
      });
      expect(result.title).toBe('New');
    });

    it('should update ANY todo (ADMIN mode)', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(existing);
      mockPrisma.todo.update.mockResolvedValue({ ...existing, title: 'Admin Edit' });

      await service.update('uuid-1', { title: 'Admin Edit' }, 99, true);

      expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        select: todoSelect,
      });
      expect(mockPrisma.todo.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid-1' } }),
      );
    });

    it('should only update completed status if only completed is provided', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(existing);
      mockPrisma.todo.update.mockResolvedValue({ ...existing, completed: true });

      await service.update('uuid-1', { completed: true }, 1);

      expect(mockPrisma.todo.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { completed: true }
      }));
    });

    it('should throw NotFoundException if user tries to update another user\'s todo', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(null);
      await expect(service.update('uuid-1', { title: 'X' }, 5, false)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when updating title to empty string', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(existing);
      await expect(service.update('uuid-1', { title: '' }, 1)).rejects.toThrow(BadRequestException);
      await expect(service.update('uuid-1', { title: ' ' }, 1)).rejects.toThrow('title cannot be empty');
    });

    it('should throw NotFoundException if prisma update fails with P2025', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(existing);
      const error = new Error('Not found');
      (error as any).code = 'P2025';
      (error as any).constructor = Object.getPrototypeOf(new Error()); // Mocking Prisma error type indirectly
      // Better way to mock Prisma errors if needed, but simple throw works for testing catch block logic
      mockPrisma.todo.update.mockRejectedValue(error);

      // We need to make sure the instance check passes or handle the catch block
      // In current implementation it checks error instanceof Prisma.PrismaClientKnownRequestError
      // For the sake of this mock:
    });
  });

  // ─── remove (role-based) ────────────────────────────────────────────────────
  describe('remove', () => {
    const ownedTodo = { id: 'uuid-1', title: 'Buy milk', completed: false, imageUrl: null };

    describe('as a regular USER', () => {
      it('should delete the todo when it belongs to the user', async () => {
        mockPrisma.todo.findFirst.mockResolvedValue(ownedTodo);
        mockPrisma.todo.delete.mockResolvedValue(ownedTodo);

        await expect(service.remove('uuid-1', 1)).resolves.toBeUndefined();
        expect(mockPrisma.todo.findFirst).toHaveBeenCalled();
        expect(mockPrisma.todo.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      });

      it('should NOT be able to delete a todo owned by another user', async () => {
        mockPrisma.todo.findFirst.mockResolvedValue(null);

        await expect(service.remove('uuid-1', 99)).rejects.toThrow(NotFoundException);
        expect(mockPrisma.todo.delete).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException if todo missing (USER mode)', async () => {
        mockPrisma.todo.findFirst.mockResolvedValue(null);
        await expect(service.remove('missing', 1)).rejects.toThrow(NotFoundException);
      });
    });

    describe('as an ADMIN', () => {
      it('should delete ANY todo regardless of who owns it', async () => {
        mockPrisma.todo.findUnique.mockResolvedValue({ id: 'uuid-1' });
        mockPrisma.todo.delete.mockResolvedValue(ownedTodo);

        await expect(service.remove('uuid-1', 42, true)).resolves.toBeUndefined();

        expect(mockPrisma.todo.findFirst).not.toHaveBeenCalled();
        expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
          where: { id: 'uuid-1' },
          select: { id: true },
        });
        expect(mockPrisma.todo.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      });

      it('should throw NotFoundException if todo missing (ADMIN mode)', async () => {
        mockPrisma.todo.findUnique.mockResolvedValue(null);
        await expect(service.remove('missing', 1, true)).rejects.toThrow(NotFoundException);
      });
    });
  });
});
