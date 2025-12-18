import { Test, TestingModule } from '@nestjs/testing';
import { GeneratorsService } from './generators.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GeneratorsService', () => {
  let service: GeneratorsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    generators: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    generator_readings: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    generator_components: {
      findMany: jest.fn(),
    },
  };

  const mockGenerator = {
    id: 'gen-001',
    station_id: 'station-001',
    code: 'GEN-001',
    name: 'مولد رئيسي',
    manufacturer: 'Caterpillar',
    model: 'CAT-500',
    serial_number: 'SN123456',
    year: 2020,
    capacity_kva: 500,
    capacity_kw: 400,
    fuel_type: 'diesel',
    status: 'active',
    condition: 'good',
    running_hours: 1000,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    station: { id: 'station-001', code: 'ST-001', name: 'محطة 1' },
    components: [],
    readings: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GeneratorsService>(GeneratorsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all generators', async () => {
      const generators = [mockGenerator];
      mockPrismaService.generators.findMany.mockResolvedValue(generators);

      const result = await service.findAll();

      expect(result).toEqual(generators);
      expect(mockPrismaService.generators.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter by stationId', async () => {
      mockPrismaService.generators.findMany.mockResolvedValue([mockGenerator]);

      await service.findAll('station-001');

      expect(mockPrismaService.generators.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false, station_id: 'station-001' },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a generator by id', async () => {
      mockPrismaService.generators.findUnique.mockResolvedValue(mockGenerator);

      const result = await service.findOne(mockGenerator.id);

      expect(result).toEqual(mockGenerator);
    });

    it('should throw NotFoundException when generator not found', async () => {
      mockPrismaService.generators.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when generator is deleted', async () => {
      mockPrismaService.generators.findUnique.mockResolvedValue({
        ...mockGenerator,
        is_deleted: true,
      });

      await expect(service.findOne(mockGenerator.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      station_id: 'station-001',
      code: 'GEN-002',
      name: 'مولد جديد',
      manufacturer: 'Cummins',
      model: 'CUM-300',
      capacity_kva: 300,
      capacity_kw: 240,
      fuel_type: 'diesel',
    };

    it('should create a new generator', async () => {
      mockPrismaService.generators.create.mockResolvedValue({
        ...mockGenerator,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.generators.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          station_id: createDto.station_id,
          code: createDto.code,
          name: createDto.name,
        }),
      });
    });

    it('should handle optional fields', async () => {
      const dtoWithOptionals = {
        ...createDto,
        purchase_date: '2024-01-01',
        warranty_end: '2026-01-01',
        notes: 'Test notes',
      };

      mockPrismaService.generators.create.mockResolvedValue({
        ...mockGenerator,
        ...dtoWithOptionals,
      });

      await service.create(dtoWithOptionals);

      expect(mockPrismaService.generators.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          purchase_date: expect.any(Date),
          warranty_end: expect.any(Date),
          notes: 'Test notes',
        }),
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'مولد محدث',
      status: 'maintenance',
      running_hours: 1500,
    };

    it('should update an existing generator', async () => {
      mockPrismaService.generators.findUnique.mockResolvedValue(mockGenerator);
      mockPrismaService.generators.update.mockResolvedValue({
        ...mockGenerator,
        ...updateDto,
      });

      const result = await service.update(mockGenerator.id, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(mockPrismaService.generators.update).toHaveBeenCalledWith({
        where: { id: mockGenerator.id },
        data: expect.objectContaining({
          name: updateDto.name,
          status: updateDto.status,
          running_hours: updateDto.running_hours,
        }),
      });
    });

    it('should throw NotFoundException when updating non-existent generator', async () => {
      mockPrismaService.generators.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a generator', async () => {
      mockPrismaService.generators.findUnique.mockResolvedValue(mockGenerator);
      mockPrismaService.generators.update.mockResolvedValue({
        ...mockGenerator,
        is_deleted: true,
      });

      const result = await service.delete(mockGenerator.id);

      expect(result.is_deleted).toBe(true);
      expect(mockPrismaService.generators.update).toHaveBeenCalledWith({
        where: { id: mockGenerator.id },
        data: { is_deleted: true },
      });
    });
  });

  describe('getReadings', () => {
    it('should return readings for a generator', async () => {
      const mockReadings = [
        { id: 'reading-1', generator_id: mockGenerator.id, running_hours: 1000 },
        { id: 'reading-2', generator_id: mockGenerator.id, running_hours: 1010 },
      ];
      mockPrismaService.generator_readings.findMany.mockResolvedValue(mockReadings);

      const result = await service.getReadings(mockGenerator.id);

      expect(result).toEqual(mockReadings);
      expect(mockPrismaService.generator_readings.findMany).toHaveBeenCalledWith({
        where: { generator_id: mockGenerator.id },
        orderBy: { reading_time: 'desc' },
        take: 100,
      });
    });

    it('should respect limit parameter', async () => {
      mockPrismaService.generator_readings.findMany.mockResolvedValue([]);

      await service.getReadings(mockGenerator.id, 50);

      expect(mockPrismaService.generator_readings.findMany).toHaveBeenCalledWith({
        where: { generator_id: mockGenerator.id },
        orderBy: { reading_time: 'desc' },
        take: 50,
      });
    });
  });

  describe('addReading', () => {
    const readingDto = {
      running_hours: 1100,
      fuel_consumption: 50,
      voltage: 380,
      current: 100,
      frequency: 50,
      temperature: 75,
      oil_pressure: 45,
      power_output: 350,
      source: 'manual',
      recorded_by: 'user-001',
    };

    it('should add a new reading', async () => {
      mockPrismaService.generators.findUnique.mockResolvedValue(mockGenerator);
      mockPrismaService.generators.update.mockResolvedValue(mockGenerator);
      mockPrismaService.generator_readings.create.mockResolvedValue({
        id: 'reading-new',
        generator_id: mockGenerator.id,
        ...readingDto,
      });

      const result = await service.addReading(mockGenerator.id, readingDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.generators.update).toHaveBeenCalledWith({
        where: { id: mockGenerator.id },
        data: { running_hours: readingDto.running_hours },
      });
    });

    it('should throw NotFoundException when generator not found', async () => {
      mockPrismaService.generators.findUnique.mockResolvedValue(null);

      await expect(
        service.addReading('non-existent', readingDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComponents', () => {
    it('should return components for a generator', async () => {
      const mockComponents = [
        { id: 'comp-1', generator_id: mockGenerator.id, component_type: 'engine' },
        { id: 'comp-2', generator_id: mockGenerator.id, component_type: 'alternator' },
      ];
      mockPrismaService.generator_components.findMany.mockResolvedValue(mockComponents);

      const result = await service.getComponents(mockGenerator.id);

      expect(result).toEqual(mockComponents);
      expect(mockPrismaService.generator_components.findMany).toHaveBeenCalledWith({
        where: { generator_id: mockGenerator.id },
        orderBy: { component_type: 'asc' },
      });
    });
  });
});
