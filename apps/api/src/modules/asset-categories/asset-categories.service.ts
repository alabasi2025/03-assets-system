import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { 
  CreateAssetCategoryDto, 
  UpdateAssetCategoryDto, 
  AssetCategoryQueryDto 
} from './dto/asset-category.dto';

@Injectable()
export class AssetCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssetCategoryDto) {
    // Check for duplicate code within the same business
    const existing = await this.prisma.asset_categories.findFirst({
      where: {
        business_id: dto.businessId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException(`Category with code ${dto.code} already exists`);
    }

    // Validate parent if provided
    if (dto.parentId) {
      const parent = await this.prisma.asset_categories.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent category not found`);
      }
    }

    return this.prisma.asset_categories.create({
      data: {
        business_id: dto.businessId,
        parent_id: dto.parentId,
        code: dto.code,
        name: dto.name,
        name_en: dto.nameEn,
        description: dto.description,
        depreciation_method: dto.depreciationMethod || 'straight_line',
        useful_life_years: dto.usefulLifeYears || 5,
        salvage_rate: dto.salvageRate !== undefined ? dto.salvageRate : 0,
        asset_account_id: dto.assetAccountId,
        depreciation_account_id: dto.depreciationAccountId,
        expense_account_id: dto.expenseAccountId,
        is_active: dto.isActive ?? true,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(query: AssetCategoryQueryDto) {
    const where: any = {};

    if (query.businessId) {
      where.business_id = query.businessId;
    }

    if (query.parentId !== undefined) {
      where.parent_id = query.parentId || null;
    }

    if (query.isActive !== undefined) {
      where.is_active = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { name_en: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.asset_categories.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.asset_categories.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            _count: { select: { assets: true } },
          },
        },
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findTree(businessId: string) {
    // Get all root categories (no parent)
    const rootCategories = await this.prisma.asset_categories.findMany({
      where: {
        business_id: businessId,
        parent_id: null,
        is_active: true,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                _count: { select: { assets: true } },
              },
            },
            _count: { select: { assets: true } },
          },
        },
        _count: { select: { assets: true } },
      },
      orderBy: { code: 'asc' },
    });

    return rootCategories;
  }

  async update(id: string, dto: UpdateAssetCategoryDto) {
    const existing = await this.prisma.asset_categories.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check for duplicate code if changing
    if (dto.code && dto.code !== existing.code) {
      const duplicate = await this.prisma.asset_categories.findFirst({
        where: {
          business_id: existing.business_id,
          code: dto.code,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(`Category with code ${dto.code} already exists`);
      }
    }

    // Validate parent if changing
    if (dto.parentId && dto.parentId !== existing.parent_id) {
      // Prevent circular reference
      if (dto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }

      const parent = await this.prisma.asset_categories.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.asset_categories.update({
      where: { id },
      data: {
        parent_id: dto.parentId,
        code: dto.code,
        name: dto.name,
        name_en: dto.nameEn,
        description: dto.description,
        depreciation_method: dto.depreciationMethod,
        useful_life_years: dto.usefulLifeYears,
        salvage_rate: dto.salvageRate !== undefined ? dto.salvageRate : undefined,
        asset_account_id: dto.assetAccountId,
        depreciation_account_id: dto.depreciationAccountId,
        expense_account_id: dto.expenseAccountId,
        is_active: dto.isActive,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.asset_categories.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true, children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check for related assets
    if (category._count.assets > 0) {
      throw new ConflictException(
        `Cannot delete category with ${category._count.assets} assets. Move or delete assets first.`
      );
    }

    // Check for child categories
    if (category._count.children > 0) {
      throw new ConflictException(
        `Cannot delete category with ${category._count.children} subcategories. Delete subcategories first.`
      );
    }

    return this.prisma.asset_categories.delete({
      where: { id },
    });
  }
}
