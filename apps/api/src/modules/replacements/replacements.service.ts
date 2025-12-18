import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateComponentReplacementDto,
  UpdateComponentReplacementDto,
  ComponentReplacementQueryDto,
  WizardStep1Dto,
  WizardStep2Dto,
  WizardStep3Dto,
  WizardStep4Dto,
  WizardStep5Dto,
  DamagedMeterQueryDto,
  ReplacementStatus,
  DamagedMeterStatus,
  CostOption
} from './dto/replacement.dto';

@Injectable()
export class ReplacementsService {
  constructor(private prisma: PrismaService) {}

  async createReplacement(dto: CreateComponentReplacementDto) {
    const total_cost = (dto.component_cost || 0) + (dto.labor_cost || 0);
    return this.prisma.component_replacements.create({
      data: {
        ...dto,
        total_cost,
        warranty_end_date: dto.warranty_end_date ? new Date(dto.warranty_end_date) : null,
        replacement_date: dto.replacement_date ? new Date(dto.replacement_date) : null,
        status: ReplacementStatus.PENDING
      },
      include: { work_order: true, technician: true }
    });
  }

  async findAllReplacements(query: ComponentReplacementQueryDto) {
    const { business_id, work_order_id, customer_id, component_type, status, page = 1, limit = 10 } = query;
    const where: any = { is_deleted: false };
    if (business_id) where.business_id = business_id;
    if (work_order_id) where.work_order_id = work_order_id;
    if (customer_id) where.customer_id = customer_id;
    if (component_type) where.component_type = component_type;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.component_replacements.findMany({
        where,
        include: { work_order: true, technician: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.component_replacements.count({ where })
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneReplacement(id: string) {
    const replacement = await this.prisma.component_replacements.findFirst({
      where: { id, is_deleted: false },
      include: { work_order: true, technician: true }
    });
    if (!replacement) throw new NotFoundException('عملية الاستبدال غير موجودة');
    return replacement;
  }

  async updateReplacement(id: string, dto: UpdateComponentReplacementDto) {
    await this.findOneReplacement(id);
    const updateData: any = { ...dto };
    if (dto.warranty_end_date) updateData.warranty_end_date = new Date(dto.warranty_end_date);
    if (dto.replacement_date) updateData.replacement_date = new Date(dto.replacement_date);
    return this.prisma.component_replacements.update({
      where: { id },
      data: updateData,
      include: { work_order: true, technician: true }
    });
  }

  async removeReplacement(id: string) {
    const replacement = await this.findOneReplacement(id);
    if (replacement.status === ReplacementStatus.COMPLETED) {
      throw new BadRequestException('لا يمكن حذف عملية استبدال مكتملة');
    }
    return this.prisma.component_replacements.update({ where: { id }, data: { is_deleted: true } });
  }

  async completeReplacement(id: string) {
    const replacement = await this.findOneReplacement(id);
    if (replacement.status === ReplacementStatus.COMPLETED) {
      throw new BadRequestException('عملية الاستبدال مكتملة بالفعل');
    }
    return this.prisma.component_replacements.update({
      where: { id },
      data: { status: ReplacementStatus.COMPLETED, replacement_date: new Date() }
    });
  }

  async wizardStep1(dto: WizardStep1Dto, createdBy?: string) {
    const existingRequest = await this.prisma.damaged_meter_replacements.findFirst({
      where: {
        customer_id: dto.customer_id,
        status: { notIn: [DamagedMeterStatus.COMPLETED, DamagedMeterStatus.CANCELLED] },
        is_deleted: false
      }
    });
    if (existingRequest) throw new BadRequestException('يوجد طلب استبدال مفتوح لهذا العميل');
    return this.prisma.damaged_meter_replacements.create({
      data: {
        business_id: dto.business_id,
        customer_id: dto.customer_id,
        old_meter_serial: dto.old_meter_serial,
        status: DamagedMeterStatus.DRAFT,
        wizard_step: 1,
        created_by: createdBy
      }
    });
  }

  async wizardStep2(id: string, dto: WizardStep2Dto) {
    const request = await this.findDamagedMeterRequest(id);
    if (request.wizard_step !== 1) throw new BadRequestException('يجب إكمال الخطوة السابقة أولاً');
    let avgDailyConsumption = dto.avg_daily_consumption || 15;
    const estimatedConsumption = avgDailyConsumption * dto.missing_days;
    return this.prisma.damaged_meter_replacements.update({
      where: { id },
      data: { avg_daily_consumption: avgDailyConsumption, missing_days: dto.missing_days, estimated_consumption: estimatedConsumption, wizard_step: 2 }
    });
  }

  async wizardStep3(id: string, dto: WizardStep3Dto) {
    const request = await this.findDamagedMeterRequest(id);
    if (request.wizard_step !== 2) throw new BadRequestException('يجب إكمال الخطوة السابقة أولاً');
    const meterCost = dto.meter_cost || 500;
    let chargedAmount = dto.cost_option === CostOption.FULL ? meterCost : dto.cost_option === CostOption.HALF ? meterCost * 0.5 : 0;
    return this.prisma.damaged_meter_replacements.update({
      where: { id },
      data: { meter_cost: meterCost, cost_option: dto.cost_option, charged_amount: chargedAmount, cost_reason: dto.cost_reason, wizard_step: 3 }
    });
  }

  async wizardStep4(id: string, dto: WizardStep4Dto) {
    const request = await this.findDamagedMeterRequest(id);
    if (request.wizard_step !== 3) throw new BadRequestException('يجب إكمال الخطوة السابقة أولاً');
    const workOrder = await this.prisma.work_orders.create({
      data: {
        business_id: request.business_id,
        work_order_number: `WO-DMR-${Date.now()}`,
        customer_id: request.customer_id,
        order_type: 'replacement',
        priority: 'high',
        title: `استبدال عداد تالف - ${request.old_meter_serial || 'غير محدد'}`,
        description: `استبدال العداد التالف برقم ${request.old_meter_serial} بعداد جديد برقم ${dto.new_meter_serial}`,
        instructions: dto.instructions,
        status: 'draft',
        assigned_to: dto.technician_id,
        scheduled_start: dto.scheduled_date ? new Date(dto.scheduled_date) : null,
        estimated_cost: request.charged_amount
      }
    });
    return this.prisma.damaged_meter_replacements.update({
      where: { id },
      data: { new_meter_serial: dto.new_meter_serial, work_order_id: workOrder.id, wizard_step: 4 }
    });
  }

  async wizardStep5(id: string, dto: WizardStep5Dto) {
    const request = await this.findDamagedMeterRequest(id);
    if (request.wizard_step !== 4) throw new BadRequestException('يجب إكمال الخطوة السابقة أولاً');
    if (!dto.confirmed) throw new BadRequestException('يجب تأكيد الطلب');
    if (request.work_order_id) {
      await this.prisma.work_orders.update({ where: { id: request.work_order_id }, data: { status: 'assigned' } });
    }
    const newStatus = Number(request.charged_amount) > 0 ? DamagedMeterStatus.PENDING_PAYMENT : DamagedMeterStatus.READY_FOR_INSTALLATION;
    return this.prisma.damaged_meter_replacements.update({
      where: { id },
      data: { status: newStatus, wizard_step: 5 },
      include: { work_order: true }
    });
  }

  async findAllDamagedMeterRequests(query: DamagedMeterQueryDto) {
    const { business_id, customer_id, status, page = 1, limit = 10 } = query;
    const where: any = { is_deleted: false };
    if (business_id) where.business_id = business_id;
    if (customer_id) where.customer_id = customer_id;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.damaged_meter_replacements.findMany({ where, include: { work_order: true }, orderBy: { created_at: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.damaged_meter_replacements.count({ where })
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findDamagedMeterRequest(id: string) {
    const request = await this.prisma.damaged_meter_replacements.findFirst({ where: { id, is_deleted: false }, include: { work_order: true } });
    if (!request) throw new NotFoundException('طلب استبدال العداد غير موجود');
    return request;
  }

  async cancelDamagedMeterRequest(id: string) {
    const request = await this.findDamagedMeterRequest(id);
    if (request.status === DamagedMeterStatus.COMPLETED) throw new BadRequestException('لا يمكن إلغاء طلب مكتمل');
    if (request.work_order_id) await this.prisma.work_orders.update({ where: { id: request.work_order_id }, data: { status: 'cancelled' } });
    return this.prisma.damaged_meter_replacements.update({ where: { id }, data: { status: DamagedMeterStatus.CANCELLED } });
  }

  async completeDamagedMeterRequest(id: string) {
    const request = await this.findDamagedMeterRequest(id);
    if (request.status !== DamagedMeterStatus.IN_PROGRESS) throw new BadRequestException('يمكن إكمال الطلبات قيد التنفيذ فقط');
    if (request.work_order_id) await this.prisma.work_orders.update({ where: { id: request.work_order_id }, data: { status: 'completed', actual_end: new Date() } });
    return this.prisma.damaged_meter_replacements.update({ where: { id }, data: { status: DamagedMeterStatus.COMPLETED } });
  }

  async getStatistics(businessId?: string) {
    const where: any = { is_deleted: false };
    if (businessId) where.business_id = businessId;
    const [totalReplacements, replacementsByType, totalDamagedMeter, damagedMeterByStatus] = await Promise.all([
      this.prisma.component_replacements.count({ where }),
      this.prisma.component_replacements.groupBy({ by: ['component_type'], where, _count: true }),
      this.prisma.damaged_meter_replacements.count({ where }),
      this.prisma.damaged_meter_replacements.groupBy({ by: ['status'], where, _count: true })
    ]);
    return {
      componentReplacements: { total: totalReplacements, byType: replacementsByType.reduce((acc, item) => { acc[item.component_type] = item._count; return acc; }, {} as Record<string, number>) },
      damagedMeterReplacements: { total: totalDamagedMeter, byStatus: damagedMeterByStatus.reduce((acc, item) => { acc[item.status] = item._count; return acc; }, {} as Record<string, number>) }
    };
  }
}
