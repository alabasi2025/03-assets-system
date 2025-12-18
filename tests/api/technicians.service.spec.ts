import { Test, TestingModule } from '@nestjs/testing';
import { TechniciansService } from './technicians.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('TechniciansService', () => {
  let service: TechniciansService;
  let prisma: PrismaService;

  const mockPrismaService = {
    contractors: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    technicians: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    maintenance_contracts: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    technician_performance: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    work_orders: {
      groupBy: jest.fn(),
    },
  };

  const mockContractor = {
    id: 'contractor-001',
    business_id: 'business-001',
    contractor_code: 'CON-001',
    name: 'شركة الصيانة',
    status: 'active',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockTechnician = {
    id: 'tech-001',
    business_id: 'business-001',
    technician_code: 'TECH-001',
    name: 'أحمد محمد',
    skills_level: 'senior',
    is_internal: true,
    is_available: true,
    rating: 4.5,
    total_jobs: 50,
    completed_jobs: 48,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockContract = {
    id: 'contract-001',
    business_id: 'business-001',
    contract_number: 'MC-001',
    contractor_id: 'contractor-001',
    title: 'عقد صيانة سنوي',
    status: 'active',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechniciansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TechniciansService>(TechniciansService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════════════
  // Contractors Tests
  // ═══════════════════════════════════════════════════════════════

  describe('createContractor', () => {
    const createDto = {
      businessId: 'business-001',
      contractorCode: 'CON-002',
      name: 'شركة جديدة',
    };

    it('should create a new contractor', async () => {
      mockPrismaService.contractors.findFirst.mockResolvedValue(null);
      mockPrismaService.contractors.create.mockResolvedValue({ ...mockContractor, ...createDto });

      const result = await service.createContractor(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.contractors.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when contractor code exists', async () => {
      mockPrismaService.contractors.findFirst.mockResolvedValue(mockContractor);

      await expect(service.createContractor(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllContractors', () => {
    it('should return list of contractors', async () => {
      mockPrismaService.contractors.findMany.mockResolvedValue([mockContractor]);

      const result = await service.findAllContractors('business-001');

      expect(result).toEqual([mockContractor]);
    });

    it('should filter by status', async () => {
      mockPrismaService.contractors.findMany.mockResolvedValue([mockContractor]);

      await service.findAllContractors('business-001', { status: 'active' });

      expect(mockPrismaService.contractors.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        }),
      );
    });
  });

  describe('findOneContractor', () => {
    it('should return a contractor by id', async () => {
      mockPrismaService.contractors.findUnique.mockResolvedValue(mockContractor);

      const result = await service.findOneContractor(mockContractor.id);

      expect(result).toEqual(mockContractor);
    });

    it('should throw NotFoundException when contractor not found', async () => {
      mockPrismaService.contractors.findUnique.mockResolvedValue(null);

      await expect(service.findOneContractor('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateContractor', () => {
    it('should update a contractor', async () => {
      mockPrismaService.contractors.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.contractors.update.mockResolvedValue({ ...mockContractor, name: 'Updated' });

      const result = await service.updateContractor(mockContractor.id, { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when contractor not found', async () => {
      mockPrismaService.contractors.findUnique.mockResolvedValue(null);

      await expect(service.updateContractor('non-existent', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteContractor', () => {
    it('should soft delete a contractor', async () => {
      mockPrismaService.contractors.findUnique.mockResolvedValue({
        ...mockContractor,
        _count: { technicians: 0, contracts: 0 },
      });
      mockPrismaService.contractors.update.mockResolvedValue({ ...mockContractor, is_deleted: true });

      const result = await service.deleteContractor(mockContractor.id);

      expect(result.is_deleted).toBe(true);
    });

    it('should throw BadRequestException when contractor has technicians', async () => {
      mockPrismaService.contractors.findUnique.mockResolvedValue({
        ...mockContractor,
        _count: { technicians: 5, contracts: 0 },
      });

      await expect(service.deleteContractor(mockContractor.id)).rejects.toThrow(BadRequestException);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Technicians Tests
  // ═══════════════════════════════════════════════════════════════

  describe('createTechnician', () => {
    const createDto = {
      businessId: 'business-001',
      technicianCode: 'TECH-002',
      name: 'فني جديد',
    };

    it('should create a new technician', async () => {
      mockPrismaService.technicians.findFirst.mockResolvedValue(null);
      mockPrismaService.technicians.create.mockResolvedValue({ ...mockTechnician, ...createDto });

      const result = await service.createTechnician(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.technicians.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when technician code exists', async () => {
      mockPrismaService.technicians.findFirst.mockResolvedValue(mockTechnician);

      await expect(service.createTechnician(createDto)).rejects.toThrow(ConflictException);
    });

    it('should validate contractor for external technician', async () => {
      mockPrismaService.technicians.findFirst.mockResolvedValue(null);
      mockPrismaService.contractors.findUnique.mockResolvedValue(null);

      await expect(
        service.createTechnician({
          ...createDto,
          isInternal: false,
          contractorId: 'invalid-contractor',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllTechnicians', () => {
    it('should return list of technicians', async () => {
      mockPrismaService.technicians.findMany.mockResolvedValue([mockTechnician]);

      const result = await service.findAllTechnicians('business-001');

      expect(result).toEqual([mockTechnician]);
    });

    it('should filter by availability', async () => {
      mockPrismaService.technicians.findMany.mockResolvedValue([mockTechnician]);

      await service.findAllTechnicians('business-001', { isAvailable: true });

      expect(mockPrismaService.technicians.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ is_available: true }),
        }),
      );
    });
  });

  describe('findOneTechnician', () => {
    it('should return a technician by id', async () => {
      mockPrismaService.technicians.findUnique.mockResolvedValue(mockTechnician);

      const result = await service.findOneTechnician(mockTechnician.id);

      expect(result).toEqual(mockTechnician);
    });

    it('should throw NotFoundException when technician not found', async () => {
      mockPrismaService.technicians.findUnique.mockResolvedValue(null);

      await expect(service.findOneTechnician('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailableTechnicians', () => {
    it('should return available technicians', async () => {
      mockPrismaService.technicians.findMany.mockResolvedValue([mockTechnician]);

      const result = await service.getAvailableTechnicians('business-001');

      expect(result).toEqual([mockTechnician]);
      expect(mockPrismaService.technicians.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ is_available: true }),
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Contracts Tests
  // ═══════════════════════════════════════════════════════════════

  describe('createContract', () => {
    const createDto = {
      businessId: 'business-001',
      contractNumber: 'MC-002',
      contractorId: 'contractor-001',
      title: 'عقد جديد',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      value: 50000,
    };

    it('should create a new contract', async () => {
      mockPrismaService.maintenance_contracts.findFirst.mockResolvedValue(null);
      mockPrismaService.contractors.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.maintenance_contracts.create.mockResolvedValue({ ...mockContract, ...createDto });

      const result = await service.createContract(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.maintenance_contracts.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when contract number exists', async () => {
      mockPrismaService.maintenance_contracts.findFirst.mockResolvedValue(mockContract);

      await expect(service.createContract(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when contractor not found', async () => {
      mockPrismaService.maintenance_contracts.findFirst.mockResolvedValue(null);
      mockPrismaService.contractors.findUnique.mockResolvedValue(null);

      await expect(service.createContract(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllContracts', () => {
    it('should return list of contracts', async () => {
      mockPrismaService.maintenance_contracts.findMany.mockResolvedValue([mockContract]);

      const result = await service.findAllContracts('business-001');

      expect(result).toEqual([mockContract]);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Performance Tests
  // ═══════════════════════════════════════════════════════════════

  describe('createPerformance', () => {
    const createDto = {
      technicianId: 'tech-001',
      periodStart: '2024-01-01',
      periodEnd: '2024-03-31',
      totalJobs: 20,
      completedOnTime: 18,
      qualityScore: 4.5,
      efficiencyScore: 4.2,
    };

    it('should create a performance record', async () => {
      mockPrismaService.technicians.findUnique.mockResolvedValue(mockTechnician);
      mockPrismaService.technician_performance.create.mockResolvedValue({ id: 'perf-001', ...createDto });
      mockPrismaService.technician_performance.findMany.mockResolvedValue([{ overall_score: 4.35 }]);
      mockPrismaService.technicians.update.mockResolvedValue(mockTechnician);

      const result = await service.createPerformance(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.technician_performance.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when technician not found', async () => {
      mockPrismaService.technicians.findUnique.mockResolvedValue(null);

      await expect(service.createPerformance(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Statistics Tests
  // ═══════════════════════════════════════════════════════════════

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      mockPrismaService.contractors.count.mockResolvedValue(5);
      mockPrismaService.technicians.count.mockResolvedValue(20);
      mockPrismaService.maintenance_contracts.count.mockResolvedValue(3);
      mockPrismaService.technicians.findMany.mockResolvedValue([mockTechnician]);

      const result = await service.getStatistics('business-001');

      expect(result.summary).toBeDefined();
      expect(result.topTechnicians).toBeDefined();
    });
  });
});
