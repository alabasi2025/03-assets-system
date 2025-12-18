import { Test, TestingModule } from '@nestjs/testing';
import { CablesService } from './cables.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CablesService', () => {
  let service: CablesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    cables: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCable = {
    id: 'cable-001',
    business_id: 'business-001',
    code: 'CBL-001',
    name: 'كابل رئيسي',
    type: 'underground',
    cross_section: 95,
    material: 'copper',
    length_meters: 500,
    capacity_amp: 200,
    start_point_type: 'station',
    start_point_id: 'station-001',
    end_point_type: 'distribution_box',
    end_point_id: 'db-001',
    status: 'active',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    junction_cables: [],
    cable_status: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CablesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CablesService>(CablesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all cables', async () => {
      const cables = [mockCable];
      mockPrismaService.cables.findMany.mockResolvedValue(cables);

      const result = await service.findAll();

      expect(result).toEqual(cables);
      expect(mockPrismaService.cables.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter by businessId', async () => {
      mockPrismaService.cables.findMany.mockResolvedValue([mockCable]);

      await service.findAll('business-001');

      expect(mockPrismaService.cables.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false, business_id: 'business-001' },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a cable by id', async () => {
      mockPrismaService.cables.findUnique.mockResolvedValue(mockCable);

      const result = await service.findOne(mockCable.id);

      expect(result).toEqual(mockCable);
    });

    it('should throw NotFoundException when cable not found', async () => {
      mockPrismaService.cables.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when cable is deleted', async () => {
      mockPrismaService.cables.findUnique.mockResolvedValue({
        ...mockCable,
        is_deleted: true,
      });

      await expect(service.findOne(mockCable.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      business_id: 'business-001',
      code: 'CBL-002',
      name: 'كابل فرعي',
      type: 'overhead',
      cross_section: 50,
      material: 'aluminum',
      length_meters: 200,
      capacity_amp: 100,
      start_point_type: 'distribution_box',
      start_point_id: 'db-001',
      end_point_type: 'distribution_box',
      end_point_id: 'db-002',
      status: 'active',
    };

    it('should create a new cable', async () => {
      mockPrismaService.cables.create.mockResolvedValue({
        ...mockCable,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.cables.create).toHaveBeenCalledWith({
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

      mockPrismaService.cables.create.mockResolvedValue(mockCable);

      await service.create(dtoWithDate);

      expect(mockPrismaService.cables.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          installation_date: expect.any(Date),
        }),
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'كابل رئيسي محدث',
      status: 'maintenance',
    };

    it('should update an existing cable', async () => {
      mockPrismaService.cables.findUnique.mockResolvedValue(mockCable);
      mockPrismaService.cables.update.mockResolvedValue({
        ...mockCable,
        ...updateDto,
      });

      const result = await service.update(mockCable.id, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException when cable not found', async () => {
      mockPrismaService.cables.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a cable', async () => {
      mockPrismaService.cables.findUnique.mockResolvedValue(mockCable);
      mockPrismaService.cables.update.mockResolvedValue({
        ...mockCable,
        is_deleted: true,
      });

      const result = await service.delete(mockCable.id);

      expect(result.is_deleted).toBe(true);
    });

    it('should throw NotFoundException when cable not found', async () => {
      mockPrismaService.cables.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
