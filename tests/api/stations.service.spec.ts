import { Test, TestingModule } from '@nestjs/testing';
import { StationsService } from './stations.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StationsService', () => {
  let service: StationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    stations: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    generators: {
      findMany: jest.fn(),
    },
  };

  const mockStation = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    business_id: '123e4567-e89b-12d3-a456-426614174001',
    code: 'ST-001',
    name: 'محطة الاختبار',
    name_en: 'Test Station',
    type: 'generation',
    status: 'active',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    generators: [],
    control_panels: [],
    transformers: [],
    distribution_boxes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StationsService>(StationsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of stations', async () => {
      const stations = [mockStation];
      mockPrismaService.stations.findMany.mockResolvedValue(stations);

      const result = await service.findAll();

      expect(result).toEqual(stations);
      expect(mockPrismaService.stations.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter by businessId when provided', async () => {
      const businessId = '123e4567-e89b-12d3-a456-426614174001';
      mockPrismaService.stations.findMany.mockResolvedValue([mockStation]);

      await service.findAll(businessId);

      expect(mockPrismaService.stations.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false, business_id: businessId },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a station by id', async () => {
      mockPrismaService.stations.findUnique.mockResolvedValue(mockStation);

      const result = await service.findOne(mockStation.id);

      expect(result).toEqual(mockStation);
      expect(mockPrismaService.stations.findUnique).toHaveBeenCalledWith({
        where: { id: mockStation.id },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when station not found', async () => {
      mockPrismaService.stations.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when station is deleted', async () => {
      mockPrismaService.stations.findUnique.mockResolvedValue({
        ...mockStation,
        is_deleted: true,
      });

      await expect(service.findOne(mockStation.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new station', async () => {
      const createDto = {
        business_id: mockStation.business_id,
        code: 'ST-002',
        name: 'محطة جديدة',
        name_en: 'New Station',
        type: 'generation',
        status: 'active',
      };

      mockPrismaService.stations.create.mockResolvedValue({
        ...mockStation,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.stations.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          business_id: createDto.business_id,
          code: createDto.code,
          name: createDto.name,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update an existing station', async () => {
      const updateDto = {
        name: 'محطة محدثة',
        name_en: 'Updated Station',
      };

      mockPrismaService.stations.findUnique.mockResolvedValue(mockStation);
      mockPrismaService.stations.update.mockResolvedValue({
        ...mockStation,
        ...updateDto,
      });

      const result = await service.update(mockStation.id, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(mockPrismaService.stations.update).toHaveBeenCalledWith({
        where: { id: mockStation.id },
        data: expect.objectContaining({
          name: updateDto.name,
          name_en: updateDto.name_en,
        }),
      });
    });

    it('should throw NotFoundException when updating non-existent station', async () => {
      mockPrismaService.stations.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a station', async () => {
      mockPrismaService.stations.findUnique.mockResolvedValue(mockStation);
      mockPrismaService.stations.update.mockResolvedValue({
        ...mockStation,
        is_deleted: true,
      });

      const result = await service.delete(mockStation.id);

      expect(result.is_deleted).toBe(true);
      expect(mockPrismaService.stations.update).toHaveBeenCalledWith({
        where: { id: mockStation.id },
        data: { is_deleted: true },
      });
    });
  });

  describe('getGenerators', () => {
    it('should return generators for a station', async () => {
      const mockGenerators = [
        { id: 'gen-1', code: 'GEN-001', station_id: mockStation.id },
      ];
      mockPrismaService.generators.findMany.mockResolvedValue(mockGenerators);

      const result = await service.getGenerators(mockStation.id);

      expect(result).toEqual(mockGenerators);
      expect(mockPrismaService.generators.findMany).toHaveBeenCalledWith({
        where: { station_id: mockStation.id, is_deleted: false },
        include: expect.any(Object),
        orderBy: { code: 'asc' },
      });
    });
  });

  describe('getStats', () => {
    it('should return station statistics', async () => {
      const mockGenerators = [
        { id: 'gen-1', status: 'active', capacity_kw: 100 },
        { id: 'gen-2', status: 'active', capacity_kw: 150 },
        { id: 'gen-3', status: 'inactive', capacity_kw: 100 },
      ];

      mockPrismaService.stations.findUnique.mockResolvedValue({
        ...mockStation,
        control_panels: [{ id: 'cp-1' }],
        transformers: [{ id: 'tr-1' }, { id: 'tr-2' }],
      });
      mockPrismaService.generators.findMany.mockResolvedValue(mockGenerators);

      const result = await service.getStats(mockStation.id);

      expect(result.stats.total_generators).toBe(3);
      expect(result.stats.active_generators).toBe(2);
      expect(result.stats.total_capacity_kw).toBe(350);
      expect(result.stats.control_panels_count).toBe(1);
      expect(result.stats.transformers_count).toBe(2);
    });
  });
});
