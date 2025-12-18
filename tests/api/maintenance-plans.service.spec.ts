import { Test, TestingModule } from '@nestjs/testing';
import { MaintenancePlansService } from './maintenance-plans.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('MaintenancePlansService', () => {
  let service: MaintenancePlansService;
  let prisma: PrismaService;

  const mockPrismaService = {
    maintenance_plans: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    maintenance_schedules: {
      createMany: jest.fn(),
    },
  };

  const mockPlan = {
    id: 'plan-001',
    business_id: 'business-001',
    name: 'خطة صيانة المولدات',
    description: 'صيانة دورية للمولدات',
    asset_category_id: 'cat-001',
    frequency_type: 'monthly',
    frequency_value: 1,
    frequency_unit: 'month',
    estimated_duration: 120,
    estimated_cost: 500,
    checklist: [{ item: 'فحص الزيت', required: true }],
    required_parts: [{ partId: 'part-001', quantity: 1 }],
    required_skills: ['electrical', 'mechanical'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    schedules: [],
    _count: { schedules: 5 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenancePlansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MaintenancePlansService>(MaintenancePlansService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      businessId: 'business-001',
      name: 'خطة صيانة جديدة',
      description: 'وصف الخطة',
      frequencyType: 'weekly',
      frequencyValue: 2,
      estimatedDuration: 60,
      estimatedCost: 200,
      isActive: true,
    };

    it('should create a new maintenance plan', async () => {
      mockPrismaService.maintenance_plans.create.mockResolvedValue({
        ...mockPlan,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.maintenance_plans.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          business_id: createDto.businessId,
          name: createDto.name,
          frequency_type: createDto.frequencyType,
        }),
      });
    });

    it('should set default values', async () => {
      const minimalDto = {
        businessId: 'business-001',
        name: 'خطة بسيطة',
        frequencyType: 'monthly',
      };

      mockPrismaService.maintenance_plans.create.mockResolvedValue(mockPlan);

      await service.create(minimalDto);

      expect(mockPrismaService.maintenance_plans.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          frequency_value: 1,
          is_active: true,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all maintenance plans', async () => {
      const plans = [mockPlan];
      mockPrismaService.maintenance_plans.findMany.mockResolvedValue(plans);

      const result = await service.findAll('business-001');

      expect(result).toEqual(plans);
      expect(mockPrismaService.maintenance_plans.findMany).toHaveBeenCalledWith({
        where: { business_id: 'business-001' },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by isActive', async () => {
      mockPrismaService.maintenance_plans.findMany.mockResolvedValue([mockPlan]);

      await service.findAll('business-001', true);

      expect(mockPrismaService.maintenance_plans.findMany).toHaveBeenCalledWith({
        where: { business_id: 'business-001', is_active: true },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a maintenance plan by id', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue(mockPlan);

      const result = await service.findOne(mockPlan.id);

      expect(result).toEqual(mockPlan);
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'خطة محدثة',
      frequencyType: 'quarterly',
      frequencyValue: 1,
    };

    it('should update an existing plan', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.maintenance_plans.update.mockResolvedValue({
        ...mockPlan,
        ...updateDto,
      });

      const result = await service.update(mockPlan.id, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a plan with no schedules', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue({
        ...mockPlan,
        _count: { schedules: 0 },
      });
      mockPrismaService.maintenance_plans.delete.mockResolvedValue(mockPlan);

      const result = await service.remove(mockPlan.id);

      expect(result).toEqual(mockPlan);
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when plan has schedules', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue({
        ...mockPlan,
        _count: { schedules: 5 },
      });

      await expect(service.remove(mockPlan.id)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('generateSchedules', () => {
    it('should generate schedules for assets', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.maintenance_schedules.createMany.mockResolvedValue({
        count: 12,
      });

      const result = await service.generateSchedules(
        mockPlan.id,
        ['asset-001', 'asset-002'],
        '2024-01-01',
        '2024-12-31',
      );

      expect(result.created).toBe(12);
      expect(mockPrismaService.maintenance_schedules.createMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue(null);

      await expect(
        service.generateSchedules('non-existent', ['asset-001'], '2024-01-01', '2024-12-31'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle different frequency types', async () => {
      const weeklyPlan = { ...mockPlan, frequency_type: 'weekly', frequency_value: 2 };
      mockPrismaService.maintenance_plans.findUnique.mockResolvedValue(weeklyPlan);
      mockPrismaService.maintenance_schedules.createMany.mockResolvedValue({
        count: 26,
      });

      const result = await service.generateSchedules(
        weeklyPlan.id,
        ['asset-001'],
        '2024-01-01',
        '2024-12-31',
      );

      expect(result).toBeDefined();
    });
  });
});
