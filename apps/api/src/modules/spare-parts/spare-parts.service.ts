import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateSparePartDto {
  businessId: string;
  categoryId?: string;
  partCode: string;
  name: string;
  nameEn?: string;
  description?: string;
  unit: string;
  manufacturer?: string;
  modelCompatibility?: string[];
  assetCategories?: string[];
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  unitCost?: number;
  location?: string;
  isCritical?: boolean;
  leadTimeDays?: number;
  notes?: string;
}

export interface UpdateSparePartDto {
  categoryId?: string;
  partCode?: string;
  name?: string;
  nameEn?: string;
  description?: string;
  unit?: string;
  manufacturer?: string;
  modelCompatibility?: string[];
  assetCategories?: string[];
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  unitCost?: number;
  location?: string;
  isCritical?: boolean;
  leadTimeDays?: number;
  notes?: string;
  isActive?: boolean;
}

export interface SparePartMovementDto {
  partId: string;
  movementType: string;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
  createdBy?: string;
}

@Injectable()
export class SparePartsService {
  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════
  // Spare Part Categories
  // ═══════════════════════════════════════════════════════════════

  async createCategory(dto: {
    businessId: string;
    parentId?: string;
    code: string;
    name: string;
    nameEn?: string;
    description?: string;
  }) {
    const existing = await this.prisma.spare_part_categories.findFirst({
      where: { business_id: dto.businessId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Category with code ${dto.code} already exists`);
    }

    return this.prisma.spare_part_categories.create({
      data: {
        business_id: dto.businessId,
        parent_id: dto.parentId,
        code: dto.code,
        name: dto.name,
        name_en: dto.nameEn,
        description: dto.description,
      },
    });
  }

  async findAllCategories(businessId: string) {
    return this.prisma.spare_part_categories.findMany({
      where: { business_id: businessId, is_active: true },
      include: {
        parent: true,
        children: true,
        _count: { select: { parts: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Spare Parts
  // ═══════════════════════════════════════════════════════════════

  async create(dto: CreateSparePartDto) {
    const existing = await this.prisma.spare_parts.findFirst({
      where: { business_id: dto.businessId, part_code: dto.partCode },
    });

    if (existing) {
      throw new ConflictException(`Part with code ${dto.partCode} already exists`);
    }

    return this.prisma.spare_parts.create({
      data: {
        business_id: dto.businessId,
        category_id: dto.categoryId,
        part_code: dto.partCode,
        name: dto.name,
        name_en: dto.nameEn,
        description: dto.description,
        unit: dto.unit,
        manufacturer: dto.manufacturer,
        model_compatibility: dto.modelCompatibility,
        asset_categories: dto.assetCategories,
        min_stock: dto.minStock || 0,
        max_stock: dto.maxStock,
        reorder_point: dto.reorderPoint || 0,
        unit_cost: dto.unitCost || 0,
        location: dto.location,
        is_critical: dto.isCritical || false,
        lead_time_days: dto.leadTimeDays,
        notes: dto.notes,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(businessId: string, filters?: {
    categoryId?: string;
    isCritical?: boolean;
    lowStock?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { business_id: businessId, is_active: true };

    if (filters?.categoryId) where.category_id = filters.categoryId;
    if (filters?.isCritical !== undefined) where.is_critical = filters.isCritical;
    if (filters?.lowStock) {
      where.current_stock = { lte: this.prisma.spare_parts.fields.reorder_point };
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { name_en: { contains: filters.search, mode: 'insensitive' } },
        { part_code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.spare_parts.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, code: true } },
        },
        skip,
        take: limit,
        orderBy: { part_code: 'asc' },
      }),
      this.prisma.spare_parts.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const part = await this.prisma.spare_parts.findUnique({
      where: { id },
      include: {
        category: true,
        movements: {
          orderBy: { movement_date: 'desc' },
          take: 20,
        },
      },
    });

    if (!part) {
      throw new NotFoundException('Spare part not found');
    }

    return part;
  }

  async update(id: string, dto: UpdateSparePartDto) {
    const existing = await this.prisma.spare_parts.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Spare part not found');
    }

    if (dto.partCode && dto.partCode !== existing.part_code) {
      const duplicate = await this.prisma.spare_parts.findFirst({
        where: {
          business_id: existing.business_id,
          part_code: dto.partCode,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(`Part with code ${dto.partCode} already exists`);
      }
    }

    return this.prisma.spare_parts.update({
      where: { id },
      data: {
        category_id: dto.categoryId,
        part_code: dto.partCode,
        name: dto.name,
        name_en: dto.nameEn,
        description: dto.description,
        unit: dto.unit,
        manufacturer: dto.manufacturer,
        model_compatibility: dto.modelCompatibility,
        asset_categories: dto.assetCategories,
        min_stock: dto.minStock,
        max_stock: dto.maxStock,
        reorder_point: dto.reorderPoint,
        unit_cost: dto.unitCost,
        location: dto.location,
        is_critical: dto.isCritical,
        lead_time_days: dto.leadTimeDays,
        notes: dto.notes,
        is_active: dto.isActive,
      },
      include: {
        category: true,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Stock Movements
  // ═══════════════════════════════════════════════════════════════

  async createMovement(dto: SparePartMovementDto) {
    const part = await this.prisma.spare_parts.findUnique({
      where: { id: dto.partId },
    });

    if (!part) {
      throw new NotFoundException('Spare part not found');
    }

    const currentStock = Number(part.current_stock);
    let newStock: number;

    switch (dto.movementType) {
      case 'receipt':
        newStock = currentStock + dto.quantity;
        break;
      case 'issue':
        if (currentStock < dto.quantity) {
          throw new BadRequestException('Insufficient stock');
        }
        newStock = currentStock - dto.quantity;
        break;
      case 'return':
        newStock = currentStock + dto.quantity;
        break;
      case 'adjustment':
        newStock = dto.quantity; // Direct adjustment to new quantity
        break;
      default:
        throw new BadRequestException('Invalid movement type');
    }

    const totalCost = dto.unitCost ? dto.quantity * dto.unitCost : null;

    // Create movement record
    const movement = await this.prisma.spare_part_movements.create({
      data: {
        part_id: dto.partId,
        movement_type: dto.movementType,
        quantity: dto.quantity,
        unit_cost: dto.unitCost,
        total_cost: totalCost,
        reference_type: dto.referenceType,
        reference_id: dto.referenceId,
        from_location: dto.fromLocation,
        to_location: dto.toLocation,
        notes: dto.notes,
        created_by: dto.createdBy,
      },
    });

    // Update stock
    await this.prisma.spare_parts.update({
      where: { id: dto.partId },
      data: {
        current_stock: newStock,
        unit_cost: dto.unitCost || part.unit_cost,
      },
    });

    return {
      movement,
      previousStock: currentStock,
      newStock,
    };
  }

  async getMovements(partId: string, filters?: {
    movementType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { part_id: partId };

    if (filters?.movementType) where.movement_type = filters.movementType;
    if (filters?.startDate || filters?.endDate) {
      where.movement_date = {};
      if (filters.startDate) where.movement_date.gte = new Date(filters.startDate);
      if (filters.endDate) where.movement_date.lte = new Date(filters.endDate);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.spare_part_movements.findMany({
        where,
        skip,
        take: limit,
        orderBy: { movement_date: 'desc' },
      }),
      this.prisma.spare_part_movements.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Reports & Statistics
  // ═══════════════════════════════════════════════════════════════

  async getLowStockParts(businessId: string) {
    return this.prisma.$queryRaw`
      SELECT * FROM spare_parts 
      WHERE business_id = ${businessId}::uuid 
      AND is_active = true 
      AND current_stock <= reorder_point
      ORDER BY is_critical DESC, current_stock ASC
    `;
  }

  async getStockValue(businessId: string) {
    const result = await this.prisma.spare_parts.aggregate({
      where: { business_id: businessId, is_active: true },
      _sum: {
        current_stock: true,
      },
    });

    const parts = await this.prisma.spare_parts.findMany({
      where: { business_id: businessId, is_active: true },
      select: { current_stock: true, unit_cost: true },
    });

    const totalValue = parts.reduce((sum, p) => {
      return sum + (Number(p.current_stock) * Number(p.unit_cost));
    }, 0);

    return {
      totalParts: parts.length,
      totalQuantity: result._sum.current_stock || 0,
      totalValue,
    };
  }

  async getStatistics(businessId: string) {
    const [
      totalParts,
      criticalParts,
      lowStockParts,
      stockValue,
      recentMovements,
    ] = await Promise.all([
      this.prisma.spare_parts.count({
        where: { business_id: businessId, is_active: true },
      }),
      this.prisma.spare_parts.count({
        where: { business_id: businessId, is_active: true, is_critical: true },
      }),
      this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM spare_parts 
        WHERE business_id = ${businessId}::uuid 
        AND is_active = true 
        AND current_stock <= reorder_point
      `,
      this.getStockValue(businessId),
      this.prisma.spare_part_movements.findMany({
        where: {
          part: { business_id: businessId },
        },
        include: {
          part: { select: { id: true, name: true, part_code: true } },
        },
        orderBy: { movement_date: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalParts,
      criticalParts,
      lowStockParts: Number(lowStockParts[0]?.count || 0),
      stockValue,
      recentMovements,
    };
  }
}
