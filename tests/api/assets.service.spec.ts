import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('AssetsService', () => {
  let service: AssetsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    assets: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    asset_categories: {
      findUnique: jest.fn(),
    },
    asset_movements: {
      create: jest.fn(),
    },
  };

  const mockCategory = {
    id: 'cat-001',
    name: 'معدات',
    depreciation_method: 'straight_line',
    useful_life_years: 10,
  };

  const mockAsset = {
    id: 'asset-001',
    business_id: 'business-001',
    category_id: 'cat-001',
    asset_number: 'AST-001',
    name: 'مولد كهربائي',
    name_en: 'Electric Generator',
    status: 'active',
    condition: 'good',
    acquisition_cost: 50000,
    book_value: 45000,
    accumulated_depreciation: 5000,
    salvage_value: 5000,
    useful_life_years: 10,
    depreciation_method: 'straight_line',
    location: 'محطة 1',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    category: mockCategory,
    depreciation_entries: [],
    movements: [],
    maintenance_schedules: [],
    maintenance_records: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      businessId: 'business-001',
      categoryId: 'cat-001',
      assetNumber: 'AST-002',
      name: 'مولد جديد',
      nameEn: 'New Generator',
      acquisitionDate: '2024-01-01',
      acquisitionCost: 60000,
      location: 'محطة 2',
      usefulLifeYears: 10,
      salvageValue: 5000,
    };

    it('should create a new asset', async () => {
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.assets.findFirst.mockResolvedValue(null);
      mockPrismaService.assets.create.mockResolvedValue({ ...mockAsset, ...createDto });
      mockPrismaService.asset_movements.create.mockResolvedValue({});

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.asset_categories.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.assets.create).toHaveBeenCalled();
      expect(mockPrismaService.asset_movements.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when category not found', async () => {
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when asset number already exists', async () => {
      mockPrismaService.asset_categories.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.assets.findFirst.mockResolvedValue(mockAsset);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated assets', async () => {
      const assets = [mockAsset];
      mockPrismaService.assets.findMany.mockResolvedValue(assets);
      mockPrismaService.assets.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(assets);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by businessId', async () => {
      mockPrismaService.assets.findMany.mockResolvedValue([mockAsset]);
      mockPrismaService.assets.count.mockResolvedValue(1);

      await service.findAll({ businessId: 'business-001' });

      expect(mockPrismaService.assets.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            business_id: 'business-001',
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.assets.findMany.mockResolvedValue([mockAsset]);
      mockPrismaService.assets.count.mockResolvedValue(1);

      await service.findAll({ status: 'active' });

      expect(mockPrismaService.assets.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        }),
      );
    });

    it('should search by name or asset number', async () => {
      mockPrismaService.assets.findMany.mockResolvedValue([mockAsset]);
      mockPrismaService.assets.count.mockResolvedValue(1);

      await service.findAll({ search: 'مولد' });

      expect(mockPrismaService.assets.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an asset by id', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(mockAsset);

      const result = await service.findOne(mockAsset.id);

      expect(result).toEqual(mockAsset);
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when asset is deleted', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue({
        ...mockAsset,
        is_deleted: true,
      });

      await expect(service.findOne(mockAsset.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'مولد محدث',
      nameEn: 'Updated Generator',
    };

    it('should update an existing asset', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(mockAsset);
      mockPrismaService.assets.update.mockResolvedValue({ ...mockAsset, ...updateDto });

      const result = await service.update(mockAsset.id, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when changing to existing asset number', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(mockAsset);
      mockPrismaService.assets.findFirst.mockResolvedValue({ id: 'other-asset' });

      await expect(
        service.update(mockAsset.id, { assetNumber: 'EXISTING-NUM' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('dispose', () => {
    const disposeDto = {
      disposalDate: '2024-12-01',
      disposalMethod: 'sale',
      disposalValue: 30000,
      reason: 'Upgrade to new equipment',
    };

    it('should dispose an asset', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(mockAsset);
      mockPrismaService.assets.update.mockResolvedValue({
        ...mockAsset,
        status: 'disposed',
        is_deleted: true,
      });
      mockPrismaService.asset_movements.create.mockResolvedValue({});

      const result = await service.dispose(mockAsset.id, disposeDto);

      expect(result.asset.status).toBe('disposed');
      expect(result.disposal.gainLoss).toBe(disposeDto.disposalValue - Number(mockAsset.book_value));
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(null);

      await expect(service.dispose('non-existent', disposeDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when asset already disposed', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue({
        ...mockAsset,
        status: 'disposed',
      });

      await expect(service.dispose(mockAsset.id, disposeDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getDepreciationSchedule', () => {
    it('should return depreciation schedule for an asset', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(mockAsset);

      const result = await service.getDepreciationSchedule(mockAsset.id);

      expect(result.asset.id).toBe(mockAsset.id);
      expect(result.entries).toBeDefined();
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(null);

      await expect(service.getDepreciationSchedule('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should return asset statistics', async () => {
      mockPrismaService.assets.count.mockResolvedValue(10);
      mockPrismaService.assets.aggregate.mockResolvedValue({
        _sum: { acquisition_cost: 500000, book_value: 400000 },
      });
      mockPrismaService.assets.groupBy.mockResolvedValue([]);

      const result = await service.getStatistics('business-001');

      expect(result.summary).toBeDefined();
      expect(result.byCategory).toBeDefined();
      expect(result.byStatus).toBeDefined();
    });
  });

  describe('softDelete', () => {
    it('should soft delete an asset', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(mockAsset);
      mockPrismaService.assets.update.mockResolvedValue({
        ...mockAsset,
        is_deleted: true,
      });

      const result = await service.softDelete(mockAsset.id);

      expect(result.is_deleted).toBe(true);
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockPrismaService.assets.findUnique.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
