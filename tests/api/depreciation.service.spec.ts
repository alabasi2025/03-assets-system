import { Test, TestingModule } from '@nestjs/testing';
import { DepreciationService } from './depreciation.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DepreciationService', () => {
  let service: DepreciationService;
  let prisma: PrismaService;

  const mockPrismaService = {
    assets: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    asset_depreciation_entries: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAsset = {
    id: 'asset-001',
    business_id: 'business-001',
    asset_number: 'AST-001',
    name: 'مولد كهربائي',
    acquisition_cost: 100000,
    salvage_value: 10000,
    useful_life_years: 10,
    depreciation_method: 'straight_line',
    accumulated_depreciation: 0,
    book_value: 100000,
    status: 'active',
    is_deleted: false,
    category_id: 'cat-001',
    category: { id: 'cat-001', name: 'معدات', code: 'EQP' },
  };

  const mockDepreciationEntry = {
    id: 'entry-001',
    asset_id: 'asset-001',
    period_start: new Date('2024-12-01'),
    period_end: new Date('2024-12-31'),
    depreciation_amount: 750,
    accumulated_before: 0,
    accumulated_after: 750,
    book_value_before: 100000,
    book_value_after: 99250,
    status: 'draft',
    asset: mockAsset,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepreciationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DepreciationService>(DepreciationService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runDepreciation', () => {
    const runDto = {
      businessId: 'business-001',
      periodEnd: '2024-12-31',
    };

    it('should run depreciation for active assets', async () => {
      mockPrismaService.assets.findMany.mockResolvedValue([mockAsset]);
      mockPrismaService.asset_depreciation_entries.findFirst.mockResolvedValue(null);
      mockPrismaService.asset_depreciation_entries.create.mockResolvedValue(mockDepreciationEntry);
      mockPrismaService.assets.update.mockResolvedValue(mockAsset);

      const result = await service.runDepreciation(runDto);

      expect(result.processed).toBe(1);
      expect(result.totalDepreciation).toBeGreaterThan(0);
      expect(result.results).toHaveLength(1);
    });

    it('should skip assets with existing depreciation for the period', async () => {
      mockPrismaService.assets.findMany.mockResolvedValue([mockAsset]);
      mockPrismaService.asset_depreciation_entries.findFirst.mockResolvedValue(mockDepreciationEntry);

      const result = await service.runDepreciation(runDto);

      expect(result.processed).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('should skip fully depreciated assets', async () => {
      const fullyDepreciatedAsset = {
        ...mockAsset,
        book_value: 10000, // Equal to salvage value
      };
      mockPrismaService.assets.findMany.mockResolvedValue([fullyDepreciatedAsset]);
      mockPrismaService.asset_depreciation_entries.findFirst.mockResolvedValue(null);

      const result = await service.runDepreciation(runDto);

      expect(result.processed).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('should calculate straight-line depreciation correctly', async () => {
      mockPrismaService.assets.findMany.mockResolvedValue([mockAsset]);
      mockPrismaService.asset_depreciation_entries.findFirst.mockResolvedValue(null);
      mockPrismaService.asset_depreciation_entries.create.mockResolvedValue(mockDepreciationEntry);
      mockPrismaService.assets.update.mockResolvedValue(mockAsset);

      const result = await service.runDepreciation(runDto);

      // (100000 - 10000) / (10 * 12) = 750 per month
      expect(result.results[0].depreciationAmount).toBe(750);
    });

    it('should calculate declining balance depreciation', async () => {
      const decliningAsset = {
        ...mockAsset,
        depreciation_method: 'declining_balance',
      };
      mockPrismaService.assets.findMany.mockResolvedValue([decliningAsset]);
      mockPrismaService.asset_depreciation_entries.findFirst.mockResolvedValue(null);
      mockPrismaService.asset_depreciation_entries.create.mockResolvedValue(mockDepreciationEntry);
      mockPrismaService.assets.update.mockResolvedValue(decliningAsset);

      const result = await service.runDepreciation(runDto);

      expect(result.results[0].depreciationAmount).toBeGreaterThan(0);
    });

    it('should not depreciate below salvage value', async () => {
      const nearEndAsset = {
        ...mockAsset,
        book_value: 10500, // Close to salvage value
        accumulated_depreciation: 89500,
      };
      mockPrismaService.assets.findMany.mockResolvedValue([nearEndAsset]);
      mockPrismaService.asset_depreciation_entries.findFirst.mockResolvedValue(null);
      mockPrismaService.asset_depreciation_entries.create.mockResolvedValue(mockDepreciationEntry);
      mockPrismaService.assets.update.mockResolvedValue(nearEndAsset);

      const result = await service.runDepreciation(runDto);

      // Should only depreciate 500 (10500 - 10000)
      expect(result.results[0].depreciationAmount).toBe(500);
    });
  });

  describe('getByPeriod', () => {
    it('should return depreciation entries for a period', async () => {
      mockPrismaService.asset_depreciation_entries.findMany.mockResolvedValue([mockDepreciationEntry]);

      const result = await service.getByPeriod('business-001', '2024-12-31');

      expect(result).toEqual([mockDepreciationEntry]);
    });
  });

  describe('postDepreciation', () => {
    it('should post draft depreciation entries', async () => {
      mockPrismaService.asset_depreciation_entries.findMany.mockResolvedValue([mockDepreciationEntry]);
      mockPrismaService.asset_depreciation_entries.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.postDepreciation('business-001', '2024-12-31');

      expect(result.posted).toBe(1);
      expect(result.totalAmount).toBe(750);
    });

    it('should throw BadRequestException when no draft entries found', async () => {
      mockPrismaService.asset_depreciation_entries.findMany.mockResolvedValue([]);

      await expect(
        service.postDepreciation('business-001', '2024-12-31'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reverseDepreciation', () => {
    it('should reverse depreciation entries for a period', async () => {
      mockPrismaService.asset_depreciation_entries.findMany.mockResolvedValue([mockDepreciationEntry]);
      mockPrismaService.assets.update.mockResolvedValue(mockAsset);
      mockPrismaService.asset_depreciation_entries.delete.mockResolvedValue(mockDepreciationEntry);

      const result = await service.reverseDepreciation('business-001', '2024-12-31');

      expect(result.reversed).toBe(1);
      expect(mockPrismaService.assets.update).toHaveBeenCalledWith({
        where: { id: mockDepreciationEntry.asset_id },
        data: {
          accumulated_depreciation: mockDepreciationEntry.accumulated_before,
          book_value: mockDepreciationEntry.book_value_before,
        },
      });
    });

    it('should throw NotFoundException when no entries found', async () => {
      mockPrismaService.asset_depreciation_entries.findMany.mockResolvedValue([]);

      await expect(
        service.reverseDepreciation('business-001', '2024-12-31'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSummaryByCategory', () => {
    it('should return depreciation summary grouped by category', async () => {
      mockPrismaService.asset_depreciation_entries.findMany.mockResolvedValue([
        mockDepreciationEntry,
        {
          ...mockDepreciationEntry,
          id: 'entry-002',
          depreciation_amount: 500,
          accumulated_after: 500,
          book_value_after: 49500,
        },
      ]);

      const result = await service.getSummaryByCategory('business-001', '2024-12-31');

      expect(result).toHaveLength(1);
      expect(result[0].assetCount).toBe(2);
      expect(result[0].totalDepreciation).toBe(1250);
    });
  });
});
