import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetHistoryDto, AssetHistoryQueryDto, EventType } from './dto/asset-history.dto';

@Injectable()
export class AssetHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssetHistoryDto) {
    return this.prisma.asset_history.create({
      data: {
        ...dto,
        event_date: dto.event_date ? new Date(dto.event_date) : new Date()
      },
      include: { asset: true }
    });
  }

  async findAll(query: AssetHistoryQueryDto) {
    const { asset_id, event_type, start_date, end_date, page = 1, limit = 20 } = query;

    const where: any = {};
    if (asset_id) where.asset_id = asset_id;
    if (event_type) where.event_type = event_type;
    if (start_date || end_date) {
      where.event_date = {};
      if (start_date) where.event_date.gte = new Date(start_date);
      if (end_date) where.event_date.lte = new Date(end_date);
    }

    const [data, total] = await Promise.all([
      this.prisma.asset_history.findMany({
        where,
        include: { asset: { select: { id: true, asset_number: true, name: true } } },
        orderBy: { event_date: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.asset_history.count({ where })
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByAsset(assetId: string, limit: number = 50) {
    const asset = await this.prisma.assets.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('الأصل غير موجود');

    const history = await this.prisma.asset_history.findMany({
      where: { asset_id: assetId },
      orderBy: { event_date: 'desc' },
      take: limit
    });

    return { asset, history };
  }

  async getQuickHistory(assetId: string) {
    const asset = await this.prisma.assets.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('الأصل غير موجود');

    const history = await this.prisma.asset_history.findMany({
      where: { asset_id: assetId },
      orderBy: { event_date: 'desc' },
      take: 10
    });

    return history;
  }

  async getCompleteProfile(assetId: string) {
    const asset = await this.prisma.assets.findUnique({
      where: { id: assetId },
      include: {
        category: true,
        depreciation_entries: { orderBy: { period_end: 'desc' }, take: 12 },
        movements: { orderBy: { movement_date: 'desc' }, take: 10 },
        maintenance_records: { orderBy: { performed_date: 'desc' }, take: 10 },
        work_orders: { orderBy: { created_at: 'desc' }, take: 10 },
        history: { orderBy: { event_date: 'desc' }, take: 20 }
      }
    });

    if (!asset) throw new NotFoundException('الأصل غير موجود');

    // حساب إحصائيات الصيانة
    const maintenanceStats = await this.prisma.maintenance_records.aggregate({
      where: { asset_id: assetId },
      _count: true,
      _sum: { total_cost: true }
    });

    // حساب إحصائيات أوامر العمل
    const workOrderStats = await this.prisma.work_orders.groupBy({
      by: ['status'],
      where: { asset_id: assetId },
      _count: true
    });

    return {
      asset,
      statistics: {
        total_maintenance_records: maintenanceStats._count,
        total_maintenance_cost: maintenanceStats._sum.total_cost || 0,
        work_orders_by_status: workOrderStats.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>)
      }
    };
  }

  // تسجيل حدث تلقائي
  async logEvent(
    assetId: string,
    eventType: EventType,
    description: string,
    options?: {
      referenceType?: string;
      referenceId?: string;
      referenceNumber?: string;
      costImpact?: number;
      valueBefore?: number;
      valueAfter?: number;
      performedBy?: string;
      metadata?: any;
    }
  ) {
    return this.prisma.asset_history.create({
      data: {
        asset_id: assetId,
        event_type: eventType,
        event_description: description,
        reference_type: options?.referenceType,
        reference_id: options?.referenceId,
        reference_number: options?.referenceNumber,
        cost_impact: options?.costImpact,
        value_before: options?.valueBefore,
        value_after: options?.valueAfter,
        performed_by: options?.performedBy,
        metadata: options?.metadata
      }
    });
  }

  async getTimeline(assetId: string) {
    const asset = await this.prisma.assets.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('الأصل غير موجود');

    const [history, maintenanceRecords, movements, workOrders] = await Promise.all([
      this.prisma.asset_history.findMany({ where: { asset_id: assetId }, orderBy: { event_date: 'desc' } }),
      this.prisma.maintenance_records.findMany({ where: { asset_id: assetId }, orderBy: { performed_date: 'desc' } }),
      this.prisma.asset_movements.findMany({ where: { asset_id: assetId }, orderBy: { movement_date: 'desc' } }),
      this.prisma.work_orders.findMany({ where: { asset_id: assetId }, orderBy: { created_at: 'desc' } })
    ]);

    // دمج جميع الأحداث في timeline واحد
    const timeline = [
      ...history.map(h => ({ type: 'history', date: h.event_date, data: h })),
      ...maintenanceRecords.map(m => ({ type: 'maintenance', date: m.performed_date, data: m })),
      ...movements.map(m => ({ type: 'movement', date: m.movement_date, data: m })),
      ...workOrders.map(w => ({ type: 'work_order', date: w.created_at, data: w }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { asset, timeline };
  }
}
