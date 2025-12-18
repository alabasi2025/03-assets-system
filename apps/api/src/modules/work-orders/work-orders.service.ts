import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateWorkOrderDto {
  businessId: string;
  requestId?: string;
  assetId?: string;
  customerId?: string;
  orderType: string;
  priority?: string;
  title: string;
  description?: string;
  instructions?: string;
  assignedTo?: string;
  teamId?: string;
  contractorId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedCost?: number;
  createdBy?: string;
}

export interface UpdateWorkOrderDto {
  assetId?: string;
  customerId?: string;
  orderType?: string;
  priority?: string;
  title?: string;
  description?: string;
  instructions?: string;
  status?: string;
  assignedTo?: string;
  teamId?: string;
  contractorId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
}

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateWorkOrderNumber(businessId: string): Promise<string> {
    const today = new Date();
    const prefix = `WO-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const lastOrder = await this.prisma.work_orders.findFirst({
      where: {
        business_id: businessId,
        work_order_number: { startsWith: prefix },
      },
      orderBy: { work_order_number: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.work_order_number.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateWorkOrderDto) {
    const workOrderNumber = await this.generateWorkOrderNumber(dto.businessId);

    const workOrder = await this.prisma.work_orders.create({
      data: {
        business_id: dto.businessId,
        work_order_number: workOrderNumber,
        request_id: dto.requestId,
        asset_id: dto.assetId,
        customer_id: dto.customerId,
        order_type: dto.orderType,
        priority: dto.priority || 'medium',
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        status: 'draft',
        assigned_to: dto.assignedTo,
        team_id: dto.teamId,
        contractor_id: dto.contractorId,
        scheduled_start: dto.scheduledStart ? new Date(dto.scheduledStart) : null,
        scheduled_end: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
        estimated_cost: dto.estimatedCost,

      },
      include: {
        asset: { select: { id: true, name: true, asset_number: true } },
        request: { select: { id: true, request_number: true, title: true } },
      },
    });

    // Update maintenance request status if linked
    if (dto.requestId) {
      await this.prisma.maintenance_requests.update({
        where: { id: dto.requestId },
        data: { status: 'in_progress' },
      });
    }

    return workOrder;
  }

  async findAll(businessId: string, filters?: {
    status?: string;
    priority?: string;
    orderType?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { business_id: businessId };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.orderType) where.order_type = filters.orderType;
    if (filters?.assignedTo) where.assigned_to = filters.assignedTo;

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.work_orders.findMany({
        where,
        include: {
          asset: { select: { id: true, name: true, asset_number: true } },
          request: { select: { id: true, request_number: true, title: true } },
          _count: { select: { records: true } },
        },
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
      }),
      this.prisma.work_orders.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.work_orders.findUnique({
      where: { id },
      include: {
        asset: true,
        request: true,
        records: {
          orderBy: { performed_date: 'desc' },
        },

      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    const existing = await this.prisma.work_orders.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Work order not found');
    }

    return this.prisma.work_orders.update({
      where: { id },
      data: {
        asset_id: dto.assetId,
        customer_id: dto.customerId,
        order_type: dto.orderType,
        priority: dto.priority,
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        status: dto.status,
        assigned_to: dto.assignedTo,
        team_id: dto.teamId,
        contractor_id: dto.contractorId,
        scheduled_start: dto.scheduledStart ? new Date(dto.scheduledStart) : undefined,
        scheduled_end: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
        actual_start: dto.actualStart ? new Date(dto.actualStart) : undefined,
        actual_end: dto.actualEnd ? new Date(dto.actualEnd) : undefined,
        estimated_cost: dto.estimatedCost,
        actual_cost: dto.actualCost,
        notes: dto.notes,
      },
      include: {
        asset: { select: { id: true, name: true, asset_number: true } },
        request: { select: { id: true, request_number: true, title: true } },
      },
    });
  }

  async approve(id: string, approvedBy: string) {
    const workOrder = await this.prisma.work_orders.findUnique({
      where: { id },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status !== 'draft') {
      throw new BadRequestException('Only draft work orders can be approved');
    }

    return this.prisma.work_orders.update({
      where: { id },
      data: {
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date(),
      },
    });
  }

  async start(id: string) {
    const workOrder = await this.prisma.work_orders.findUnique({
      where: { id },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (!['approved', 'assigned'].includes(workOrder.status)) {
      throw new BadRequestException('Work order must be approved or assigned to start');
    }

    return this.prisma.work_orders.update({
      where: { id },
      data: {
        status: 'in_progress',
        actual_start: new Date(),
      },
    });
  }

  async complete(id: string, actualCost?: number, notes?: string) {
    const workOrder = await this.prisma.work_orders.findUnique({
      where: { id },
      include: { request: true },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const updated = await this.prisma.work_orders.update({
      where: { id },
      data: {
        status: 'completed',
        actual_end: new Date(),
        actual_cost: actualCost,
        notes,
      },
    });

    // Update linked maintenance request
    if (workOrder.request_id) {
      await this.prisma.maintenance_requests.update({
        where: { id: workOrder.request_id },
        data: {
          status: 'completed',
          actual_completion: new Date(),
        },
      });
    }

    return updated;
  }

  async close(id: string, closedBy: string) {
    const workOrder = await this.prisma.work_orders.findUnique({
      where: { id },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status !== 'completed') {
      throw new BadRequestException('Only completed work orders can be closed');
    }

    return this.prisma.work_orders.update({
      where: { id },
      data: {
        status: 'closed',
        closed_by: closedBy,
        closed_at: new Date(),
      },
    });
  }

  async addMaintenanceRecord(workOrderId: string, record: {
    assetId: string;
    maintenanceType: string;
    performedDate: string;
    performedBy?: string;
    description?: string;
    findings?: string;
    actionsTaken?: string;
    partsUsed?: any[];
    laborHours?: number;
    laborCost?: number;
    partsCost?: number;
    otherCost?: number;
    conditionBefore?: string;
    conditionAfter?: string;
    nextMaintenanceDate?: string;
  }) {
    const workOrder = await this.prisma.work_orders.findUnique({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const recordNumber = `MR-${workOrder.work_order_number}-${Date.now()}`;
    const totalCost = (record.laborCost || 0) + (record.partsCost || 0) + (record.otherCost || 0);

    return this.prisma.maintenance_records.create({
      data: {
        work_order_id: workOrderId,
        asset_id: record.assetId,
        maintenance_type: record.maintenanceType,
        record_number: recordNumber,
        performed_date: new Date(record.performedDate),
        performed_by: record.performedBy,
        description: record.description,
        findings: record.findings,
        actions_taken: record.actionsTaken,
        parts_used: record.partsUsed,
        labor_hours: record.laborHours,
        labor_cost: record.laborCost,
        parts_cost: record.partsCost,
        other_cost: record.otherCost,
        total_cost: totalCost,
        condition_before: record.conditionBefore,
        condition_after: record.conditionAfter,
        next_maintenance_date: record.nextMaintenanceDate ? new Date(record.nextMaintenanceDate) : null,
      },
    });
  }

  async delete(id: string) {
    const workOrder = await this.prisma.work_orders.findUnique({
      where: { id },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return this.prisma.work_orders.delete({
      where: { id },
    });
  }

  async getStatistics(businessId: string) {
    const [byStatus, byType, byPriority, totalCosts] = await Promise.all([
      this.prisma.work_orders.groupBy({
        by: ['status'],
        where: { business_id: businessId },
        _count: true,
      }),
      this.prisma.work_orders.groupBy({
        by: ['order_type'],
        where: { business_id: businessId },
        _count: true,
      }),
      this.prisma.work_orders.groupBy({
        by: ['priority'],
        where: { business_id: businessId, status: { notIn: ['completed', 'closed', 'cancelled'] } },
        _count: true,
      }),
      this.prisma.work_orders.aggregate({
        where: { business_id: businessId },
        _sum: { estimated_cost: true, actual_cost: true },
      }),
    ]);

    return {
      byStatus,
      byType,
      byPriority,
      costs: {
        totalEstimated: totalCosts._sum.estimated_cost || 0,
        totalActual: totalCosts._sum.actual_cost || 0,
      },
    };
  }
}
