import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateGeneratorReadingDto,
  UpdateGeneratorReadingDto,
  CreateMeterReadingDto,
  UpdateMeterReadingDto,
  VerifyMeterReadingDto,
  GeneratorReadingQueryDto,
  MeterReadingQueryDto
} from './dto/readings.dto';

@Injectable()
export class ReadingsService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════
  // Generator Readings
  // ═══════════════════════════════════════════════════════════════

  async createGeneratorReading(dto: CreateGeneratorReadingDto) {
    // التحقق من وجود المولد
    const generator = await this.prisma.generators.findFirst({
      where: { id: dto.generator_id, is_deleted: false }
    });

    if (!generator) {
      throw new NotFoundException('المولد غير موجود');
    }

    // إنشاء القراءة
    const reading = await this.prisma.generator_readings.create({
      data: {
        ...dto,
        reading_time: dto.reading_time ? new Date(dto.reading_time) : new Date()
      },
      include: { generator: true }
    });

    // تحديث ساعات التشغيل في المولد إذا تم توفيرها
    if (dto.running_hours) {
      await this.prisma.generators.update({
        where: { id: dto.generator_id },
        data: { running_hours: dto.running_hours }
      });
    }

    return reading;
  }

  async findAllGeneratorReadings(query: GeneratorReadingQueryDto) {
    const { business_id, generator_id, source, from_date, to_date, page = 1, limit = 10 } = query;

    const where: any = { is_deleted: false };

    if (business_id) where.business_id = business_id;
    if (generator_id) where.generator_id = generator_id;
    if (source) where.source = source;
    if (from_date || to_date) {
      where.reading_time = {};
      if (from_date) where.reading_time.gte = new Date(from_date);
      if (to_date) where.reading_time.lte = new Date(to_date);
    }

    const [data, total] = await Promise.all([
      this.prisma.generator_readings.findMany({
        where,
        include: { generator: true },
        orderBy: { reading_time: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.generator_readings.count({ where })
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

  async findOneGeneratorReading(id: string) {
    const reading = await this.prisma.generator_readings.findFirst({
      where: { id, is_deleted: false },
      include: { generator: true }
    });

    if (!reading) {
      throw new NotFoundException('القراءة غير موجودة');
    }

    return reading;
  }

  async updateGeneratorReading(id: string, dto: UpdateGeneratorReadingDto) {
    await this.findOneGeneratorReading(id);

    const updateData: any = { ...dto };
    if (dto.reading_time) {
      updateData.reading_time = new Date(dto.reading_time);
    }

    return this.prisma.generator_readings.update({
      where: { id },
      data: updateData,
      include: { generator: true }
    });
  }

  async removeGeneratorReading(id: string) {
    await this.findOneGeneratorReading(id);

    return this.prisma.generator_readings.update({
      where: { id },
      data: { is_deleted: true }
    });
  }

  async getGeneratorReadingStats(generatorId: string) {
    const readings = await this.prisma.generator_readings.findMany({
      where: { generator_id: generatorId, is_deleted: false },
      orderBy: { reading_time: 'desc' },
      take: 30
    });

    if (readings.length === 0) {
      return { message: 'لا توجد قراءات' };
    }

    const latest = readings[0];
    const avgFuelConsumption = readings.reduce((sum, r) => sum + (Number(r.fuel_consumption) || 0), 0) / readings.length;
    const avgPowerOutput = readings.reduce((sum, r) => sum + (Number(r.power_output) || 0), 0) / readings.length;
    const avgTemperature = readings.reduce((sum, r) => sum + (Number(r.temperature) || 0), 0) / readings.length;

    return {
      latest,
      statistics: {
        totalReadings: readings.length,
        avgFuelConsumption: avgFuelConsumption.toFixed(2),
        avgPowerOutput: avgPowerOutput.toFixed(2),
        avgTemperature: avgTemperature.toFixed(2)
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Meter Readings
  // ═══════════════════════════════════════════════════════════════

  async createMeterReading(dto: CreateMeterReadingDto) {
    // التحقق من وجود العداد
    const meter = await this.prisma.meters.findFirst({
      where: { id: dto.meter_id, is_deleted: false }
    });

    if (!meter) {
      throw new NotFoundException('العداد غير موجود');
    }

    // الحصول على آخر قراءة لحساب الاستهلاك
    const lastReading = await this.prisma.meter_readings.findFirst({
      where: { meter_id: dto.meter_id },
      orderBy: { reading_time: 'desc' }
    });

    const previousValue = dto.previous_value ?? (lastReading ? Number(lastReading.reading_value) : 0);
    const consumption = dto.reading_value - previousValue;

    if (consumption < 0 && dto.reading_type !== 'correction') {
      throw new BadRequestException('قيمة القراءة أقل من القراءة السابقة');
    }

    return this.prisma.meter_readings.create({
      data: {
        business_id: dto.business_id,
        meter_id: dto.meter_id,
        reading_time: dto.reading_time ? new Date(dto.reading_time) : new Date(),
        reading_value: dto.reading_value,
        previous_value: previousValue,
        consumption: consumption >= 0 ? consumption : 0,
        reading_type: dto.reading_type || 'regular',
        source: dto.source || 'manual',
        image_url: dto.image_url,
        notes: dto.notes,
        recorded_by: dto.recorded_by
      },
      include: { meter: true }
    });
  }

  async findAllMeterReadings(query: MeterReadingQueryDto) {
    const { business_id, meter_id, reading_type, source, from_date, to_date, page = 1, limit = 10 } = query;

    const where: any = { is_deleted: false };

    if (business_id) where.business_id = business_id;
    if (meter_id) where.meter_id = meter_id;
    if (reading_type) where.reading_type = reading_type;
    if (source) where.source = source;
    if (from_date || to_date) {
      where.reading_time = {};
      if (from_date) where.reading_time.gte = new Date(from_date);
      if (to_date) where.reading_time.lte = new Date(to_date);
    }

    const [data, total] = await Promise.all([
      this.prisma.meter_readings.findMany({
        where,
        include: { meter: true },
        orderBy: { reading_time: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.meter_readings.count({ where })
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

  async findOneMeterReading(id: string) {
    const reading = await this.prisma.meter_readings.findFirst({
      where: { id, is_deleted: false },
      include: { meter: true }
    });

    if (!reading) {
      throw new NotFoundException('القراءة غير موجودة');
    }

    return reading;
  }

  async updateMeterReading(id: string, dto: UpdateMeterReadingDto) {
    await this.findOneMeterReading(id);

    const updateData: any = { ...dto };
    if (dto.reading_time) {
      updateData.reading_time = new Date(dto.reading_time);
    }

    return this.prisma.meter_readings.update({
      where: { id },
      data: updateData,
      include: { meter: true }
    });
  }

  async removeMeterReading(id: string) {
    await this.findOneMeterReading(id);

    return this.prisma.meter_readings.update({
      where: { id },
      data: { is_deleted: true }
    });
  }

  async verifyMeterReading(id: string, dto: VerifyMeterReadingDto) {
    await this.findOneMeterReading(id);

    return this.prisma.meter_readings.update({
      where: { id },
      data: {
        verified_by: dto.verified_by,
        verified_at: new Date()
      },
      include: { meter: true }
    });
  }

  async getMeterReadingStats(meterId: string) {
    const readings = await this.prisma.meter_readings.findMany({
      where: { meter_id: meterId, is_deleted: false },
      orderBy: { reading_time: 'desc' },
      take: 12
    });

    if (readings.length === 0) {
      return { message: 'لا توجد قراءات' };
    }

    const latest = readings[0];
    const totalConsumption = readings.reduce((sum, r) => sum + (Number(r.consumption) || 0), 0);
    const avgConsumption = totalConsumption / readings.length;

    return {
      latest,
      statistics: {
        totalReadings: readings.length,
        totalConsumption: totalConsumption.toFixed(3),
        avgConsumption: avgConsumption.toFixed(3)
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Dashboard Statistics
  // ═══════════════════════════════════════════════════════════════

  async getDashboardStats(businessId?: string) {
    const generatorWhere: any = { is_deleted: false };
    const meterWhere: any = { is_deleted: false };

    if (businessId) {
      generatorWhere.business_id = businessId;
      meterWhere.business_id = businessId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalGeneratorReadings,
      todayGeneratorReadings,
      totalMeterReadings,
      todayMeterReadings,
      recentGeneratorReadings,
      recentMeterReadings
    ] = await Promise.all([
      this.prisma.generator_readings.count({ where: generatorWhere }),
      this.prisma.generator_readings.count({
        where: { ...generatorWhere, reading_time: { gte: today } }
      }),
      this.prisma.meter_readings.count({ where: meterWhere }),
      this.prisma.meter_readings.count({
        where: { ...meterWhere, reading_time: { gte: today } }
      }),
      this.prisma.generator_readings.findMany({
        where: generatorWhere,
        include: { generator: true },
        orderBy: { reading_time: 'desc' },
        take: 5
      }),
      this.prisma.meter_readings.findMany({
        where: meterWhere,
        include: { meter: true },
        orderBy: { reading_time: 'desc' },
        take: 5
      })
    ]);

    return {
      generators: {
        total: totalGeneratorReadings,
        today: todayGeneratorReadings,
        recent: recentGeneratorReadings
      },
      meters: {
        total: totalMeterReadings,
        today: todayMeterReadings,
        recent: recentMeterReadings
      }
    };
  }
}
