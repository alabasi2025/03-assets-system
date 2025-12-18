import { Test, TestingModule } from '@nestjs/testing';
import { SolarStationsService } from './solar-stations.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SolarStationsService', () => {
  let service: SolarStationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    solar_stations: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    solar_panels: {
      findMany: jest.fn(),
    },
    inverters: {
      findMany: jest.fn(),
    },
  };

  const mockSolarStation = {
    id: 'solar-001',
    business_id: 'business-001',
    code: 'SOL-001',
    name: 'محطة طاقة شمسية 1',
    name_en: 'Solar Station 1',
    location_lat: 24.7136,
    location_lng: 46.6753,
    address: 'الرياض',
    total_capacity_kw: 100,
    panels_count: 200,
    inverters_count: 4,
    status: 'active',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    panels: [],
    inverters: [],
    batteries: [],
    _count: { panels: 200, inverters: 4, batteries: 10 },
  };

  const mockPanel = {
    id: 'panel-001',
    solar_station_id: 'solar-001',
    code: 'PNL-001',
    capacity_watt: 500,
    status: 'active',
  };

  const mockInverter = {
    id: 'inv-001',
    solar_station_id: 'solar-001',
    code: 'INV-001',
    capacity_kw: 25,
    status: 'active',
    panels: [],
    readings: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolarStationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SolarStationsService>(SolarStationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all solar stations', async () => {
      const stations = [mockSolarStation];
      mockPrismaService.solar_stations.findMany.mockResolvedValue(stations);

      const result = await service.findAll();

      expect(result).toEqual(stations);
      expect(mockPrismaService.solar_stations.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter by businessId', async () => {
      mockPrismaService.solar_stations.findMany.mockResolvedValue([mockSolarStation]);

      await service.findAll('business-001');

      expect(mockPrismaService.solar_stations.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false, business_id: 'business-001' },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a solar station by id', async () => {
      mockPrismaService.solar_stations.findUnique.mockResolvedValue(mockSolarStation);

      const result = await service.findOne(mockSolarStation.id);

      expect(result).toEqual(mockSolarStation);
    });

    it('should throw NotFoundException when station not found', async () => {
      mockPrismaService.solar_stations.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when station is deleted', async () => {
      mockPrismaService.solar_stations.findUnique.mockResolvedValue({
        ...mockSolarStation,
        is_deleted: true,
      });

      await expect(service.findOne(mockSolarStation.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      business_id: 'business-001',
      code: 'SOL-002',
      name: 'محطة طاقة شمسية 2',
      name_en: 'Solar Station 2',
      total_capacity_kw: 50,
      panels_count: 100,
      inverters_count: 2,
      status: 'active',
    };

    it('should create a new solar station', async () => {
      mockPrismaService.solar_stations.create.mockResolvedValue({
        ...mockSolarStation,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.solar_stations.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          business_id: createDto.business_id,
          code: createDto.code,
          name: createDto.name,
        }),
      });
    });

    it('should handle installation_date', async () => {
      const dtoWithDate = {
        ...createDto,
        installation_date: '2024-01-01',
      };

      mockPrismaService.solar_stations.create.mockResolvedValue(mockSolarStation);

      await service.create(dtoWithDate);

      expect(mockPrismaService.solar_stations.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          installation_date: expect.any(Date),
        }),
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'محطة محدثة',
      total_capacity_kw: 150,
    };

    it('should update an existing solar station', async () => {
      mockPrismaService.solar_stations.findUnique.mockResolvedValue(mockSolarStation);
      mockPrismaService.solar_stations.update.mockResolvedValue({
        ...mockSolarStation,
        ...updateDto,
      });

      const result = await service.update(mockSolarStation.id, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException when station not found', async () => {
      mockPrismaService.solar_stations.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a solar station', async () => {
      mockPrismaService.solar_stations.findUnique.mockResolvedValue(mockSolarStation);
      mockPrismaService.solar_stations.update.mockResolvedValue({
        ...mockSolarStation,
        is_deleted: true,
      });

      const result = await service.delete(mockSolarStation.id);

      expect(result.is_deleted).toBe(true);
    });

    it('should throw NotFoundException when station not found', async () => {
      mockPrismaService.solar_stations.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPanels', () => {
    it('should return panels for a station', async () => {
      const mockPanels = [mockPanel];
      mockPrismaService.solar_panels.findMany.mockResolvedValue(mockPanels);

      const result = await service.getPanels(mockSolarStation.id);

      expect(result).toEqual(mockPanels);
      expect(mockPrismaService.solar_panels.findMany).toHaveBeenCalledWith({
        where: { solar_station_id: mockSolarStation.id },
        orderBy: { code: 'asc' },
      });
    });
  });

  describe('getInverters', () => {
    it('should return inverters for a station', async () => {
      const mockInverters = [mockInverter];
      mockPrismaService.inverters.findMany.mockResolvedValue(mockInverters);

      const result = await service.getInverters(mockSolarStation.id);

      expect(result).toEqual(mockInverters);
    });
  });

  describe('getStats', () => {
    it('should return station statistics', async () => {
      mockPrismaService.solar_stations.findUnique.mockResolvedValue(mockSolarStation);
      mockPrismaService.solar_panels.findMany.mockResolvedValue([
        { ...mockPanel, status: 'active', capacity_watt: 500 },
        { ...mockPanel, id: 'panel-002', status: 'active', capacity_watt: 500 },
        { ...mockPanel, id: 'panel-003', status: 'inactive', capacity_watt: 500 },
      ]);
      mockPrismaService.inverters.findMany.mockResolvedValue([
        { ...mockInverter, status: 'active', capacity_kw: 25 },
        { ...mockInverter, id: 'inv-002', status: 'active', capacity_kw: 25 },
      ]);

      const result = await service.getStats(mockSolarStation.id);

      expect(result.stats.total_panels).toBe(3);
      expect(result.stats.active_panels).toBe(2);
      expect(result.stats.total_panel_capacity_watt).toBe(1500);
      expect(result.stats.total_inverters).toBe(2);
      expect(result.stats.active_inverters).toBe(2);
      expect(result.stats.total_inverter_capacity_kw).toBe(50);
    });
  });
});
