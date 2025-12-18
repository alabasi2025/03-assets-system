import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGeneratorDto, UpdateGeneratorDto, CreateGeneratorReadingDto } from './dto/generator.dto';

@Injectable()
export class GeneratorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(stationId?: string) {
    const where: any = { is_deleted: false };
    if (stationId) {
      where.station_id = stationId;
    }

    return this.prisma.generators.findMany({
      where,
      include: {
        station: { select: { id: true, code: true, name: true } },
        _count: { select: { components: true, readings: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const generator = await this.prisma.generators.findUnique({
      where: { id },
      include: {
        station: true,
        components: true,
        readings: { take: 10, orderBy: { reading_time: 'desc' } }
      }
    });

    if (!generator || generator.is_deleted) {
      throw new NotFoundException('Generator not found');
    }

    return generator;
  }

  async create(dto: CreateGeneratorDto) {
    return this.prisma.generators.create({
      data: {
        station_id: dto.station_id,
        code: dto.code,
        name: dto.name,
        manufacturer: dto.manufacturer,
        model: dto.model,
        serial_number: dto.serial_number,
        year: dto.year,
        capacity_kva: dto.capacity_kva,
        capacity_kw: dto.capacity_kw,
        fuel_type: dto.fuel_type,
        status: dto.status || 'active',
        condition: dto.condition || 'good',
        purchase_date: dto.purchase_date ? new Date(dto.purchase_date) : null,
        warranty_end: dto.warranty_end ? new Date(dto.warranty_end) : null,
        notes: dto.notes
      }
    });
  }

  async update(id: string, dto: UpdateGeneratorDto) {
    await this.findOne(id);

    return this.prisma.generators.update({
      where: { id },
      data: {
        name: dto.name,
        manufacturer: dto.manufacturer,
        model: dto.model,
        serial_number: dto.serial_number,
        year: dto.year,
        capacity_kva: dto.capacity_kva,
        capacity_kw: dto.capacity_kw,
        fuel_type: dto.fuel_type,
        status: dto.status,
        condition: dto.condition,
        running_hours: dto.running_hours,
        notes: dto.notes
      }
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.generators.update({
      where: { id },
      data: { is_deleted: true }
    });
  }

  async getReadings(generatorId: string, limit = 100) {
    return this.prisma.generator_readings.findMany({
      where: { generator_id: generatorId },
      orderBy: { reading_time: 'desc' },
      take: limit
    });
  }

  async addReading(generatorId: string, dto: CreateGeneratorReadingDto) {
    await this.findOne(generatorId);

    // Update running hours on generator
    if (dto.running_hours) {
      await this.prisma.generators.update({
        where: { id: generatorId },
        data: { running_hours: dto.running_hours }
      });
    }

    return this.prisma.generator_readings.create({
      data: {
        generator_id: generatorId,
        running_hours: dto.running_hours,
        fuel_consumption: dto.fuel_consumption,
        voltage: dto.voltage,
        current: dto.current,
        frequency: dto.frequency,
        temperature: dto.temperature,
        oil_pressure: dto.oil_pressure,
        power_output: dto.power_output,
        source: dto.source || 'manual',
        recorded_by: dto.recorded_by
      }
    });
  }

  async getComponents(generatorId: string) {
    return this.prisma.generator_components.findMany({
      where: { generator_id: generatorId },
      orderBy: { component_type: 'asc' }
    });
  }
}
