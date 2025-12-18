import { Test, TestingModule } from '@nestjs/testing';
import { MetersService } from './meters.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MetersService', () => {
  let service: MetersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    meters: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    meter_readings: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockMeter = {
    id: 'meter-001',
    business_id: 'business-001',
    code: 'MTR-001',
    serial_number: 'SN123456',
    type: 'single_phase',
    manufacturer: 'Schneider',
    model: 'iEM3150',
    capacity_amp: 60,
    distribution_box_id: 'db-001',
    subscriber_id: 'sub-001',
    connection_type: 'direct',
    status: 'active',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    distribution_box: { id: 'db-001', code: 'DB-001', name: 'صندوق 1' },
    readings: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MetersService>(MetersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all meters', async () => {
      const meters = [mockMeter];
      mockPrismaService.meters.findMany.mockResolvedValue(meters);

      const result = await service.findAll();

      expect(result).toEqual(meters);
      expect(mockPrismaService.meters.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter by businessId', async () => {
      mockPrismaService.meters.findMany.mockResolvedValue([mockMeter]);

      await service.findAll('business-001');

      expect(mockPrismaService.meters.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false, business_id: 'business-001' },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a meter by id', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue(mockMeter);

      const result = await service.findOne(mockMeter.id);

      expect(result).toEqual(mockMeter);
    });

    it('should throw NotFoundException when meter not found', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when meter is deleted', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue({
        ...mockMeter,
        is_deleted: true,
      });

      await expect(service.findOne(mockMeter.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      business_id: 'business-001',
      code: 'MTR-002',
      serial_number: 'SN789012',
      type: 'three_phase',
      manufacturer: 'ABB',
      model: 'A44',
      capacity_amp: 100,
      distribution_box_id: 'db-001',
      connection_type: 'ct',
      status: 'active',
    };

    it('should create a new meter', async () => {
      mockPrismaService.meters.create.mockResolvedValue({
        ...mockMeter,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.meters.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          business_id: createDto.business_id,
          code: createDto.code,
          serial_number: createDto.serial_number,
        }),
      });
    });

    it('should handle installation_date', async () => {
      const dtoWithDate = {
        ...createDto,
        installation_date: '2024-01-01',
      };

      mockPrismaService.meters.create.mockResolvedValue(mockMeter);

      await service.create(dtoWithDate);

      expect(mockPrismaService.meters.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          installation_date: expect.any(Date),
        }),
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      status: 'maintenance',
      capacity_amp: 80,
    };

    it('should update an existing meter', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue(mockMeter);
      mockPrismaService.meters.update.mockResolvedValue({
        ...mockMeter,
        ...updateDto,
      });

      const result = await service.update(mockMeter.id, updateDto);

      expect(result.status).toBe(updateDto.status);
    });

    it('should throw NotFoundException when meter not found', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a meter', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue(mockMeter);
      mockPrismaService.meters.update.mockResolvedValue({
        ...mockMeter,
        is_deleted: true,
      });

      const result = await service.delete(mockMeter.id);

      expect(result.is_deleted).toBe(true);
    });

    it('should throw NotFoundException when meter not found', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReadings', () => {
    it('should return readings for a meter', async () => {
      const mockReadings = [
        { id: 'reading-1', meter_id: mockMeter.id, reading_value: 1000 },
        { id: 'reading-2', meter_id: mockMeter.id, reading_value: 1100 },
      ];
      mockPrismaService.meter_readings.findMany.mockResolvedValue(mockReadings);

      const result = await service.getReadings(mockMeter.id);

      expect(result).toEqual(mockReadings);
      expect(mockPrismaService.meter_readings.findMany).toHaveBeenCalledWith({
        where: { meter_id: mockMeter.id },
        orderBy: { reading_time: 'desc' },
        take: 100,
      });
    });

    it('should respect limit parameter', async () => {
      mockPrismaService.meter_readings.findMany.mockResolvedValue([]);

      await service.getReadings(mockMeter.id, 50);

      expect(mockPrismaService.meter_readings.findMany).toHaveBeenCalledWith({
        where: { meter_id: mockMeter.id },
        orderBy: { reading_time: 'desc' },
        take: 50,
      });
    });
  });

  describe('addReading', () => {
    const readingDto = {
      reading_value: 1200,
      consumption: 100,
      peak_demand: 50,
      power_factor: 0.95,
      source: 'manual',
      reader_id: 'user-001',
    };

    it('should add a new reading', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue(mockMeter);
      mockPrismaService.meter_readings.create.mockResolvedValue({
        id: 'reading-new',
        meter_id: mockMeter.id,
        ...readingDto,
      });

      const result = await service.addReading(mockMeter.id, readingDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.meter_readings.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          meter_id: mockMeter.id,
          reading_value: readingDto.reading_value,
        }),
      });
    });

    it('should throw NotFoundException when meter not found', async () => {
      mockPrismaService.meters.findUnique.mockResolvedValue(null);

      await expect(
        service.addReading('non-existent', readingDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
