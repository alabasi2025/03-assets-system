import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateMaintenancePlanDto {
  businessId: string;
  name: string;
  description?: string;
  assetCategoryId?: string;
  frequencyType: string;
  frequencyValue?: number;
  frequencyUnit?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  checklist?: any[];
  requiredParts?: any[];
  requiredSkills?: string[];
  isActive?: boolean;
  createdBy?: string;
}

export interface UpdateMaintenancePlanDto {
  name?: string;
  description?: string;
  assetCategoryId?: string;
  frequencyType?: string;
  frequencyValue?: number;
  frequencyUnit?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  checklist?: any[];
  requiredParts?: any[];
  requiredSkills?: string[];
  isActive?: boolean;
}

@Injectable()
export class MaintenancePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaintenancePlanDto) {
    return this.prisma.maintenance_plans.create({
      data: {
        business_id: dto.businessId,
        name: dto.name,
        description: dto.description,
        asset_category_id: dto.assetCategoryId,
        frequency_type: dto.frequencyType,
        frequency_value: dto.frequencyValue || 1,
        frequency_unit: dto.frequencyUnit,
        estimated_duration: dto.estimatedDuration,
        estimated_cost: dto.estimatedCost,
        checklist: dto.checklist,
        required_parts: dto.requiredParts,
        required_skills: dto.requiredSkills,
        is_active: dto.isActive ?? true,

      },
    });
  }

  async findAll(businessId: string, isActive?: boolean) {
    const where: any = { business_id: businessId };
    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    return this.prisma.maintenance_plans.findMany({
      where,
      include: {
        _count: {
          select: { schedules: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.maintenance_plans.findUnique({
      where: { id },
      include: {
        schedules: {
          where: { status: { in: ['scheduled', 'overdue'] } },
          orderBy: { scheduled_date: 'asc' },
          take: 10,
        },
        _count: {
          select: { schedules: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Maintenance plan not found`);
    }

    return plan;
  }

  async update(id: string, dto: UpdateMaintenancePlanDto) {
    const existing = await this.prisma.maintenance_plans.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Maintenance plan not found`);
    }

    return this.prisma.maintenance_plans.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        asset_category_id: dto.assetCategoryId,
        frequency_type: dto.frequencyType,
        frequency_value: dto.frequencyValue,
        frequency_unit: dto.frequencyUnit,
        estimated_duration: dto.estimatedDuration,
        estimated_cost: dto.estimatedCost,
        checklist: dto.checklist,
        required_parts: dto.requiredParts,
        required_skills: dto.requiredSkills,
        is_active: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    const plan = await this.prisma.maintenance_plans.findUnique({
      where: { id },
      include: {
        _count: { select: { schedules: true } },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Maintenance plan not found`);
    }

    if (plan._count.schedules > 0) {
      throw new ConflictException('Cannot delete plan with existing schedules');
    }

    return this.prisma.maintenance_plans.delete({ where: { id } });
  }

  async generateSchedules(planId: string, assetIds: string[], startDate: string, endDate: string) {
    const plan = await this.prisma.maintenance_plans.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Maintenance plan not found');
    }

    const schedules: any[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const assetId of assetIds) {
      const currentDate = new Date(start);
      let scheduleNumber = 1;

      while (currentDate <= end) {
        const scheduleNum = `PM-${plan.id.slice(0, 8)}-${assetId.slice(0, 8)}-${scheduleNumber.toString().padStart(4, '0')}`;

        schedules.push({
          business_id: plan.business_id,
          plan_id: planId,
          asset_id: assetId,
          schedule_number: scheduleNum,
          scheduled_date: new Date(currentDate),
          due_date: new Date(currentDate),
          status: 'scheduled',
          priority: 'medium',
        });

        // Calculate next date based on frequency
        switch (plan.frequency_type) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + (plan.frequency_value || 1));
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + (plan.frequency_value || 1) * 7);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + (plan.frequency_value || 1));
            break;
          case 'quarterly':
            currentDate.setMonth(currentDate.getMonth() + (plan.frequency_value || 1) * 3);
            break;
          case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + (plan.frequency_value || 1));
            break;
          default:
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        scheduleNumber++;
      }
    }

    // Create all schedules
    const created = await this.prisma.maintenance_schedules.createMany({
      data: schedules,
      skipDuplicates: true,
    });

    return {
      created: created.count,
      total: schedules.length,
    };
  }
}
