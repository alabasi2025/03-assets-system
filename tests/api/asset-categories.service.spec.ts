import { Test, TestingModule } from '@nestjs/testing';
import { AssetCategoriesService } from '../../apps/api/src/modules/asset-categories/asset-categories.service';
import { PrismaService } from '../../apps/api/src/common/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('AssetCategoriesService', () => {
  let service: AssetCategoriesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    asset_categories: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCategory = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    business_id: '123e4567-e89b-12d3-a456-426614174001',
    parent_id: null,
    code: 'CAT001',
    name: 'أجهزة كمبيوتر',
    name_en: 'Computers',
    description: 'تصنيف أجهزة الكمبيوتر',
    depreciation_method: 'straight_line',
    useful_life_years: 5,
    salvage_rate: 0.1,
    asset_account_id: null,
    depreciation_account_id: null,
    expense_account_id: null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    parent: null,
    children: [],
    _count: { assets: 0, children: 0 },
  };

  const mockChildCategory = {
    ...mockCategory,
    id: '123e4567-e89b-12d3-a456-426614174002',
    parent_id: mockCategory.id,
    code: 'CAT001-01',
    name: 'لابتوب',
    name_en: 'Laptops',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetCategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssetCategoriesService>(AssetCategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      businessId: '123e4567-e89b-12d3-a456-426614174001',
      code: 'CAT001',
      name: 'أجهزة كمبيوتر',
      nameEn: 'Computers',
      description: 'تصنيف أجهزة الكمبيوتر',
      depreciationMethod: 'straight_line',
      usefulLifeYears: 5,
      salvageRate: 0.1,
      isActive: true,
    };

    it('should create a new category successfully', async () => {
      mockPrismaService.asset_categories.findFirst.mockResolvedValue(null);
      mockPrismaService.asset_categories.create.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.asset_categories.findFirst).toHaveBeenCalledWith({
        where: {
          business_id: createDto.businessId,
          code: createDto.code,
        },
      });
      expect(mockPrismaService.asset_categories.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if code already exists', async () => {
      mockPrismaService.asset_categories.findFirst.mockResolvedValue(mockCategory);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should create category with parent', async () => {
      const dtoWithParent = { ...createDto, parentId: mockCategory.id };
      mockPrismaService.asset_categories.findFirst.mockResolvedValue(null);
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.asset_categories.create.mockResolvedValue(mockChildCategory);

      const result = await service.create(dtoWithParent);

      expect(result).toEqual(mockChildCategory);
      expect(mockPrismaService.asset_categories.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
      });
    });

    it('should throw NotFoundException if parent not found', async () => {
      const dtoWithParent = { ...createDto, parentId: 'non-existent-id' };
      mockPrismaService.asset_categories.findFirst.mockResolvedValue(null);
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(null);

      await expect(service.create(dtoWithParent)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockPrismaService.asset_categories.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAll({});

      expect(result).toEqual([mockCategory]);
      expect(mockPrismaService.asset_categories.findMany).toHaveBeenCalled();
    });

    it('should filter by businessId', async () => {
      mockPrismaService.asset_categories.findMany.mockResolvedValue([mockCategory]);

      await service.findAll({ businessId: mockCategory.business_id });

      expect(mockPrismaService.asset_categories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            business_id: mockCategory.business_id,
          }),
        })
      );
    });

    it('should filter by parentId', async () => {
      mockPrismaService.asset_categories.findMany.mockResolvedValue([mockChildCategory]);

      await service.findAll({ parentId: mockCategory.id });

      expect(mockPrismaService.asset_categories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            parent_id: mockCategory.id,
          }),
        })
      );
    });

    it('should filter by isActive', async () => {
      mockPrismaService.asset_categories.findMany.mockResolvedValue([mockCategory]);

      await service.findAll({ isActive: true });

      expect(mockPrismaService.asset_categories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_active: true,
          }),
        })
      );
    });

    it('should search by name, name_en, or code', async () => {
      mockPrismaService.asset_categories.findMany.mockResolvedValue([mockCategory]);

      await service.findAll({ search: 'كمبيوتر' });

      expect(mockPrismaService.asset_categories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'كمبيوتر', mode: 'insensitive' } },
              { name_en: { contains: 'كمبيوتر', mode: 'insensitive' } },
              { code: { contains: 'كمبيوتر', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockCategory.id);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.asset_categories.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findTree', () => {
    it('should return category tree for a business', async () => {
      const rootWithChildren = {
        ...mockCategory,
        children: [mockChildCategory],
      };
      mockPrismaService.asset_categories.findMany.mockResolvedValue([rootWithChildren]);

      const result = await service.findTree(mockCategory.business_id);

      expect(result).toEqual([rootWithChildren]);
      expect(mockPrismaService.asset_categories.findMany).toHaveBeenCalledWith({
        where: {
          business_id: mockCategory.business_id,
          parent_id: null,
          is_active: true,
        },
        include: expect.any(Object),
        orderBy: { code: 'asc' },
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'أجهزة كمبيوتر محدثة',
      usefulLifeYears: 7,
    };

    it('should update a category successfully', async () => {
      const updatedCategory = { ...mockCategory, ...updateDto };
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.asset_categories.update.mockResolvedValue(updatedCategory);

      const result = await service.update(mockCategory.id, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(mockPrismaService.asset_categories.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new code already exists', async () => {
      const updateWithCode = { ...updateDto, code: 'EXISTING_CODE' };
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.asset_categories.findFirst.mockResolvedValue({ ...mockCategory, id: 'other-id' });

      await expect(service.update(mockCategory.id, updateWithCode)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if trying to set self as parent', async () => {
      const updateWithSelfParent = { parentId: mockCategory.id };
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(mockCategory);

      await expect(service.update(mockCategory.id, updateWithSelfParent)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if new parent not found', async () => {
      const updateWithNewParent = { parentId: 'non-existent-parent' };
      mockPrismaService.asset_categories.findUnique
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(null);

      await expect(service.update(mockCategory.id, updateWithNewParent)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a category successfully', async () => {
      const categoryWithoutRelations = {
        ...mockCategory,
        _count: { assets: 0, children: 0 },
      };
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(categoryWithoutRelations);
      mockPrismaService.asset_categories.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(mockCategory.id);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.asset_categories.delete).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if category has assets', async () => {
      const categoryWithAssets = {
        ...mockCategory,
        _count: { assets: 5, children: 0 },
      };
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(categoryWithAssets);

      await expect(service.remove(mockCategory.id)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if category has children', async () => {
      const categoryWithChildren = {
        ...mockCategory,
        _count: { assets: 0, children: 3 },
      };
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(categoryWithChildren);

      await expect(service.remove(mockCategory.id)).rejects.toThrow(ConflictException);
    });
  });
});
