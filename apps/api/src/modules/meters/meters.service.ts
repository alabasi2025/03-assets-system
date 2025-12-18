import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMeterDto, UpdateMeterDto, CreateMeterReadingDto } from './dto/meter.dto';

@Injectable()
export class MetersService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId?: string) {
    const where: any = { is_deleted: false };
    if (businessId) where.business_id = businessId;

    return this.prisma.meters.findMany({
      where,
      include: {
        distribution_box: { select: { id: true, code: true, name: true } },
        _count: { select: { readings: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const meter = await this.prisma.meters.findUnique({
      where: { id },
      include: {
        distribution_box: true,
        readings: { take: 10, orderBy: { reading_time: 'desc' } }
      }
    });
    if (!meter || meter.is_deleted) throw new NotFoundException('Meter not found');
    return meter;
  }

  async create(dto: CreateMeterDto) {
    return this.prisma.meters.create({
      data: {
        business_id: dto.business_id,
        code: dto.code,
        serial_number: dto.serial_number,
        type: dto.type,
        manufacturer: dto.manufacturer,
        model: dto.model,
        capacity_amp: dto.capacity_amp,
        distribution_box_id: dto.distribution_box_id,
        subscriber_id: dto.subscriber_id,
        location_lat: dto.location_lat,
        location_lng: dto.location_lng,
        connection_type: dto.connection_type,
        status: dto.status || 'active',
        installation_date: dto.installation_date ? new Date(dto.installation_date) : null
      }
    });
  }

  async update(id: string, dto: UpdateMeterDto) {
    await this.findOne(id);
    return this.prisma.meters.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.meters.update({ where: { id }, data: { is_deleted: true } });
  }

  async getReadings(meterId: string, limit = 100) {
    return this.prisma.meter_readings.findMany({
      where: { meter_id: meterId },
      orderBy: { reading_time: 'desc' },
      take: limit
    });
  }

  async addReading(meterId: string, dto: CreateMeterReadingDto) {
    await this.findOne(meterId);
    return this.prisma.meter_readings.create({
      data: {
        meter_id: meterId,
        reading_value: dto.reading_value,
        consumption: dto.consumption,
        peak_demand: dto.peak_demand,
        power_factor: dto.power_factor,
        source: dto.source || 'manual',
        recorded_by: dto.reader_id
      }
    });
  }
}
