import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateMaintenanceRequestDto {
  businessId: string;
  assetId?: string;
  stationId?: string;
  requestType: string;
  priority?: string;
  title: string;
  description?: string;
  reportedBy?: string;
  location?: string;
  attachments?: any[];
}

export interface UpdateMaintenanceRequestDto {
  assetId?: string;
  stationId?: string;
  requestType?: string;
  priority?: string;
  title?: string;
  description?: string;
  location?: string;
  status?: string;
  assignedTo?: string;
  teamId?: string;
  estimatedCompletion?: string;
  resolution?: string;
  rootCause?: string;
  attachments?: any[];
}

@Injectable()
export class MaintenanceRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateRequestNumber(businessId: string): Promise<string> {
    const today = new Date();
    const prefix = `MR-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const lastRequest = await this.prisma.maintenance_requests.findFirst({
      where: {
        business_id: businessId,
        request_number: { startsWith: prefix },
      },
      orderBy: { request_number: 'desc' },
    });

    let sequence = 1;
    if (lastRequest) {
      const lastSeq = parseInt(lastRequest.request_number.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  async create(dto: CreateMaintenanceRequestDto) {
    const requestNumber = await this.generateRequestNumber(dto.businessId);

    return this.prisma.maintenance_requests.create({
      data: {
        business_id: dto.businessId,
        request_number: requestNumber,
        asset_id: dto.assetId,
        station_id: dto.stationId,
        request_type: dto.requestType,
        priority: dto.priority || 'medium',
        title: dto.title,
        description: dto.description,
        reported_by: dto.reportedBy,
        location: dto.location,
        status: 'new',
        attachments: dto.attachments,
      },
      include: {
        asset: {
          select: { id: true, name: true, asset_number: true },
        },
      },
    });
  }

  async findAll(businessId: string, filters?: {
    status?: string;
    priority?: string;
    assetId?: string;
    stationId?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { business_id: businessId };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assetId) where.asset_id = filters.assetId;
    if (filters?.stationId) where.station_id = filters.stationId;

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.maintenance_requests.findMany({
        where,
        include: {
          asset: {
            select: { id: true, name: true, asset_number: true },
          },
          work_orders: {
            select: { id: true, work_order_number: true, status: true },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { reported_at: 'desc' },
        ],
      }),
      this.prisma.maintenance_requests.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const request = await this.prisma.maintenance_requests.findUnique({
      where: { id },
      include: {
        asset: true,
        work_orders: {
          include: {
            records: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    return request;
  }

  async update(id: string, dto: UpdateMaintenanceRequestDto) {
    const existing = await this.prisma.maintenance_requests.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Maintenance request not found');
    }

    return this.prisma.maintenance_requests.update({
      where: { id },
      data: {
        asset_id: dto.assetId,
        station_id: dto.stationId,
        request_type: dto.requestType,
        priority: dto.priority,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        status: dto.status,
        assigned_to: dto.assignedTo,
        team_id: dto.teamId,
        estimated_completion: dto.estimatedCompletion ? new Date(dto.estimatedCompletion) : undefined,
        actual_completion: dto.status === 'completed' ? new Date() : undefined,
        resolution: dto.resolution,
        root_cause: dto.rootCause,
        attachments: dto.attachments,
      },
      include: {
        asset: {
          select: { id: true, name: true, asset_number: true },
        },
      },
    });
  }

  async assign(id: string, assignedTo: string, teamId?: string) {
    const request = await this.prisma.maintenance_requests.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    return this.prisma.maintenance_requests.update({
      where: { id },
      data: {
        assigned_to: assignedTo,
        team_id: teamId,
        status: 'assigned',
      },
    });
  }

  async complete(id: string, resolution: string, rootCause?: string) {
    const request = await this.prisma.maintenance_requests.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    return this.prisma.maintenance_requests.update({
      where: { id },
      data: {
        status: 'completed',
        actual_completion: new Date(),
        resolution,
        root_cause: rootCause,
      },
    });
  }

  async getStatistics(businessId: string) {
    const [byStatus, byPriority, byType, recentRequests] = await Promise.all([
      this.prisma.maintenance_requests.groupBy({
        by: ['status'],
        where: { business_id: businessId },
        _count: true,
      }),
      this.prisma.maintenance_requests.groupBy({
        by: ['priority'],
        where: { business_id: businessId, status: { notIn: ['completed', 'cancelled'] } },
        _count: true,
      }),
      this.prisma.maintenance_requests.groupBy({
        by: ['request_type'],
        where: { business_id: businessId },
        _count: true,
      }),
      this.prisma.maintenance_requests.findMany({
        where: { business_id: businessId },
        orderBy: { reported_at: 'desc' },
        take: 5,
        select: {
          id: true,
          request_number: true,
          title: true,
          status: true,
          priority: true,
          reported_at: true,
        },
      }),
    ]);

    return {
      byStatus,
      byPriority,
      byType,
      recentRequests,
    };
  }
}
