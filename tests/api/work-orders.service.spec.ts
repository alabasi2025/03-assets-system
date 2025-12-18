import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    work_orders: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    maintenance_requests: {
      update: jest.fn(),
    },
    maintenance_records: {
      create: jest.fn(),
    },
  };

  const mockWorkOrder = {
    id: 'wo-001',
    business_id: 'business-001',
    work_order_number: 'WO-202412-0001',
    request_id: 'req-001',
    asset_id: 'asset-001',
    order_type: 'corrective',
    priority: 'high',
    title: 'إصلاح المولد',
    description: 'إصلاح عطل في المولد',
    status: 'draft',
    assigned_to: 'tech-001',
    estimated_cost: 5000,
    actual_cost: null,
    created_at: new Date(),
    updated_at: new Date(),
    asset: { id: 'asset-001', name: 'مولد 1', asset_number: 'AST-001' },
    request: { id: 'req-001', request_number: 'MR-202412-0001', title: 'عطل في المولد' },
    records: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      businessId: 'business-001',
      requestId: 'req-001',
      assetId: 'asset-001',
      orderType: 'corrective',
      priority: 'high',
      title: 'أمر عمل جديد',
      description: 'وصف أمر العمل',
      assignedTo: 'tech-001',
      estimatedCost: 5000,
    };

    it('should create a new work order', async () => {
      mockPrismaService.work_orders.findFirst.mockResolvedValue(null);
      mockPrismaService.work_orders.create.mockResolvedValue({
        ...mockWorkOrder,
        ...createDto,
      });
      mockPrismaService.maintenance_requests.update.mockResolvedValue({});

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.work_orders.create).toHaveBeenCalled();
    });

    it('should update maintenance request status when linked', async () => {
      mockPrismaService.work_orders.findFirst.mockResolvedValue(null);
      mockPrismaService.work_orders.create.mockResolvedValue(mockWorkOrder);
      mockPrismaService.maintenance_requests.update.mockResolvedValue({});

      await service.create(createDto);

      expect(mockPrismaService.maintenance_requests.update).toHaveBeenCalledWith({
        where: { id: createDto.requestId },
        data: { status: 'in_progress' },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated work orders', async () => {
      const workOrders = [mockWorkOrder];
      mockPrismaService.work_orders.findMany.mockResolvedValue(workOrders);
      mockPrismaService.work_orders.count.mockResolvedValue(1);

      const result = await service.findAll('business-001');

      expect(result.data).toEqual(workOrders);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrismaService.work_orders.findMany.mockResolvedValue([mockWorkOrder]);
      mockPrismaService.work_orders.count.mockResolvedValue(1);

      await service.findAll('business-001', { status: 'draft' });

      expect(mockPrismaService.work_orders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'draft',
          }),
        }),
      );
    });

    it('should filter by assignedTo', async () => {
      mockPrismaService.work_orders.findMany.mockResolvedValue([mockWorkOrder]);
      mockPrismaService.work_orders.count.mockResolvedValue(1);

      await service.findAll('business-001', { assignedTo: 'tech-001' });

      expect(mockPrismaService.work_orders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assigned_to: 'tech-001',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a work order by id', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue(mockWorkOrder);

      const result = await service.findOne(mockWorkOrder.id);

      expect(result).toEqual(mockWorkOrder);
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('approve', () => {
    it('should approve a draft work order', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue(mockWorkOrder);
      mockPrismaService.work_orders.update.mockResolvedValue({
        ...mockWorkOrder,
        status: 'approved',
        approved_by: 'manager-001',
      });

      const result = await service.approve(mockWorkOrder.id, 'manager-001');

      expect(result.status).toBe('approved');
    });

    it('should throw BadRequestException when work order is not draft', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue({
        ...mockWorkOrder,
        status: 'in_progress',
      });

      await expect(
        service.approve(mockWorkOrder.id, 'manager-001'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('start', () => {
    it('should start an approved work order', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue({
        ...mockWorkOrder,
        status: 'approved',
      });
      mockPrismaService.work_orders.update.mockResolvedValue({
        ...mockWorkOrder,
        status: 'in_progress',
        actual_start: new Date(),
      });

      const result = await service.start(mockWorkOrder.id);

      expect(result.status).toBe('in_progress');
    });

    it('should throw BadRequestException when work order is not approved', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue(mockWorkOrder);

      await expect(service.start(mockWorkOrder.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('complete', () => {
    it('should complete a work order', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue({
        ...mockWorkOrder,
        status: 'in_progress',
      });
      mockPrismaService.work_orders.update.mockResolvedValue({
        ...mockWorkOrder,
        status: 'completed',
        actual_cost: 4500,
      });
      mockPrismaService.maintenance_requests.update.mockResolvedValue({});

      const result = await service.complete(mockWorkOrder.id, 4500, 'تم الإصلاح بنجاح');

      expect(result.status).toBe('completed');
    });

    it('should update linked maintenance request when completing', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue({
        ...mockWorkOrder,
        status: 'in_progress',
        request_id: 'req-001',
      });
      mockPrismaService.work_orders.update.mockResolvedValue({
        ...mockWorkOrder,
        status: 'completed',
      });
      mockPrismaService.maintenance_requests.update.mockResolvedValue({});

      await service.complete(mockWorkOrder.id);

      expect(mockPrismaService.maintenance_requests.update).toHaveBeenCalledWith({
        where: { id: 'req-001' },
        data: expect.objectContaining({
          status: 'completed',
        }),
      });
    });
  });

  describe('close', () => {
    it('should close a completed work order', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue({
        ...mockWorkOrder,
        status: 'completed',
      });
      mockPrismaService.work_orders.update.mockResolvedValue({
        ...mockWorkOrder,
        status: 'closed',
        closed_by: 'manager-001',
      });

      const result = await service.close(mockWorkOrder.id, 'manager-001');

      expect(result.status).toBe('closed');
    });

    it('should throw BadRequestException when work order is not completed', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue({
        ...mockWorkOrder,
        status: 'in_progress',
      });

      await expect(
        service.close(mockWorkOrder.id, 'manager-001'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addMaintenanceRecord', () => {
    const recordDto = {
      assetId: 'asset-001',
      maintenanceType: 'corrective',
      performedDate: '2024-12-18',
      performedBy: 'tech-001',
      description: 'تم إصلاح العطل',
      laborHours: 4,
      laborCost: 200,
      partsCost: 500,
    };

    it('should add a maintenance record to work order', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue(mockWorkOrder);
      mockPrismaService.maintenance_records.create.mockResolvedValue({
        id: 'record-001',
        work_order_id: mockWorkOrder.id,
        ...recordDto,
        total_cost: 700,
      });

      const result = await service.addMaintenanceRecord(mockWorkOrder.id, recordDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.maintenance_records.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue(null);

      await expect(
        service.addMaintenanceRecord('non-existent', recordDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a work order', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue(mockWorkOrder);
      mockPrismaService.work_orders.delete.mockResolvedValue(mockWorkOrder);

      const result = await service.delete(mockWorkOrder.id);

      expect(result).toEqual(mockWorkOrder);
    });

    it('should throw NotFoundException when work order not found', async () => {
      mockPrismaService.work_orders.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should return work order statistics', async () => {
      mockPrismaService.work_orders.groupBy.mockResolvedValue([
        { status: 'draft', _count: 5 },
        { status: 'completed', _count: 10 },
      ]);
      mockPrismaService.work_orders.aggregate.mockResolvedValue({
        _sum: { estimated_cost: 50000, actual_cost: 45000 },
      });

      const result = await service.getStatistics('business-001');

      expect(result.byStatus).toBeDefined();
      expect(result.byType).toBeDefined();
      expect(result.costs).toBeDefined();
    });
  });
});
