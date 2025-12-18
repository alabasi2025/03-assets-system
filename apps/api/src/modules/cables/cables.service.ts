import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCableDto, UpdateCableDto } from './dto/cable.dto';

@Injectable()
export class CablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId?: string) {
    const where: any = { is_deleted: false };
    if (businessId) where.business_id = businessId;

    return this.prisma.cables.findMany({
      where,
      include: {
        junction_cables: { include: { junction_point: true } },
        _count: { select: { cable_status: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const cable = await this.prisma.cables.findUnique({
      where: { id },
      include: {
        junction_cables: { include: { junction_point: true } },
        cable_status: { take: 10, orderBy: { reading_time: 'desc' } }
      }
    });
    if (!cable || cable.is_deleted) throw new NotFoundException('Cable not found');
    return cable;
  }

  async create(dto: CreateCableDto) {
    return this.prisma.cables.create({
      data: {
        business_id: dto.business_id,
        code: dto.code,
        name: dto.name,
        type: dto.type,
        cross_section: dto.cross_section,
        material: dto.material,
        length_meters: dto.length_meters,
        capacity_amp: dto.capacity_amp,
        start_point_type: dto.start_point_type,
        start_point_id: dto.start_point_id,
        end_point_type: dto.end_point_type,
        end_point_id: dto.end_point_id,
        path_coordinates: dto.path_coordinates,
        status: dto.status || 'active',
        installation_date: dto.installation_date ? new Date(dto.installation_date) : null,
        notes: dto.notes
      }
    });
  }

  async update(id: string, dto: UpdateCableDto) {
    await this.findOne(id);
    return this.prisma.cables.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.cables.update({ where: { id }, data: { is_deleted: true } });
  }
}
