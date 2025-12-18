import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface RunDepreciationDto {
  businessId: string;
  periodEnd: string;
  createdBy?: string;
}

export interface DepreciationResult {
  assetId: string;
  assetNumber: string;
  assetName: string;
  depreciationAmount: number;
  accumulatedBefore: number;
  accumulatedAfter: number;
  bookValueBefore: number;
  bookValueAfter: number;
}

@Injectable()
export class DepreciationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate monthly depreciation for an asset using straight-line method
   */
  private calculateStraightLineDepreciation(
    acquisitionCost: number,
    salvageValue: number,
    usefulLifeYears: number,
  ): number {
    const depreciableAmount = acquisitionCost - salvageValue;
    const monthlyDepreciation = depreciableAmount / (usefulLifeYears * 12);
    return Math.round(monthlyDepreciation * 100) / 100;
  }

  /**
   * Calculate depreciation using declining balance method
   */
  private calculateDecliningBalanceDepreciation(
    bookValue: number,
    salvageValue: number,
    usefulLifeYears: number,
    rate: number = 2, // Double declining by default
  ): number {
    const annualRate = (1 / usefulLifeYears) * rate;
    const monthlyRate = annualRate / 12;
    const depreciation = bookValue * monthlyRate;
    
    // Don't depreciate below salvage value
    if (bookValue - depreciation < salvageValue) {
      return Math.max(0, bookValue - salvageValue);
    }
    
    return Math.round(depreciation * 100) / 100;
  }

  /**
   * Run depreciation for all active assets in a business
   */
  async runDepreciation(dto: RunDepreciationDto): Promise<{
    processed: number;
    skipped: number;
    totalDepreciation: number;
    results: DepreciationResult[];
  }> {
    const periodEnd = new Date(dto.periodEnd);
    const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);

    // Get all active assets that need depreciation
    const assets = await this.prisma.assets.findMany({
      where: {
        business_id: dto.businessId,
        status: 'active',
        is_deleted: false,
        book_value: { gt: 0 },
      },
    });

    const results: DepreciationResult[] = [];
    let processed = 0;
    let skipped = 0;
    let totalDepreciation = 0;

    for (const asset of assets) {
      // Check if depreciation already exists for this period
      const existingEntry = await this.prisma.asset_depreciation_entries.findFirst({
        where: {
          asset_id: asset.id,
          period_end: periodEnd,
        },
      });

      if (existingEntry) {
        skipped++;
        continue;
      }

      const acquisitionCost = Number(asset.acquisition_cost);
      const salvageValue = Number(asset.salvage_value);
      const bookValue = Number(asset.book_value);
      const accumulatedDepreciation = Number(asset.accumulated_depreciation);

      // Skip if already fully depreciated
      if (bookValue <= salvageValue) {
        skipped++;
        continue;
      }

      // Calculate depreciation based on method
      let depreciationAmount: number;
      
      switch (asset.depreciation_method) {
        case 'declining_balance':
          depreciationAmount = this.calculateDecliningBalanceDepreciation(
            bookValue,
            salvageValue,
            asset.useful_life_years,
          );
          break;
        case 'straight_line':
        default:
          depreciationAmount = this.calculateStraightLineDepreciation(
            acquisitionCost,
            salvageValue,
            asset.useful_life_years,
          );
          break;
      }

      // Ensure we don't depreciate below salvage value
      if (bookValue - depreciationAmount < salvageValue) {
        depreciationAmount = bookValue - salvageValue;
      }

      if (depreciationAmount <= 0) {
        skipped++;
        continue;
      }

      const newAccumulated = accumulatedDepreciation + depreciationAmount;
      const newBookValue = bookValue - depreciationAmount;

      // Create depreciation entry
      await this.prisma.asset_depreciation_entries.create({
        data: {
          asset_id: asset.id,
          period_start: periodStart,
          period_end: periodEnd,
          depreciation_amount: depreciationAmount,
          accumulated_before: accumulatedDepreciation,
          accumulated_after: newAccumulated,
          book_value_before: bookValue,
          book_value_after: newBookValue,
          status: 'draft',
  
        },
      });

      // Update asset
      await this.prisma.assets.update({
        where: { id: asset.id },
        data: {
          accumulated_depreciation: newAccumulated,
          book_value: newBookValue,
          last_depreciation_date: periodEnd,
        },
      });

      results.push({
        assetId: asset.id,
        assetNumber: asset.asset_number,
        assetName: asset.name,
        depreciationAmount,
        accumulatedBefore: accumulatedDepreciation,
        accumulatedAfter: newAccumulated,
        bookValueBefore: bookValue,
        bookValueAfter: newBookValue,
      });

      processed++;
      totalDepreciation += depreciationAmount;
    }

    return {
      processed,
      skipped,
      totalDepreciation: Math.round(totalDepreciation * 100) / 100,
      results,
    };
  }

  /**
   * Get depreciation entries for a specific period
   */
  async getByPeriod(businessId: string, periodEnd: string) {
    const period = new Date(periodEnd);

    return this.prisma.asset_depreciation_entries.findMany({
      where: {
        asset: {
          business_id: businessId,
        },
        period_end: period,
      },
      include: {
        asset: {
          select: {
            id: true,
            asset_number: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        asset: {
          asset_number: 'asc',
        },
      },
    });
  }

  /**
   * Post depreciation entries (create journal entries)
   */
  async postDepreciation(businessId: string, periodEnd: string, createdBy?: string) {
    const period = new Date(periodEnd);

    const entries = await this.prisma.asset_depreciation_entries.findMany({
      where: {
        asset: {
          business_id: businessId,
        },
        period_end: period,
        status: 'draft',
      },
    });

    if (entries.length === 0) {
      throw new BadRequestException('No draft depreciation entries found for this period');
    }

    // Update all entries to posted
    await this.prisma.asset_depreciation_entries.updateMany({
      where: {
        id: { in: entries.map(e => e.id) },
      },
      data: {
        status: 'posted',
      },
    });

    // Here you would typically create journal entries in the accounting system
    // This would be done via API call to the parent system

    return {
      posted: entries.length,
      totalAmount: entries.reduce((sum, e) => sum + Number(e.depreciation_amount), 0),
    };
  }

  /**
   * Reverse depreciation for a specific period
   */
  async reverseDepreciation(businessId: string, periodEnd: string, createdBy?: string) {
    const period = new Date(periodEnd);

    const entries = await this.prisma.asset_depreciation_entries.findMany({
      where: {
        asset: {
          business_id: businessId,
        },
        period_end: period,
      },
      include: {
        asset: true,
      },
    });

    if (entries.length === 0) {
      throw new NotFoundException('No depreciation entries found for this period');
    }

    // Reverse each entry
    for (const entry of entries) {
      // Restore asset values
      await this.prisma.assets.update({
        where: { id: entry.asset_id },
        data: {
          accumulated_depreciation: entry.accumulated_before,
          book_value: entry.book_value_before,
        },
      });

      // Delete the entry
      await this.prisma.asset_depreciation_entries.delete({
        where: { id: entry.id },
      });
    }

    return {
      reversed: entries.length,
    };
  }

  /**
   * Get depreciation summary by category
   */
  async getSummaryByCategory(businessId: string, periodEnd: string) {
    const period = new Date(periodEnd);

    const entries = await this.prisma.asset_depreciation_entries.findMany({
      where: {
        asset: {
          business_id: businessId,
        },
        period_end: period,
      },
      include: {
        asset: {
          include: {
            category: true,
          },
        },
      },
    });

    // Group by category
    const summary = entries.reduce((acc, entry) => {
      const categoryId = entry.asset.category_id;
      const categoryName = entry.asset.category.name;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          assetCount: 0,
          totalDepreciation: 0,
          totalAccumulated: 0,
          totalBookValue: 0,
        };
      }

      acc[categoryId].assetCount++;
      acc[categoryId].totalDepreciation += Number(entry.depreciation_amount);
      acc[categoryId].totalAccumulated += Number(entry.accumulated_after);
      acc[categoryId].totalBookValue += Number(entry.book_value_after);

      return acc;
    }, {} as Record<string, any>);

    return Object.values(summary);
  }
}
