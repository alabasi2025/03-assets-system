import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceRequestsService } from './maintenance-requests.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MaintenanceRequestsService', () => {
  let service: MaintenanceRequestsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    maintenance_requests: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockRequest = {
    id: 'req-001',
    business_id: 'business-001',
    request_number: 'MR-202412-0001',
    asset_id: 'asset-001',
    station_id: 'station-001',
    request_type: 'breakdown',
    priority: 'high',
    title: 'عطل في المولد',
    description: 'المولد لا يعمل',
    reported_by: 'user-001',
    location: 'محطة 1',
    status: 'new',
    reported_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    asset: { id: 'asset-001', name: 'مولد 1', asset_number: 'AST-001' },
    work_orders: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceRequestsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MaintenanceRequestsService>(MaintenanceRequestsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      businessId: 'business-001',
      assetId: 'asset-001',
      stationId: 'station-001',
      requestType: 'breakdown',
      priority: 'high',
      title: 'عطل جديد',
      description: 'وصف العطل',
      reportedBy: 'user-001',
      location: 'محطة 1',
    };

    it('should create a new maintenance request', async () => {
      mockPrismaService.maintenance_requests.findFirst.mockResolvedValue(null);
      mockPrismaService.maintenance_requests.create.mockResolvedValue({
        ...mockRequest,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.maintenance_requests.create).toHaveBeenCalled();
    });

    it('should generate unique request number', async () => {
      mockPrismaService.maintenance_requests.findFirst.mockResolvedValue({
        request_number: 'MR-202412-0005',
      });
      mockPrismaService.maintenance_requests.create.mockResolvedValue(mockRequest);

      await service.create(createDto);

      expect(mockPrismaService.maintenance_requests.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            request_number: expect.stringMatching(/^MR-\d{6}-\d{4}$/),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated maintenance requests', async () => {
      const requests = [mockRequest];
      mockPrismaService.maintenance_requests.findMany.mockResolvedValue(requests);
      mockPrismaService.maintenance_requests.count.mockResolvedValue(1);

      const result = await service.findAll('business-001');

      expect(result.data).toEqual(requests);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrismaService.maintenance_requests.findMany.mockResolvedValue([mockRequest]);
      mockPrismaService.maintenance_requests.count.mockResolvedValue(1);

      await service.findAll('business-001', { status: 'new' });

      expect(mockPrismaService.maintenance_requests.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'new',
          }),
        }),
      );
    });

    it('should filter by priority', async () => {
      mockPrismaService.maintenance_requests.findMany.mockResolvedValue([mockRequest]);
      mockPrismaService.maintenance_requests.count.mockResolvedValue(1);

      await service.findAll('business-001', { priority: 'high' });

      expect(mockPrismaService.maintenance_requests.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priority: 'high',
          }),
        }),
      );
    });

    it('should paginate results', async () => {
      mockPrismaService.maintenance_requests.findMany.mockResolvedValue([]);
      mockPrismaService.maintenance_requests.count.mockResolvedValue(50);

      const result = await service.findAll('business-001', { page: 2, limit: 10 });

      expect(mockPrismaService.maintenance_requests.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return a maintenance request by id', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(mockRequest);

      const result = await service.findOne(mockRequest.id);

      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException when request not found', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'عنوان محدث',
      priority: 'critical',
      status: 'in_progress',
    };

    it('should update an existing request', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(mockRequest);
      mockPrismaService.maintenance_requests.update.mockResolvedValue({
        ...mockRequest,
        ...updateDto,
      });

      const result = await service.update(mockRequest.id, updateDto);

      expect(result.title).toBe(updateDto.title);
    });

    it('should throw NotFoundException when request not found', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should set actual_completion when status is completed', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(mockRequest);
      mockPrismaService.maintenance_requests.update.mockResolvedValue({
        ...mockRequest,
        status: 'completed',
      });

      await service.update(mockRequest.id, { status: 'completed' });

      expect(mockPrismaService.maintenance_requests.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actual_completion: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('assign', () => {
    it('should assign a request to a technician', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(mockRequest);
      mockPrismaService.maintenance_requests.update.mockResolvedValue({
        ...mockRequest,
        assigned_to: 'tech-001',
        status: 'assigned',
      });

      const result = await service.assign(mockRequest.id, 'tech-001');

      expect(result.assigned_to).toBe('tech-001');
      expect(result.status).toBe('assigned');
    });

    it('should throw NotFoundException when request not found', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(null);

      await expect(service.assign('non-existent', 'tech-001')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('complete', () => {
    it('should complete a request with resolution', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(mockRequest);
      mockPrismaService.maintenance_requests.update.mockResolvedValue({
        ...mockRequest,
        status: 'completed',
        resolution: 'تم الإصلاح',
      });

      const result = await service.complete(mockRequest.id, 'تم الإصلاح', 'عطل كهربائي');

      expect(result.status).toBe('completed');
    });

    it('should throw NotFoundException when request not found', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(null);

      await expect(
        service.complete('non-existent', 'resolution'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a request', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(mockRequest);
      mockPrismaService.maintenance_requests.delete.mockResolvedValue(mockRequest);

      const result = await service.delete(mockRequest.id);

      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException when request not found', async () => {
      mockPrismaService.maintenance_requests.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should return statistics for maintenance requests', async () => {
      mockPrismaService.maintenance_requests.groupBy.mockResolvedValue([
        { status: 'new', _count: 5 },
        { status: 'completed', _count: 10 },
      ]);
      mockPrismaService.maintenance_requests.findMany.mockResolvedValue([mockRequest]);

      const result = await service.getStatistics('business-001');

      expect(result.byStatus).toBeDefined();
      expect(result.byPriority).toBeDefined();
      expect(result.byType).toBeDefined();
      expect(result.recentRequests).toBeDefined();
    });
  });
});
