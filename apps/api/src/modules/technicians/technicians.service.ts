import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateContractorDto,
  UpdateContractorDto,
  CreateTechnicianDto,
  UpdateTechnicianDto,
  CreateMaintenanceContractDto,
  UpdateMaintenanceContractDto,
  CreatePerformanceDto,
} from './dto/technician.dto';

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════
  // Contractors
  // ═══════════════════════════════════════════════════════════════

  async createContractor(dto: CreateContractorDto) {
    const existing = await this.prisma.contractors.findFirst({
      where: { business_id: dto.businessId, contractor_code: dto.contractorCode },
    });

    if (existing) {
      throw new ConflictException(`Contractor with code ${dto.contractorCode} already exists`);
    }

    return this.prisma.contractors.create({
      data: {
        business_id: dto.businessId,
        contractor_code: dto.contractorCode,
        name: dto.name,
        name_en: dto.nameEn,
        contact_person: dto.contactPerson,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        specializations: dto.specializations,
        tax_number: dto.taxNumber,
        bank_account: dto.bankAccount,
        notes: dto.notes,
      },
    });
  }

  async findAllContractors(businessId: string, filters?: { status?: string; search?: string }) {
    const where: any = { business_id: businessId, is_deleted: false };

    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { name_en: { contains: filters.search, mode: 'insensitive' } },
        { contractor_code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.contractors.findMany({
      where,
      include: {
        _count: { select: { technicians: true, contracts: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneContractor(id: string) {
    const contractor = await this.prisma.contractors.findUnique({
      where: { id },
      include: {
        technicians: { where: { is_deleted: false } },
        contracts: { where: { is_deleted: false } },
      },
    });

    if (!contractor || contractor.is_deleted) {
      throw new NotFoundException('Contractor not found');
    }

    return contractor;
  }

  async updateContractor(id: string, dto: UpdateContractorDto) {
    const existing = await this.prisma.contractors.findUnique({ where: { id } });
    if (!existing || existing.is_deleted) {
      throw new NotFoundException('Contractor not found');
    }

    if (dto.contractorCode && dto.contractorCode !== existing.contractor_code) {
      const duplicate = await this.prisma.contractors.findFirst({
        where: {
          business_id: existing.business_id,
          contractor_code: dto.contractorCode,
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new ConflictException(`Contractor with code ${dto.contractorCode} already exists`);
      }
    }

    return this.prisma.contractors.update({
      where: { id },
      data: {
        contractor_code: dto.contractorCode,
        name: dto.name,
        name_en: dto.nameEn,
        contact_person: dto.contactPerson,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        specializations: dto.specializations,
        tax_number: dto.taxNumber,
        bank_account: dto.bankAccount,
        rating: dto.rating,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async deleteContractor(id: string) {
    const contractor = await this.prisma.contractors.findUnique({
      where: { id },
      include: { _count: { select: { technicians: true, contracts: true } } },
    });

    if (!contractor || contractor.is_deleted) {
      throw new NotFoundException('Contractor not found');
    }

    if (contractor._count.technicians > 0 || contractor._count.contracts > 0) {
      throw new BadRequestException('Cannot delete contractor with associated technicians or contracts');
    }

    return this.prisma.contractors.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Technicians
  // ═══════════════════════════════════════════════════════════════

  async createTechnician(dto: CreateTechnicianDto) {
    const existing = await this.prisma.technicians.findFirst({
      where: { business_id: dto.businessId, technician_code: dto.technicianCode },
    });

    if (existing) {
      throw new ConflictException(`Technician with code ${dto.technicianCode} already exists`);
    }

    // Validate contractor if external
    if (!dto.isInternal && dto.contractorId) {
      const contractor = await this.prisma.contractors.findUnique({
        where: { id: dto.contractorId },
      });
      if (!contractor || contractor.is_deleted) {
        throw new NotFoundException('Contractor not found');
      }
    }

    return this.prisma.technicians.create({
      data: {
        business_id: dto.businessId,
        employee_id: dto.employeeId,
        technician_code: dto.technicianCode,
        name: dto.name,
        name_en: dto.nameEn,
        phone: dto.phone,
        email: dto.email,
        specializations: dto.specializations,
        certifications: dto.certifications,
        skills_level: dto.skillsLevel || 'mid',
        hourly_rate: dto.hourlyRate || 0,
        is_internal: dto.isInternal ?? true,
        contractor_id: dto.contractorId,
        is_available: dto.isAvailable ?? true,
        notes: dto.notes,
      },
      include: {
        contractor: true,
      },
    });
  }

  async findAllTechnicians(businessId: string, filters?: {
    isInternal?: boolean;
    isAvailable?: boolean;
    skillsLevel?: string;
    contractorId?: string;
    search?: string;
  }) {
    const where: any = { business_id: businessId, is_deleted: false };

    if (filters?.isInternal !== undefined) where.is_internal = filters.isInternal;
    if (filters?.isAvailable !== undefined) where.is_available = filters.isAvailable;
    if (filters?.skillsLevel) where.skills_level = filters.skillsLevel;
    if (filters?.contractorId) where.contractor_id = filters.contractorId;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { name_en: { contains: filters.search, mode: 'insensitive' } },
        { technician_code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.technicians.findMany({
      where,
      include: {
        contractor: { select: { id: true, name: true, contractor_code: true } },
        _count: { select: { work_orders: true, performances: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneTechnician(id: string) {
    const technician = await this.prisma.technicians.findUnique({
      where: { id },
      include: {
        contractor: true,
        work_orders: {
          where: { status: { in: ['in_progress', 'approved'] } },
          take: 10,
          orderBy: { created_at: 'desc' },
        },
        performances: {
          take: 5,
          orderBy: { period_end: 'desc' },
        },
      },
    });

    if (!technician || technician.is_deleted) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async updateTechnician(id: string, dto: UpdateTechnicianDto) {
    const existing = await this.prisma.technicians.findUnique({ where: { id } });
    if (!existing || existing.is_deleted) {
      throw new NotFoundException('Technician not found');
    }

    if (dto.technicianCode && dto.technicianCode !== existing.technician_code) {
      const duplicate = await this.prisma.technicians.findFirst({
        where: {
          business_id: existing.business_id,
          technician_code: dto.technicianCode,
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new ConflictException(`Technician with code ${dto.technicianCode} already exists`);
      }
    }

    return this.prisma.technicians.update({
      where: { id },
      data: {
        employee_id: dto.employeeId,
        technician_code: dto.technicianCode,
        name: dto.name,
        name_en: dto.nameEn,
        phone: dto.phone,
        email: dto.email,
        specializations: dto.specializations,
        certifications: dto.certifications,
        skills_level: dto.skillsLevel,
        hourly_rate: dto.hourlyRate,
        is_internal: dto.isInternal,
        contractor_id: dto.contractorId,
        rating: dto.rating,
        is_available: dto.isAvailable,
        notes: dto.notes,
      },
      include: {
        contractor: true,
      },
    });
  }

  async deleteTechnician(id: string) {
    const technician = await this.prisma.technicians.findUnique({
      where: { id },
      include: { _count: { select: { work_orders: true } } },
    });

    if (!technician || technician.is_deleted) {
      throw new NotFoundException('Technician not found');
    }

    return this.prisma.technicians.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  async getAvailableTechnicians(businessId: string, specialization?: string) {
    const where: any = {
      business_id: businessId,
      is_deleted: false,
      is_available: true,
    };

    if (specialization) {
      where.specializations = { has: specialization };
    }

    return this.prisma.technicians.findMany({
      where,
      include: {
        contractor: { select: { id: true, name: true } },
      },
      orderBy: [{ rating: 'desc' }, { completed_jobs: 'desc' }],
    });
  }

  async updateTechnicianStats(id: string) {
    const technician = await this.prisma.technicians.findUnique({ where: { id } });
    if (!technician) return;

    const stats = await this.prisma.work_orders.groupBy({
      by: ['status'],
      where: { assigned_to: id },
      _count: true,
    });

    const totalJobs = stats.reduce((sum, s) => sum + s._count, 0);
    const completedJobs = stats.find(s => s.status === 'completed')?._count || 0;

    await this.prisma.technicians.update({
      where: { id },
      data: { total_jobs: totalJobs, completed_jobs: completedJobs },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Maintenance Contracts
  // ═══════════════════════════════════════════════════════════════

  async createContract(dto: CreateMaintenanceContractDto) {
    const existing = await this.prisma.maintenance_contracts.findFirst({
      where: { business_id: dto.businessId, contract_number: dto.contractNumber },
    });

    if (existing) {
      throw new ConflictException(`Contract with number ${dto.contractNumber} already exists`);
    }

    const contractor = await this.prisma.contractors.findUnique({
      where: { id: dto.contractorId },
    });
    if (!contractor || contractor.is_deleted) {
      throw new NotFoundException('Contractor not found');
    }

    return this.prisma.maintenance_contracts.create({
      data: {
        business_id: dto.businessId,
        contract_number: dto.contractNumber,
        contractor_id: dto.contractorId,
        title: dto.title,
        description: dto.description,
        contract_type: dto.contractType || 'annual',
        start_date: new Date(dto.startDate),
        end_date: new Date(dto.endDate),
        value: dto.value,
        payment_terms: dto.paymentTerms,
        scope: dto.scope,
        sla: dto.sla,
      },
      include: {
        contractor: true,
      },
    });
  }

  async findAllContracts(businessId: string, filters?: { status?: string; contractorId?: string }) {
    const where: any = { business_id: businessId, is_deleted: false };

    if (filters?.status) where.status = filters.status;
    if (filters?.contractorId) where.contractor_id = filters.contractorId;

    return this.prisma.maintenance_contracts.findMany({
      where,
      include: {
        contractor: { select: { id: true, name: true, contractor_code: true } },
      },
      orderBy: { end_date: 'desc' },
    });
  }

  async findOneContract(id: string) {
    const contract = await this.prisma.maintenance_contracts.findUnique({
      where: { id },
      include: {
        contractor: true,
      },
    });

    if (!contract || contract.is_deleted) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async updateContract(id: string, dto: UpdateMaintenanceContractDto) {
    const existing = await this.prisma.maintenance_contracts.findUnique({ where: { id } });
    if (!existing || existing.is_deleted) {
      throw new NotFoundException('Contract not found');
    }

    return this.prisma.maintenance_contracts.update({
      where: { id },
      data: {
        contract_number: dto.contractNumber,
        title: dto.title,
        description: dto.description,
        contract_type: dto.contractType,
        start_date: dto.startDate ? new Date(dto.startDate) : undefined,
        end_date: dto.endDate ? new Date(dto.endDate) : undefined,
        value: dto.value,
        payment_terms: dto.paymentTerms,
        scope: dto.scope,
        sla: dto.sla,
        status: dto.status,
      },
      include: {
        contractor: true,
      },
    });
  }

  async deleteContract(id: string) {
    const contract = await this.prisma.maintenance_contracts.findUnique({ where: { id } });
    if (!contract || contract.is_deleted) {
      throw new NotFoundException('Contract not found');
    }

    return this.prisma.maintenance_contracts.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Performance
  // ═══════════════════════════════════════════════════════════════

  async createPerformance(dto: CreatePerformanceDto) {
    const technician = await this.prisma.technicians.findUnique({
      where: { id: dto.technicianId },
    });
    if (!technician || technician.is_deleted) {
      throw new NotFoundException('Technician not found');
    }

    // Calculate overall score
    const qualityScore = dto.qualityScore || 0;
    const efficiencyScore = dto.efficiencyScore || 0;
    const overallScore = (qualityScore + efficiencyScore) / 2;

    const performance = await this.prisma.technician_performance.create({
      data: {
        technician_id: dto.technicianId,
        period_start: new Date(dto.periodStart),
        period_end: new Date(dto.periodEnd),
        total_jobs: dto.totalJobs || 0,
        completed_on_time: dto.completedOnTime || 0,
        completed_late: dto.completedLate || 0,
        rework_count: dto.reworkCount || 0,
        customer_complaints: dto.customerComplaints || 0,
        quality_score: qualityScore,
        efficiency_score: efficiencyScore,
        overall_score: overallScore,
        notes: dto.notes,
        evaluated_by: dto.evaluatedBy,
      },
    });

    // Update technician rating (average of last 5 performances)
    const recentPerformances = await this.prisma.technician_performance.findMany({
      where: { technician_id: dto.technicianId },
      orderBy: { period_end: 'desc' },
      take: 5,
    });

    const avgRating = recentPerformances.reduce((sum, p) => sum + Number(p.overall_score), 0) / recentPerformances.length;

    await this.prisma.technicians.update({
      where: { id: dto.technicianId },
      data: { rating: avgRating },
    });

    return performance;
  }

  async getPerformanceHistory(technicianId: string) {
    const technician = await this.prisma.technicians.findUnique({
      where: { id: technicianId },
    });
    if (!technician || technician.is_deleted) {
      throw new NotFoundException('Technician not found');
    }

    return this.prisma.technician_performance.findMany({
      where: { technician_id: technicianId },
      orderBy: { period_end: 'desc' },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Statistics
  // ═══════════════════════════════════════════════════════════════

  async getStatistics(businessId: string) {
    const [
      contractorsCount,
      techniciansCount,
      internalTechnicians,
      externalTechnicians,
      availableTechnicians,
      activeContracts,
    ] = await Promise.all([
      this.prisma.contractors.count({ where: { business_id: businessId, is_deleted: false } }),
      this.prisma.technicians.count({ where: { business_id: businessId, is_deleted: false } }),
      this.prisma.technicians.count({ where: { business_id: businessId, is_deleted: false, is_internal: true } }),
      this.prisma.technicians.count({ where: { business_id: businessId, is_deleted: false, is_internal: false } }),
      this.prisma.technicians.count({ where: { business_id: businessId, is_deleted: false, is_available: true } }),
      this.prisma.maintenance_contracts.count({ where: { business_id: businessId, is_deleted: false, status: 'active' } }),
    ]);

    const topTechnicians = await this.prisma.technicians.findMany({
      where: { business_id: businessId, is_deleted: false },
      orderBy: { rating: 'desc' },
      take: 5,
      select: { id: true, name: true, rating: true, completed_jobs: true },
    });

    return {
      summary: {
        contractorsCount,
        techniciansCount,
        internalTechnicians,
        externalTechnicians,
        availableTechnicians,
        activeContracts,
      },
      topTechnicians,
    };
  }
}
