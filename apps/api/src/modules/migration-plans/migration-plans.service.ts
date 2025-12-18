import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateMigrationPlanDto,
  UpdateMigrationPlanDto,
  ApproveMigrationPlanDto,
  MigrationPlanQueryDto,
  CreateMigrationPlanItemDto,
  UpdateMigrationPlanItemDto,
  BulkAddItemsDto,
  MigrationPlanItemQueryDto,
  PlanStatus,
  ItemStatus
} from './dto/migration-plan.dto';

@Injectable()
export class MigrationPlansService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════
  // Migration Plan CRUD
  // ═══════════════════════════════════════════════════════════════

  async create(dto: CreateMigrationPlanDto) {
    // التحقق من عدم وجود كود مكرر
    const existing = await this.prisma.migration_plans.findUnique({
      where: { plan_code: dto.plan_code }
    });

    if (existing) {
      throw new BadRequestException('كود الخطة موجود مسبقاً');
    }

    return this.prisma.migration_plans.create({
      data: {
        ...dto,
        planned_start_date: dto.planned_start_date ? new Date(dto.planned_start_date) : null,
        planned_end_date: dto.planned_end_date ? new Date(dto.planned_end_date) : null,
        status: PlanStatus.DRAFT
      },
      include: {
        station: true,
        _count: { select: { items: true } }
      }
    });
  }

  async findAll(query: MigrationPlanQueryDto) {
    const { business_id, station_id, status, page = 1, limit = 10 } = query;

    const where: any = { is_deleted: false };

    if (business_id) where.business_id = business_id;
    if (station_id) where.station_id = station_id;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.migration_plans.findMany({
        where,
        include: {
          station: true,
          _count: { select: { items: true } }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.migration_plans.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const plan = await this.prisma.migration_plans.findFirst({
      where: { id, is_deleted: false },
      include: {
        station: true,
        items: {
          where: { is_deleted: false },
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!plan) {
      throw new NotFoundException('خطة الترحيل غير موجودة');
    }

    return plan;
  }

  async update(id: string, dto: UpdateMigrationPlanDto) {
    const plan = await this.findOne(id);

    if (plan.status === PlanStatus.COMPLETED) {
      throw new BadRequestException('لا يمكن تعديل خطة مكتملة');
    }

    const updateData: any = { ...dto };
    if (dto.planned_start_date) {
      updateData.planned_start_date = new Date(dto.planned_start_date);
    }
    if (dto.planned_end_date) {
      updateData.planned_end_date = new Date(dto.planned_end_date);
    }

    return this.prisma.migration_plans.update({
      where: { id },
      data: updateData,
      include: {
        station: true,
        _count: { select: { items: true } }
      }
    });
  }

  async remove(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== PlanStatus.DRAFT) {
      throw new BadRequestException('يمكن حذف المسودات فقط');
    }

    return this.prisma.migration_plans.update({
      where: { id },
      data: { is_deleted: true }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Workflow
  // ═══════════════════════════════════════════════════════════════

  async approve(id: string, dto: ApproveMigrationPlanDto) {
    const plan = await this.findOne(id);

    if (plan.status !== PlanStatus.DRAFT) {
      throw new BadRequestException('يمكن اعتماد المسودات فقط');
    }

    if (plan.items.length === 0) {
      throw new BadRequestException('لا يمكن اعتماد خطة بدون عناصر');
    }

    return this.prisma.migration_plans.update({
      where: { id },
      data: {
        status: PlanStatus.APPROVED,
        approved_by: dto.approved_by,
        approved_at: new Date()
      }
    });
  }

  async start(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== PlanStatus.APPROVED) {
      throw new BadRequestException('يمكن بدء الخطط المعتمدة فقط');
    }

    return this.prisma.migration_plans.update({
      where: { id },
      data: {
        status: PlanStatus.IN_PROGRESS,
        actual_start_date: new Date()
      }
    });
  }

  async complete(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== PlanStatus.IN_PROGRESS) {
      throw new BadRequestException('يمكن إكمال الخطط قيد التنفيذ فقط');
    }

    // التحقق من اكتمال جميع العناصر
    const pendingItems = plan.items.filter(i => i.status !== ItemStatus.MIGRATED);
    if (pendingItems.length > 0) {
      throw new BadRequestException(`يوجد ${pendingItems.length} عنصر لم يكتمل ترحيله`);
    }

    return this.prisma.migration_plans.update({
      where: { id },
      data: {
        status: PlanStatus.COMPLETED,
        actual_end_date: new Date()
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Items Management
  // ═══════════════════════════════════════════════════════════════

  async addItem(dto: CreateMigrationPlanItemDto) {
    const plan = await this.findOne(dto.plan_id);

    if (plan.status === PlanStatus.COMPLETED) {
      throw new BadRequestException('لا يمكن إضافة عناصر لخطة مكتملة');
    }

    // التحقق من عدم وجود العميل مسبقاً
    const existing = await this.prisma.migration_plan_items.findFirst({
      where: {
        plan_id: dto.plan_id,
        customer_id: dto.customer_id,
        is_deleted: false
      }
    });

    if (existing) {
      throw new BadRequestException('العميل موجود مسبقاً في هذه الخطة');
    }

    // حساب الوفر في السلك
    const wire_saved = dto.old_wire_length && dto.new_wire_length
      ? dto.old_wire_length - dto.new_wire_length
      : null;

    // حساب التكلفة الإجمالية
    const total_cost = (dto.meter_cost || 0) + (dto.wire_cost || 0) + (dto.installation_cost || 0);

    // حساب حصة العميل بناءً على سياسة التكلفة
    let customer_share = 0;
    if (plan.cost_policy === 'full_cost') {
      customer_share = total_cost;
    } else if (plan.cost_policy === 'meter_only') {
      customer_share = dto.meter_cost || 0;
    } else if (plan.cost_policy === 'partial') {
      customer_share = total_cost * (Number(plan.cost_percentage) / 100);
    }

    const item = await this.prisma.migration_plan_items.create({
      data: {
        plan_id: dto.plan_id,
        customer_id: dto.customer_id,
        old_wire_length: dto.old_wire_length,
        new_wire_length: dto.new_wire_length,
        wire_saved,
        meter_cost: dto.meter_cost,
        wire_cost: dto.wire_cost,
        installation_cost: dto.installation_cost,
        total_cost,
        customer_share,
        old_meter_serial: dto.old_meter_serial
      }
    });

    // تحديث إحصائيات الخطة
    await this.updatePlanStats(dto.plan_id);

    return item;
  }

  async bulkAddItems(dto: BulkAddItemsDto) {
    const results = [];
    for (const item of dto.items) {
      try {
        const result = await this.addItem({ ...item, plan_id: dto.plan_id });
        results.push({ success: true, item: result });
      } catch (error) {
        results.push({ success: false, customer_id: item.customer_id, error: error.message });
      }
    }
    return results;
  }

  async updateItem(id: string, dto: UpdateMigrationPlanItemDto) {
    const item = await this.prisma.migration_plan_items.findFirst({
      where: { id, is_deleted: false },
      include: { plan: true }
    });

    if (!item) {
      throw new NotFoundException('عنصر الخطة غير موجود');
    }

    if (item.plan.status === PlanStatus.COMPLETED) {
      throw new BadRequestException('لا يمكن تعديل عناصر خطة مكتملة');
    }

    const updateData: any = { ...dto };

    // إعادة حساب الوفر في السلك إذا تغيرت القياسات
    if (dto.old_wire_length !== undefined || dto.new_wire_length !== undefined) {
      const oldLength = dto.old_wire_length ?? Number(item.old_wire_length);
      const newLength = dto.new_wire_length ?? Number(item.new_wire_length);
      updateData.wire_saved = oldLength - newLength;
    }

    // إعادة حساب التكلفة الإجمالية
    if (dto.meter_cost !== undefined || dto.wire_cost !== undefined || dto.installation_cost !== undefined) {
      const meterCost = dto.meter_cost ?? Number(item.meter_cost) ?? 0;
      const wireCost = dto.wire_cost ?? Number(item.wire_cost) ?? 0;
      const installCost = dto.installation_cost ?? Number(item.installation_cost) ?? 0;
      updateData.total_cost = meterCost + wireCost + installCost;
    }

    if (dto.return_date) {
      updateData.return_date = new Date(dto.return_date);
    }

    const updated = await this.prisma.migration_plan_items.update({
      where: { id },
      data: updateData
    });

    // تحديث إحصائيات الخطة
    await this.updatePlanStats(item.plan_id);

    return updated;
  }

  async removeItem(id: string) {
    const item = await this.prisma.migration_plan_items.findFirst({
      where: { id, is_deleted: false },
      include: { plan: true }
    });

    if (!item) {
      throw new NotFoundException('عنصر الخطة غير موجود');
    }

    if (item.plan.status !== PlanStatus.DRAFT) {
      throw new BadRequestException('يمكن حذف عناصر المسودات فقط');
    }

    await this.prisma.migration_plan_items.update({
      where: { id },
      data: { is_deleted: true }
    });

    // تحديث إحصائيات الخطة
    await this.updatePlanStats(item.plan_id);

    return { message: 'تم حذف العنصر بنجاح' };
  }

  async getItems(planId: string, query: MigrationPlanItemQueryDto) {
    const where: any = { plan_id: planId, is_deleted: false };

    if (query.status) where.status = query.status;
    if (query.customer_id) where.customer_id = query.customer_id;

    return this.prisma.migration_plan_items.findMany({
      where,
      orderBy: { created_at: 'asc' }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Statistics
  // ═══════════════════════════════════════════════════════════════

  private async updatePlanStats(planId: string) {
    const items = await this.prisma.migration_plan_items.findMany({
      where: { plan_id: planId, is_deleted: false }
    });

    const stats = {
      total_customers: items.length,
      total_wire_old: items.reduce((sum, i) => sum + (Number(i.old_wire_length) || 0), 0),
      total_wire_new: items.reduce((sum, i) => sum + (Number(i.new_wire_length) || 0), 0),
      total_wire_saved: items.reduce((sum, i) => sum + (Number(i.wire_saved) || 0), 0),
      total_cost: items.reduce((sum, i) => sum + (Number(i.total_cost) || 0), 0)
    };

    await this.prisma.migration_plans.update({
      where: { id: planId },
      data: stats
    });
  }

  async getStatistics(businessId?: string) {
    const where: any = { is_deleted: false };
    if (businessId) where.business_id = businessId;

    const [total, byStatus, totalSaved, recentPlans] = await Promise.all([
      this.prisma.migration_plans.count({ where }),
      this.prisma.migration_plans.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      this.prisma.migration_plans.aggregate({
        where,
        _sum: {
          total_customers: true,
          total_wire_saved: true,
          total_cost: true
        }
      }),
      this.prisma.migration_plans.findMany({
        where,
        include: { station: true },
        orderBy: { created_at: 'desc' },
        take: 5
      })
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      totals: {
        customers: totalSaved._sum.total_customers || 0,
        wireSaved: totalSaved._sum.total_wire_saved || 0,
        cost: totalSaved._sum.total_cost || 0
      },
      recentPlans
    };
  }
}
