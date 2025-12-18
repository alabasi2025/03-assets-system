import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssetReportQueryDto, MaintenanceReportQueryDto, CostReportQueryDto } from './dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════
  // تقارير الأصول
  // ═══════════════════════════════════════════════════════════════

  async getDepreciationReport(query: AssetReportQueryDto) {
    const where: any = { is_deleted: false };
    if (query.business_id) where.business_id = query.business_id;
    if (query.category_id) where.category_id = query.category_id;

    const assets = await this.prisma.assets.findMany({
      where,
      include: { category: true },
      orderBy: { created_at: 'desc' }
    });

    const report = assets.map(asset => {
      const acquisitionCost = Number(asset.acquisition_cost) || 0;
      const accumulatedDepreciation = Number(asset.accumulated_depreciation) || 0;
      const bookValue = Number(asset.book_value) || (acquisitionCost - accumulatedDepreciation);
      const depreciationRate = asset.useful_life_years ? (100 / asset.useful_life_years) : 0;

      return {
        asset_number: asset.asset_number,
        asset_name: asset.name,
        category: asset.category?.name,
        acquisition_date: asset.acquisition_date,
        acquisition_cost: acquisitionCost,
        useful_life_years: asset.useful_life_years,
        depreciation_rate: depreciationRate,
        accumulated_depreciation: accumulatedDepreciation,
        book_value: bookValue,
        status: asset.status
      };
    });

    const totals = {
      total_assets: report.length,
      total_acquisition_cost: report.reduce((sum, r) => sum + r.acquisition_cost, 0),
      total_accumulated_depreciation: report.reduce((sum, r) => sum + r.accumulated_depreciation, 0),
      total_book_value: report.reduce((sum, r) => sum + r.book_value, 0)
    };

    return { data: report, totals };
  }

  async getAssetsByLocationReport(query: AssetReportQueryDto) {
    const where: any = { is_deleted: false };
    if (query.business_id) where.business_id = query.business_id;

    const stations = await this.prisma.stations.findMany({
      where: { is_deleted: false, ...(query.business_id && { business_id: query.business_id }) },
      include: {
        generators: { where: { is_deleted: false } },
        _count: { select: { generators: true } }
      }
    });

    const assets = await this.prisma.assets.findMany({
      where,
      include: { category: true }
    });

    const byCategory = await this.prisma.assets.groupBy({
      by: ['category_id'],
      where,
      _count: true,
      _sum: { acquisition_cost: true }
    });

    return {
      stations: stations.map(s => ({
        station_code: s.code,
        station_name: s.name,
        type: s.type,
        status: s.status,
        generators_count: s._count.generators,
        total_capacity_kw: s.total_capacity_kw
      })),
      assets_by_category: byCategory,
      total_assets: assets.length
    };
  }

  async getInventoryReport(query: AssetReportQueryDto) {
    const where: any = { is_deleted: false };
    if (query.business_id) where.business_id = query.business_id;

    const inventories = await this.prisma.asset_inventory.findMany({
      where,
      include: {
        station: true,
        category: true,
        items: { where: { is_deleted: false } }
      },
      orderBy: { created_at: 'desc' }
    });

    return inventories.map(inv => {
      const items = inv.items;
      const matched = items.filter(i => i.condition === 'good' || i.condition === 'fair').length;
      const missing = items.filter(i => i.condition === 'missing').length;
      const damaged = items.filter(i => i.condition === 'damaged' || i.condition === 'poor').length;

      return {
        inventory_number: inv.inventory_number,
        inventory_date: inv.inventory_date,
        station: inv.station?.name,
        category: inv.category?.name,
        status: inv.status,
        total_items: items.length,
        matched,
        missing,
        damaged,
        match_rate: items.length > 0 ? ((matched / items.length) * 100).toFixed(2) + '%' : '0%'
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // تقارير الصيانة
  // ═══════════════════════════════════════════════════════════════

  async getPreventiveMaintenanceReport(query: MaintenanceReportQueryDto) {
    const where: any = {};
    if (query.business_id) where.business_id = query.business_id;

    const plans = await this.prisma.maintenance_plans.findMany({
      where,
      include: { schedules: true }
    });

    const schedules = await this.prisma.maintenance_schedules.findMany({
      where: query.business_id ? { business_id: query.business_id } : {},
      include: { plan: true }
    });

    const completed = schedules.filter(s => s.status === 'completed').length;
    const pending = schedules.filter(s => s.status === 'scheduled').length;
    const overdue = schedules.filter(s => s.status === 'overdue' || (s.due_date < new Date() && s.status !== 'completed')).length;

    return {
      plans: plans.map(p => ({
        plan_name: p.name,
        frequency_type: p.frequency_type,
        frequency_value: p.frequency_value,
        is_active: p.is_active,
        schedules_count: p.schedules.length
      })),
      summary: {
        total_plans: plans.length,
        active_plans: plans.filter(p => p.is_active).length,
        total_schedules: schedules.length,
        completed,
        pending,
        overdue,
        compliance_rate: schedules.length > 0 ? ((completed / schedules.length) * 100).toFixed(2) + '%' : '0%'
      }
    };
  }

  async getEmergencyMaintenanceReport(query: MaintenanceReportQueryDto) {
    const where: any = {};
    if (query.business_id) where.business_id = query.business_id;
    if (query.start_date || query.end_date) {
      where.created_at = {};
      if (query.start_date) where.created_at.gte = new Date(query.start_date);
      if (query.end_date) where.created_at.lte = new Date(query.end_date);
    }

    const requests = await this.prisma.maintenance_requests.findMany({
      where,
      include: { asset: true },
      orderBy: { created_at: 'desc' }
    });

    const byPriority = await this.prisma.maintenance_requests.groupBy({
      by: ['priority'],
      where,
      _count: true
    });

    const byStatus = await this.prisma.maintenance_requests.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    return {
      requests: requests.map(r => ({
        request_number: r.request_number,
        title: r.title,
        asset: r.asset?.name,
        priority: r.priority,
        status: r.status,
        reported_at: r.reported_at,
        created_at: r.created_at
      })),
      summary: {
        total_requests: requests.length,
        by_priority: byPriority.reduce((acc, item) => { acc[item.priority] = item._count; return acc; }, {} as Record<string, number>),
        by_status: byStatus.reduce((acc, item) => { acc[item.status] = item._count; return acc; }, {} as Record<string, number>)
      }
    };
  }

  async getWorkOrdersReport(query: MaintenanceReportQueryDto) {
    const where: any = {};
    if (query.business_id) where.business_id = query.business_id;
    if (query.technician_id) where.assigned_to = query.technician_id;
    if (query.start_date || query.end_date) {
      where.created_at = {};
      if (query.start_date) where.created_at.gte = new Date(query.start_date);
      if (query.end_date) where.created_at.lte = new Date(query.end_date);
    }

    const workOrders = await this.prisma.work_orders.findMany({
      where,
      include: { asset: true, technician: true },
      orderBy: { created_at: 'desc' }
    });

    const byStatus = await this.prisma.work_orders.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    const byType = await this.prisma.work_orders.groupBy({
      by: ['order_type'],
      where,
      _count: true
    });

    return {
      work_orders: workOrders.map(wo => ({
        work_order_number: wo.work_order_number,
        title: wo.title,
        asset: wo.asset?.name,
        technician: wo.technician?.name,
        order_type: wo.order_type,
        priority: wo.priority,
        status: wo.status,
        scheduled_start: wo.scheduled_start,
        actual_start: wo.actual_start,
        actual_end: wo.actual_end,
        estimated_cost: wo.estimated_cost,
        actual_cost: wo.actual_cost
      })),
      summary: {
        total: workOrders.length,
        by_status: byStatus.reduce((acc, item) => { acc[item.status] = item._count; return acc; }, {} as Record<string, number>),
        by_type: byType.reduce((acc, item) => { acc[item.order_type] = item._count; return acc; }, {} as Record<string, number>)
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // تقارير الأداء
  // ═══════════════════════════════════════════════════════════════

  async getTechnicianPerformanceReport(query: MaintenanceReportQueryDto) {
    const where: any = { is_deleted: false };
    if (query.business_id) where.business_id = query.business_id;

    const technicians = await this.prisma.technicians.findMany({
      where,
      include: {
        work_orders: { where: { status: 'completed' } },
        performances: true
      }
    });

    return technicians.map(tech => {
      const completedOrders = tech.work_orders.length;
      const avgRating = tech.performances.length > 0
        ? tech.performances.reduce((sum, p) => sum + Number(p.overall_score), 0) / tech.performances.length
        : Number(tech.rating);

      return {
        technician_code: tech.technician_code,
        name: tech.name,
        skills_level: tech.skills_level,
        is_internal: tech.is_internal,
        total_jobs: tech.total_jobs,
        completed_jobs: tech.completed_jobs,
        completion_rate: tech.total_jobs > 0 ? ((tech.completed_jobs / tech.total_jobs) * 100).toFixed(2) + '%' : '0%',
        rating: avgRating.toFixed(2),
        is_available: tech.is_available
      };
    });
  }

  async getMaintenanceEfficiencyReport(query: MaintenanceReportQueryDto) {
    const where: any = { status: 'completed' };
    if (query.business_id) where.business_id = query.business_id;
    if (query.start_date || query.end_date) {
      where.actual_end = {};
      if (query.start_date) where.actual_end.gte = new Date(query.start_date);
      if (query.end_date) where.actual_end.lte = new Date(query.end_date);
    }

    const workOrders = await this.prisma.work_orders.findMany({
      where,
      select: {
        work_order_number: true,
        title: true,
        order_type: true,
        scheduled_start: true,
        scheduled_end: true,
        actual_start: true,
        actual_end: true
      }
    });

    // حساب MTTR (Mean Time To Repair)
    const repairTimes = workOrders
      .filter(wo => wo.actual_start && wo.actual_end)
      .map(wo => {
        const start = new Date(wo.actual_start!).getTime();
        const end = new Date(wo.actual_end!).getTime();
        return (end - start) / (1000 * 60 * 60); // بالساعات
      });

    const avgRepairTime = repairTimes.length > 0
      ? repairTimes.reduce((sum, t) => sum + t, 0) / repairTimes.length
      : 0;

    // حساب نسبة الالتزام بالجدول
    const onTimeCount = workOrders.filter(wo => {
      if (!wo.scheduled_end || !wo.actual_end) return false;
      return new Date(wo.actual_end) <= new Date(wo.scheduled_end);
    }).length;

    return {
      summary: {
        total_completed: workOrders.length,
        mttr_hours: avgRepairTime.toFixed(2),
        on_time_completion_rate: workOrders.length > 0
          ? ((onTimeCount / workOrders.length) * 100).toFixed(2) + '%'
          : '0%'
      },
      details: workOrders.map(wo => ({
        work_order_number: wo.work_order_number,
        title: wo.title,
        order_type: wo.order_type,
        scheduled_start: wo.scheduled_start,
        scheduled_end: wo.scheduled_end,
        actual_start: wo.actual_start,
        actual_end: wo.actual_end
      }))
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // تقارير التكاليف
  // ═══════════════════════════════════════════════════════════════

  async getMaintenanceCostReport(query: CostReportQueryDto) {
    const where: any = {};
    if (query.business_id) where.business_id = query.business_id;
    if (query.start_date || query.end_date) {
      where.created_at = {};
      if (query.start_date) where.created_at.gte = new Date(query.start_date);
      if (query.end_date) where.created_at.lte = new Date(query.end_date);
    }

    const workOrders = await this.prisma.work_orders.findMany({
      where: { ...where, status: 'completed' },
      include: { asset: true }
    });

    const totalEstimated = workOrders.reduce((sum, wo) => sum + (Number(wo.estimated_cost) || 0), 0);
    const totalActual = workOrders.reduce((sum, wo) => sum + (Number(wo.actual_cost) || 0), 0);

    const byType = workOrders.reduce((acc, wo) => {
      const type = wo.order_type;
      if (!acc[type]) acc[type] = { count: 0, estimated: 0, actual: 0 };
      acc[type].count++;
      acc[type].estimated += Number(wo.estimated_cost) || 0;
      acc[type].actual += Number(wo.actual_cost) || 0;
      return acc;
    }, {} as Record<string, { count: number; estimated: number; actual: number }>);

    return {
      summary: {
        total_work_orders: workOrders.length,
        total_estimated_cost: totalEstimated,
        total_actual_cost: totalActual,
        variance: totalActual - totalEstimated,
        variance_percentage: totalEstimated > 0 ? (((totalActual - totalEstimated) / totalEstimated) * 100).toFixed(2) + '%' : '0%'
      },
      by_type: byType,
      details: workOrders.map(wo => ({
        work_order_number: wo.work_order_number,
        asset: wo.asset?.name,
        order_type: wo.order_type,
        estimated_cost: wo.estimated_cost,
        actual_cost: wo.actual_cost
      }))
    };
  }

  async getSparePartsCostReport(query: CostReportQueryDto) {
    const where: any = { is_active: true };
    if (query.business_id) where.business_id = query.business_id;

    const spareParts = await this.prisma.spare_parts.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });

    const totalValue = spareParts.reduce((sum, sp) => sum + (Number(sp.unit_cost) * sp.current_stock), 0);
    const lowStock = spareParts.filter(sp => sp.current_stock <= sp.reorder_point);

    return {
      summary: {
        total_parts: spareParts.length,
        total_inventory_value: totalValue,
        low_stock_count: lowStock.length
      },
      parts: spareParts.map(sp => ({
        part_code: sp.part_code,
        name: sp.name,
        current_stock: sp.current_stock,
        unit_cost: sp.unit_cost,
        total_value: Number(sp.unit_cost) * sp.current_stock,
        reorder_point: sp.reorder_point,
        is_low_stock: sp.current_stock <= sp.reorder_point
      })),
      low_stock_items: lowStock.map(sp => ({
        part_code: sp.part_code,
        name: sp.name,
        current_stock: sp.current_stock,
        reorder_point: sp.reorder_point,
        shortage: sp.reorder_point - sp.current_stock
      }))
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // لوحة التحكم الشاملة
  // ═══════════════════════════════════════════════════════════════

  async getDashboardSummary(businessId?: string) {
    const where: any = { is_deleted: false };
    if (businessId) where.business_id = businessId;

    const [
      assetsCount,
      stationsCount,
      generatorsCount,
      metersCount,
      openRequests,
      pendingWorkOrders,
      techniciansCount
    ] = await Promise.all([
      this.prisma.assets.count({ where }),
      this.prisma.stations.count({ where }),
      this.prisma.generators.count({ where }),
      this.prisma.meters.count({ where }),
      this.prisma.maintenance_requests.count({ where: { ...where, status: { in: ['new', 'assigned', 'in_progress'] } } }),
      this.prisma.work_orders.count({ where: { status: { in: ['draft', 'assigned', 'in_progress'] } } }),
      this.prisma.technicians.count({ where })
    ]);

    // حساب قطع الغيار منخفضة المخزون بشكل منفصل
    const spareParts = await this.prisma.spare_parts.findMany({
      where: { is_active: true, ...(businessId && { business_id: businessId }) },
      select: { current_stock: true, reorder_point: true }
    });
    const lowStockParts = spareParts.filter(sp => sp.current_stock <= sp.reorder_point).length;

    return {
      assets: { total: assetsCount },
      stations: { total: stationsCount },
      generators: { total: generatorsCount },
      meters: { total: metersCount },
      maintenance: {
        open_requests: openRequests,
        pending_work_orders: pendingWorkOrders
      },
      technicians: { total: techniciansCount },
      inventory: { low_stock_alerts: lowStockParts }
    };
  }
}
