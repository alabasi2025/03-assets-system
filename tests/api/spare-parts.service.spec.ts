import { Test, TestingModule } from '@nestjs/testing';
import { SparePartsService } from './spare-parts.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('SparePartsService', () => {
  let service: SparePartsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    spare_parts: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
      fields: { reorder_point: 'reorder_point' },
    },
    spare_part_categories: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    spare_part_movements: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockCategory = {
    id: 'cat-001',
    business_id: 'business-001',
    code: 'ELC',
    name: 'قطع كهربائية',
    is_active: true,
  };

  const mockSparePart = {
    id: 'part-001',
    business_id: 'business-001',
    category_id: 'cat-001',
    part_code: 'SP-001',
    name: 'فلتر زيت',
    name_en: 'Oil Filter',
    unit: 'piece',
    current_stock: 50,
    min_stock: 10,
    reorder_point: 15,
    unit_cost: 100,
    is_critical: true,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    category: mockCategory,
    movements: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SparePartsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SparePartsService>(SparePartsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    const createDto = {
      businessId: 'business-001',
      code: 'MEC',
      name: 'قطع ميكانيكية',
      nameEn: 'Mechanical Parts',
    };

    it('should create a new category', async () => {
      mockPrismaService.spare_part_categories.findFirst.mockResolvedValue(null);
      mockPrismaService.spare_part_categories.create.mockResolvedValue({
        ...mockCategory,
        ...createDto,
      });

      const result = await service.createCategory(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.spare_part_categories.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when category code exists', async () => {
      mockPrismaService.spare_part_categories.findFirst.mockResolvedValue(mockCategory);

      await expect(service.createCategory(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllCategories', () => {
    it('should return all active categories', async () => {
      mockPrismaService.spare_part_categories.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAllCategories('business-001');

      expect(result).toEqual([mockCategory]);
    });
  });

  describe('create', () => {
    const createDto = {
      businessId: 'business-001',
      categoryId: 'cat-001',
      partCode: 'SP-002',
      name: 'فلتر هواء',
      nameEn: 'Air Filter',
      unit: 'piece',
      minStock: 5,
      reorderPoint: 10,
      unitCost: 80,
      isCritical: false,
    };

    it('should create a new spare part', async () => {
      mockPrismaService.spare_parts.findFirst.mockResolvedValue(null);
      mockPrismaService.spare_parts.create.mockResolvedValue({
        ...mockSparePart,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.spare_parts.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when part code exists', async () => {
      mockPrismaService.spare_parts.findFirst.mockResolvedValue(mockSparePart);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated spare parts', async () => {
      mockPrismaService.spare_parts.findMany.mockResolvedValue([mockSparePart]);
      mockPrismaService.spare_parts.count.mockResolvedValue(1);

      const result = await service.findAll('business-001');

      expect(result.data).toEqual([mockSparePart]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrismaService.spare_parts.findMany.mockResolvedValue([mockSparePart]);
      mockPrismaService.spare_parts.count.mockResolvedValue(1);

      await service.findAll('business-001', { categoryId: 'cat-001' });

      expect(mockPrismaService.spare_parts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category_id: 'cat-001',
          }),
        }),
      );
    });

    it('should filter by critical parts', async () => {
      mockPrismaService.spare_parts.findMany.mockResolvedValue([mockSparePart]);
      mockPrismaService.spare_parts.count.mockResolvedValue(1);

      await service.findAll('business-001', { isCritical: true });

      expect(mockPrismaService.spare_parts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_critical: true,
          }),
        }),
      );
    });

    it('should search by name or code', async () => {
      mockPrismaService.spare_parts.findMany.mockResolvedValue([mockSparePart]);
      mockPrismaService.spare_parts.count.mockResolvedValue(1);

      await service.findAll('business-001', { search: 'فلتر' });

      expect(mockPrismaService.spare_parts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a spare part by id', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(mockSparePart);

      const result = await service.findOne(mockSparePart.id);

      expect(result).toEqual(mockSparePart);
    });

    it('should throw NotFoundException when part not found', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'فلتر زيت محدث',
      unitCost: 120,
    };

    it('should update an existing spare part', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(mockSparePart);
      mockPrismaService.spare_parts.update.mockResolvedValue({
        ...mockSparePart,
        ...updateDto,
      });

      const result = await service.update(mockSparePart.id, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException when part not found', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when changing to existing part code', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(mockSparePart);
      mockPrismaService.spare_parts.findFirst.mockResolvedValue({ id: 'other-part' });

      await expect(
        service.update(mockSparePart.id, { partCode: 'EXISTING-CODE' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete a spare part', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(mockSparePart);
      mockPrismaService.spare_parts.delete.mockResolvedValue(mockSparePart);

      const result = await service.delete(mockSparePart.id);

      expect(result).toEqual(mockSparePart);
    });

    it('should throw NotFoundException when part not found', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createMovement', () => {
    const receiptDto = {
      partId: 'part-001',
      movementType: 'receipt',
      quantity: 20,
      unitCost: 100,
      notes: 'استلام من المورد',
    };

    it('should create a receipt movement and increase stock', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(mockSparePart);
      mockPrismaService.spare_part_movements.create.mockResolvedValue({
        id: 'mov-001',
        ...receiptDto,
      });
      mockPrismaService.spare_parts.update.mockResolvedValue({
        ...mockSparePart,
        current_stock: 70,
      });

      const result = await service.createMovement(receiptDto);

      expect(result.previousStock).toBe(50);
      expect(result.newStock).toBe(70);
    });

    it('should create an issue movement and decrease stock', async () => {
      const issueDto = {
        partId: 'part-001',
        movementType: 'issue',
        quantity: 10,
        notes: 'صرف لأمر عمل',
      };

      mockPrismaService.spare_parts.findUnique.mockResolvedValue(mockSparePart);
      mockPrismaService.spare_part_movements.create.mockResolvedValue({
        id: 'mov-002',
        ...issueDto,
      });
      mockPrismaService.spare_parts.update.mockResolvedValue({
        ...mockSparePart,
        current_stock: 40,
      });

      const result = await service.createMovement(issueDto);

      expect(result.previousStock).toBe(50);
      expect(result.newStock).toBe(40);
    });

    it('should throw BadRequestException when insufficient stock for issue', async () => {
      const issueDto = {
        partId: 'part-001',
        movementType: 'issue',
        quantity: 100, // More than current stock
      };

      mockPrismaService.spare_parts.findUnique.mockResolvedValue(mockSparePart);

      await expect(service.createMovement(issueDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when part not found', async () => {
      mockPrismaService.spare_parts.findUnique.mockResolvedValue(null);

      await expect(service.createMovement(receiptDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid movement type', async () => {
      const invalidDto = {
        partId: 'part-001',
        movementType: 'invalid',
        quantity: 10,
      };

      mockPrismaService.spare_parts.findUnique.mockResolvedValue(mockSparePart);

      await expect(service.createMovement(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
