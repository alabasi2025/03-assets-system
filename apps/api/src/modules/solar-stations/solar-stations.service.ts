import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSolarStationDto, UpdateSolarStationDto } from './dto/solar-station.dto';

@Injectable()
export class SolarStationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId?: string) {
    const where: any = { is_deleted: false };
    if (businessId) where.business_id = businessId;

    return this.prisma.solar_stations.findMany({
      where,
      include: {
        _count: { select: { panels: true, inverters: true, batteries: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const station = await this.prisma.solar_stations.findUnique({
      where: { id },
      include: {
        panels: true,
        inverters: { include: { readings: { take: 5, orderBy: { reading_time: 'desc' } } } },
        batteries: { include: { readings: { take: 5, orderBy: { reading_time: 'desc' } } } }
      }
    });
    if (!station || station.is_deleted) throw new NotFoundException('Solar station not found');
    return station;
  }

  async create(dto: CreateSolarStationDto) {
    return this.prisma.solar_stations.create({
      data: {
        business_id: dto.business_id,
        code: dto.code,
        name: dto.name,
        name_en: dto.name_en,
        location_lat: dto.location_lat,
        location_lng: dto.location_lng,
        address: dto.address,
        total_capacity_kw: dto.total_capacity_kw,
        panels_count: dto.panels_count || 0,
        inverters_count: dto.inverters_count || 0,
        installation_date: dto.installation_date ? new Date(dto.installation_date) : null,
        status: dto.status || 'active',
        description: dto.description
      }
    });
  }

  async update(id: string, dto: UpdateSolarStationDto) {
    await this.findOne(id);
    return this.prisma.solar_stations.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.solar_stations.update({ where: { id }, data: { is_deleted: true } });
  }

  async getPanels(stationId: string) {
    return this.prisma.solar_panels.findMany({
      where: { solar_station_id: stationId },
      orderBy: { code: 'asc' }
    });
  }

  async getInverters(stationId: string) {
    return this.prisma.inverters.findMany({
      where: { solar_station_id: stationId },
      include: {
        panels: { include: { panel: true } },
        readings: { take: 10, orderBy: { reading_time: 'desc' } }
      },
      orderBy: { code: 'asc' }
    });
  }

  async getStats(stationId: string) {
    const station = await this.findOne(stationId);
    
    const panels = await this.prisma.solar_panels.findMany({
      where: { solar_station_id: stationId }
    });

    const inverters = await this.prisma.inverters.findMany({
      where: { solar_station_id: stationId }
    });

    const totalPanelCapacity = panels.reduce((sum, p) => sum + (Number(p.capacity_watt) || 0), 0);
    const totalInverterCapacity = inverters.reduce((sum, i) => sum + (Number(i.capacity_kw) || 0), 0);

    return {
      station,
      stats: {
        total_panels: panels.length,
        active_panels: panels.filter(p => p.status === 'active').length,
        total_panel_capacity_watt: totalPanelCapacity,
        total_inverters: inverters.length,
        active_inverters: inverters.filter(i => i.status === 'active').length,
        total_inverter_capacity_kw: totalInverterCapacity
      }
    };
  }
}
