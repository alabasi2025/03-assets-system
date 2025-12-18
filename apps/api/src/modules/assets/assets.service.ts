import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto, AssetQueryDto, DisposeAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssetDto) {
    // Validate category exists
    const category = await this.prisma.asset_categories.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Asset category not found');
    }

    // Check for duplicate asset number
    const existing = await this.prisma.assets.findFirst({
      where: {
        business_id: dto.businessId,
        asset_number: dto.assetNumber,
      },
    });

    if (existing) {
      throw new ConflictException(`Asset with number ${dto.assetNumber} already exists`);
    }

    // Calculate initial book value
    const bookValue = dto.acquisitionCost;

    const asset = await this.prisma.assets.create({
      data: {
        business_id: dto.businessId,
        category_id: dto.categoryId,
        asset_number: dto.assetNumber,
        barcode: dto.barcode,
        name: dto.name,
        name_en: dto.nameEn,
        description: dto.description,
        manufacturer: dto.manufacturer,
        model: dto.model,
        serial_number: dto.serialNumber,
        specifications: dto.specifications,
        station_id: dto.stationId,
        location: dto.location,
        location_lat: dto.locationLat,
        location_lng: dto.locationLng,
        custodian_id: dto.custodianId,
        acquisition_date: new Date(dto.acquisitionDate),
        acquisition_cost: dto.acquisitionCost,
        acquisition_method: dto.acquisitionMethod || 'purchase',
        supplier_id: dto.supplierId,
        invoice_number: dto.invoiceNumber,
        depreciation_method: dto.depreciationMethod || category.depreciation_method,
        useful_life_years: dto.usefulLifeYears || category.useful_life_years,
        salvage_value: dto.salvageValue || 0,
        book_value: bookValue,
        warranty_start: dto.warrantyStart ? new Date(dto.warrantyStart) : null,
        warranty_end: dto.warrantyEnd ? new Date(dto.warrantyEnd) : null,
        warranty_provider: dto.warrantyProvider,
        warranty_terms: dto.warrantyTerms,
        status: dto.status || 'active',
        condition: dto.condition || 'good',
      },
      include: {
        category: true,
      },
    });

    // Create acquisition movement record
    await this.prisma.asset_movements.create({
      data: {
        asset_id: asset.id,
        movement_type: 'acquisition',
        movement_date: new Date(dto.acquisitionDate),
        to_location: dto.location,
        to_custodian_id: dto.custodianId,
        value_after: dto.acquisitionCost,
        reason: 'Initial acquisition',
      },
    });

    return asset;
  }

  async findAll(query: AssetQueryDto) {
    const where: any = {
      is_deleted: false,
    };

    if (query.businessId) {
      where.business_id = query.businessId;
    }

    if (query.categoryId) {
      where.category_id = query.categoryId;
    }

    if (query.stationId) {
      where.station_id = query.stationId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.condition) {
      where.condition = query.condition;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { name_en: { contains: query.search, mode: 'insensitive' } },
        { asset_number: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
        { serial_number: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.assets.findMany({
        where,
        include: {
          category: true,

        },
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'created_at']: query.sortOrder || 'desc' },
      }),
      this.prisma.assets.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const asset = await this.prisma.assets.findUnique({
      where: { id },
      include: {
        category: true,
        depreciation_entries: {
          orderBy: { period_end: 'desc' },
          take: 12,
        },
        movements: {
          orderBy: { movement_date: 'desc' },
          take: 10,
        },
        maintenance_schedules: {
          where: { status: { in: ['scheduled', 'overdue'] } },
          orderBy: { scheduled_date: 'asc' },
          take: 5,
        },
        maintenance_records: {
          orderBy: { performed_date: 'desc' },
          take: 5,
        },
      },
    });

    if (!asset || asset.is_deleted) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(id: string, dto: UpdateAssetDto) {
    const existing = await this.prisma.assets.findUnique({
      where: { id },
    });

    if (!existing || existing.is_deleted) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Check for duplicate asset number if changing
    if (dto.assetNumber && dto.assetNumber !== existing.asset_number) {
      const duplicate = await this.prisma.assets.findFirst({
        where: {
          business_id: existing.business_id,
          asset_number: dto.assetNumber,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(`Asset with number ${dto.assetNumber} already exists`);
      }
    }

    // Validate category if changing
    if (dto.categoryId && dto.categoryId !== existing.category_id) {
      const category = await this.prisma.asset_categories.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Asset category not found');
      }
    }

    return this.prisma.assets.update({
      where: { id },
      data: {
        category_id: dto.categoryId,
        asset_number: dto.assetNumber,
        barcode: dto.barcode,
        name: dto.name,
        name_en: dto.nameEn,
        description: dto.description,
        manufacturer: dto.manufacturer,
        model: dto.model,
        serial_number: dto.serialNumber,
        specifications: dto.specifications,
        station_id: dto.stationId,
        location: dto.location,
        location_lat: dto.locationLat,
        location_lng: dto.locationLng,
        custodian_id: dto.custodianId,
        acquisition_date: dto.acquisitionDate ? new Date(dto.acquisitionDate) : undefined,
        acquisition_cost: dto.acquisitionCost,
        acquisition_method: dto.acquisitionMethod,
        supplier_id: dto.supplierId,
        invoice_number: dto.invoiceNumber,
        depreciation_method: dto.depreciationMethod,
        useful_life_years: dto.usefulLifeYears,
        salvage_value: dto.salvageValue,
        warranty_start: dto.warrantyStart ? new Date(dto.warrantyStart) : undefined,
        warranty_end: dto.warrantyEnd ? new Date(dto.warrantyEnd) : undefined,
        warranty_provider: dto.warrantyProvider,
        warranty_terms: dto.warrantyTerms,
        status: dto.status,
        condition: dto.condition,

      },
      include: {
        category: true,
      },
    });
  }

  async dispose(id: string, dto: DisposeAssetDto) {
    const asset = await this.prisma.assets.findUnique({
      where: { id },
    });

    if (!asset || asset.is_deleted) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    if (asset.status === 'disposed') {
      throw new BadRequestException('Asset is already disposed');
    }

    const disposalValue = dto.disposalValue || 0;
    const bookValue = Number(asset.book_value);
    const gainLoss = disposalValue - bookValue;

    // Update asset status
    const updatedAsset = await this.prisma.assets.update({
      where: { id },
      data: {
        status: 'disposed',
        is_deleted: true,
      },
    });

    // Create disposal movement
    await this.prisma.asset_movements.create({
      data: {
        asset_id: id,
        movement_type: 'disposal',
        movement_date: new Date(dto.disposalDate),
        from_location: asset.location,
        value_before: asset.book_value,
        value_after: disposalValue,
        reason: dto.reason || `Disposal by ${dto.disposalMethod}`,
        approved_by: dto.approvedBy,
      },
    });

    return {
      asset: updatedAsset,
      disposal: {
        method: dto.disposalMethod,
        date: dto.disposalDate,
        bookValue,
        disposalValue,
        gainLoss,
      },
    };
  }

  async getDepreciationSchedule(id: string) {
    const asset = await this.prisma.assets.findUnique({
      where: { id },
      include: {
        depreciation_entries: {
          orderBy: { period_end: 'asc' },
        },
      },
    });

    if (!asset || asset.is_deleted) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return {
      asset: {
        id: asset.id,
        name: asset.name,
        assetNumber: asset.asset_number,
        acquisitionCost: asset.acquisition_cost,
        salvageValue: asset.salvage_value,
        usefulLifeYears: asset.useful_life_years,
        depreciationMethod: asset.depreciation_method,
        accumulatedDepreciation: asset.accumulated_depreciation,
        bookValue: asset.book_value,
      },
      entries: asset.depreciation_entries,
    };
  }

  async getStatistics(businessId: string) {
    const [
      totalAssets,
      activeAssets,
      disposedAssets,
      totalValue,
      totalBookValue,
      byCategory,
      byStatus,
      byCondition,
    ] = await Promise.all([
      this.prisma.assets.count({
        where: { business_id: businessId },
      }),
      this.prisma.assets.count({
        where: { business_id: businessId, status: 'active', is_deleted: false },
      }),
      this.prisma.assets.count({
        where: { business_id: businessId, status: 'disposed' },
      }),
      this.prisma.assets.aggregate({
        where: { business_id: businessId, is_deleted: false },
        _sum: { acquisition_cost: true },
      }),
      this.prisma.assets.aggregate({
        where: { business_id: businessId, is_deleted: false },
        _sum: { book_value: true },
      }),
      this.prisma.assets.groupBy({
        by: ['category_id'],
        where: { business_id: businessId, is_deleted: false },
        _count: true,
        _sum: { book_value: true },
      }),
      this.prisma.assets.groupBy({
        by: ['status'],
        where: { business_id: businessId },
        _count: true,
      }),
      this.prisma.assets.groupBy({
        by: ['condition'],
        where: { business_id: businessId, is_deleted: false },
        _count: true,
      }),
    ]);

    return {
      summary: {
        totalAssets,
        activeAssets,
        disposedAssets,
        totalAcquisitionValue: totalValue._sum.acquisition_cost || 0,
        totalBookValue: totalBookValue._sum.book_value || 0,
        totalDepreciation: 
          Number(totalValue._sum.acquisition_cost || 0) - 
          Number(totalBookValue._sum.book_value || 0),
      },
      byCategory,
      byStatus,
      byCondition,
    };
  }

  async softDelete(id: string, deletedBy?: string) {
    const asset = await this.prisma.assets.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return this.prisma.assets.update({
      where: { id },
      data: {
        is_deleted: true,
      },
    });
  }
}
