import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStationDto, UpdateStationDto } from './dto/station.dto';

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId?: string) {
    const where: any = { is_deleted: false };
    if (businessId) {
      where.business_id = businessId;
    }

    return this.prisma.stations.findMany({
      where,
      include: {
        generators: {
          where: { is_deleted: false },
          select: { id: true, code: true, name: true, status: true, capacity_kw: true }
        },
        _count: {
          select: {
            generators: true,
            control_panels: true,
            transformers: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const station = await this.prisma.stations.findUnique({
      where: { id },
      include: {
        generators: { where: { is_deleted: false } },
        control_panels: true,
        transformers: true,
        distribution_boxes: { where: { is_deleted: false } }
      }
    });

    if (!station || station.is_deleted) {
      throw new NotFoundException('Station not found');
    }

    return station;
  }

  async create(dto: CreateStationDto) {
    return this.prisma.stations.create({
      data: {
        business_id: dto.business_id,
        code: dto.code,
        name: dto.name,
        name_en: dto.name_en,
        type: dto.type,
        location_lat: dto.location_lat,
        location_lng: dto.location_lng,
        address: dto.address,
        description: dto.description,
        status: dto.status || 'active',
        total_capacity_kw: dto.total_capacity_kw,
        installation_date: dto.installation_date ? new Date(dto.installation_date) : null
      }
    });
  }

  async update(id: string, dto: UpdateStationDto) {
    await this.findOne(id);

    return this.prisma.stations.update({
      where: { id },
      data: {
        name: dto.name,
        name_en: dto.name_en,
        type: dto.type,
        location_lat: dto.location_lat,
        location_lng: dto.location_lng,
        address: dto.address,
        description: dto.description,
        status: dto.status,
        total_capacity_kw: dto.total_capacity_kw,
        installation_date: dto.installation_date ? new Date(dto.installation_date) : undefined
      }
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.stations.update({
      where: { id },
      data: { is_deleted: true }
    });
  }

  async getGenerators(stationId: string) {
    return this.prisma.generators.findMany({
      where: { station_id: stationId, is_deleted: false },
      include: {
        components: true,
        _count: { select: { readings: true } }
      },
      orderBy: { code: 'asc' }
    });
  }

  async getStats(stationId: string) {
    const station = await this.findOne(stationId);
    
    const generators = await this.prisma.generators.findMany({
      where: { station_id: stationId, is_deleted: false }
    });

    const activeGenerators = generators.filter(g => g.status === 'active').length;
    const totalCapacity = generators.reduce((sum, g) => sum + (Number(g.capacity_kw) || 0), 0);

    return {
      station,
      stats: {
        total_generators: generators.length,
        active_generators: activeGenerators,
        total_capacity_kw: totalCapacity,
        control_panels_count: station.control_panels?.length || 0,
        transformers_count: station.transformers?.length || 0
      }
    };
  }
}
