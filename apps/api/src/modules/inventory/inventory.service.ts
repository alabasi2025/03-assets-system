import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  ApproveInventoryDto,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  BulkCheckItemsDto,
  InventoryQueryDto,
  InventoryItemQueryDto,
  InventoryStatus,
  ItemCondition
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════
  // Inventory CRUD
  // ═══════════════════════════════════════════════════════════════

  async create(dto: CreateInventoryDto) {
    return this.prisma.asset_inventory.create({
      data: {
        ...dto,
        inventory_date: new Date(dto.inventory_date),
        status: InventoryStatus.DRAFT
      },
      include: {
        station: true,
        category: true
      }
    });
  }

  async findAll(query: InventoryQueryDto) {
    const { business_id, status, station_id, category_id, from_date, to_date, page = 1, limit = 10 } = query;
    
    const where: any = { is_deleted: false };
    
    if (business_id) where.business_id = business_id;
    if (status) where.status = status;
    if (station_id) where.station_id = station_id;
    if (category_id) where.category_id = category_id;
    if (from_date || to_date) {
      where.inventory_date = {};
      if (from_date) where.inventory_date.gte = new Date(from_date);
      if (to_date) where.inventory_date.lte = new Date(to_date);
    }

    const [data, total] = await Promise.all([
      this.prisma.asset_inventory.findMany({
        where,
        include: {
          station: true,
          category: true,
          _count: { select: { items: true } }
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.asset_inventory.count({ where })
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
    const inventory = await this.prisma.asset_inventory.findFirst({
      where: { id, is_deleted: false },
      include: {
        station: true,
        category: true,
        items: {
          where: { is_deleted: false },
          include: { asset: true }
        }
      }
    });

    if (!inventory) {
      throw new NotFoundException('الجرد غير موجود');
    }

    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto) {
    const inventory = await this.findOne(id);

    if (inventory.status === InventoryStatus.APPROVED) {
      throw new BadRequestException('لا يمكن تعديل جرد معتمد');
    }

    const updateData: any = { ...dto };
    if (dto.inventory_date) {
      updateData.inventory_date = new Date(dto.inventory_date);
    }

    return this.prisma.asset_inventory.update({
      where: { id },
      data: updateData,
      include: {
        station: true,
        category: true
      }
    });
  }

  async remove(id: string) {
    const inventory = await this.findOne(id);

    if (inventory.status === InventoryStatus.APPROVED) {
      throw new BadRequestException('لا يمكن حذف جرد معتمد');
    }

    return this.prisma.asset_inventory.update({
      where: { id },
      data: { is_deleted: true }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Inventory Workflow
  // ═══════════════════════════════════════════════════════════════

  async startInventory(id: string) {
    const inventory = await this.findOne(id);

    if (inventory.status !== InventoryStatus.DRAFT) {
      throw new BadRequestException('يمكن بدء الجرد من حالة المسودة فقط');
    }

    return this.prisma.asset_inventory.update({
      where: { id },
      data: { status: InventoryStatus.IN_PROGRESS }
    });
  }

  async completeInventory(id: string) {
    const inventory = await this.findOne(id);

    if (inventory.status !== InventoryStatus.IN_PROGRESS) {
      throw new BadRequestException('يمكن إكمال الجرد من حالة قيد التنفيذ فقط');
    }

    // حساب الإحصائيات
    const stats = await this.calculateStats(id);

    return this.prisma.asset_inventory.update({
      where: { id },
      data: {
        status: InventoryStatus.COMPLETED,
        ...stats
      }
    });
  }

  async approveInventory(id: string, dto: ApproveInventoryDto) {
    const inventory = await this.findOne(id);

    if (inventory.status !== InventoryStatus.COMPLETED) {
      throw new BadRequestException('يمكن اعتماد الجرد من حالة مكتمل فقط');
    }

    return this.prisma.asset_inventory.update({
      where: { id },
      data: {
        status: InventoryStatus.APPROVED,
        approved_by: dto.approved_by,
        approved_at: new Date()
      }
    });
  }

  async calculateStats(inventoryId: string) {
    const items = await this.prisma.asset_inventory_items.findMany({
      where: { inventory_id: inventoryId, is_deleted: false }
    });

    const total_assets = items.length;
    const found_assets = items.filter(i => i.condition !== ItemCondition.MISSING).length;
    const missing_assets = items.filter(i => i.condition === ItemCondition.MISSING).length;
    const damaged_assets = items.filter(i => i.condition === ItemCondition.DAMAGED).length;

    return { total_assets, found_assets, missing_assets, damaged_assets };
  }

  // ═══════════════════════════════════════════════════════════════
  // Inventory Items
  // ═══════════════════════════════════════════════════════════════

  async addItem(dto: CreateInventoryItemDto) {
    const inventory = await this.findOne(dto.inventory_id);

    if (inventory.status === InventoryStatus.APPROVED) {
      throw new BadRequestException('لا يمكن إضافة بنود لجرد معتمد');
    }

    // التحقق من عدم وجود الأصل مسبقاً
    const existing = await this.prisma.asset_inventory_items.findFirst({
      where: {
        inventory_id: dto.inventory_id,
        asset_id: dto.asset_id,
        is_deleted: false
      }
    });

    if (existing) {
      throw new BadRequestException('الأصل موجود مسبقاً في هذا الجرد');
    }

    return this.prisma.asset_inventory_items.create({
      data: {
        ...dto,
        checked_at: dto.checked_by ? new Date() : null
      },
      include: { asset: true }
    });
  }

  async updateItem(id: string, dto: UpdateInventoryItemDto) {
    const item = await this.prisma.asset_inventory_items.findFirst({
      where: { id, is_deleted: false },
      include: { inventory: true }
    });

    if (!item) {
      throw new NotFoundException('بند الجرد غير موجود');
    }

    if (item.inventory.status === InventoryStatus.APPROVED) {
      throw new BadRequestException('لا يمكن تعديل بنود جرد معتمد');
    }

    const updateData: any = { ...dto };
    if (dto.checked_by) {
      updateData.checked_at = new Date();
    }

    return this.prisma.asset_inventory_items.update({
      where: { id },
      data: updateData,
      include: { asset: true }
    });
  }

  async removeItem(id: string) {
    const item = await this.prisma.asset_inventory_items.findFirst({
      where: { id, is_deleted: false },
      include: { inventory: true }
    });

    if (!item) {
      throw new NotFoundException('بند الجرد غير موجود');
    }

    if (item.inventory.status === InventoryStatus.APPROVED) {
      throw new BadRequestException('لا يمكن حذف بنود جرد معتمد');
    }

    return this.prisma.asset_inventory_items.update({
      where: { id },
      data: { is_deleted: true }
    });
  }

  async getItems(inventoryId: string, query: InventoryItemQueryDto) {
    const where: any = { inventory_id: inventoryId, is_deleted: false };

    if (query.condition) where.condition = query.condition;
    if (query.checked === 'true') where.checked_at = { not: null };
    if (query.checked === 'false') where.checked_at = null;

    return this.prisma.asset_inventory_items.findMany({
      where,
      include: { asset: true },
      orderBy: { created_at: 'asc' }
    });
  }

  async bulkCheckItems(dto: BulkCheckItemsDto) {
    const { item_ids, condition, actual_location, checked_by } = dto;

    return this.prisma.asset_inventory_items.updateMany({
      where: { id: { in: item_ids }, is_deleted: false },
      data: {
        condition,
        actual_location,
        checked_by,
        checked_at: new Date()
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Auto-populate from assets
  // ═══════════════════════════════════════════════════════════════

  async populateFromAssets(inventoryId: string) {
    const inventory = await this.findOne(inventoryId);

    if (inventory.status !== InventoryStatus.DRAFT) {
      throw new BadRequestException('يمكن تعبئة الأصول في حالة المسودة فقط');
    }

    const where: any = { is_deleted: false, status: 'active' };
    if (inventory.station_id) where.station_id = inventory.station_id;
    if (inventory.category_id) where.category_id = inventory.category_id;

    const assets = await this.prisma.assets.findMany({ where });

    // إضافة الأصول التي لم تُضف مسبقاً
    const existingAssetIds = inventory.items.map(i => i.asset_id);
    const newAssets = assets.filter(a => !existingAssetIds.includes(a.id));

    if (newAssets.length === 0) {
      return { added: 0, message: 'جميع الأصول موجودة مسبقاً' };
    }

    await this.prisma.asset_inventory_items.createMany({
      data: newAssets.map(asset => ({
        inventory_id: inventoryId,
        asset_id: asset.id,
        expected_location: asset.location,
        condition: ItemCondition.GOOD
      }))
    });

    return { added: newAssets.length, message: `تمت إضافة ${newAssets.length} أصل` };
  }

  // ═══════════════════════════════════════════════════════════════
  // Statistics
  // ═══════════════════════════════════════════════════════════════

  async getStatistics(businessId?: string) {
    const where: any = { is_deleted: false };
    if (businessId) where.business_id = businessId;

    const [total, byStatus, recent] = await Promise.all([
      this.prisma.asset_inventory.count({ where }),
      this.prisma.asset_inventory.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      this.prisma.asset_inventory.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: 5,
        include: { station: true }
      })
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recent
    };
  }
}
