import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  gymfyAcademia: { findMany: jest.fn() },
  gymfyAlunoAcademia: { findMany: jest.fn() },
  gymfyCheckIn: { findFirst: jest.fn() },
  gymfyAlertaChurn: { create: jest.fn(), update: jest.fn() },
};

function diasAtras(dias: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d;
}

describe('AlertasService — calcularChurnScores', () => {
  let service: AlertasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AlertasService>(AlertasService);
    jest.clearAllMocks();

    mockPrisma.gymfyAcademia.findMany.mockResolvedValue([{ id: 'academia-1' }]);
    mockPrisma.gymfyAlunoAcademia.findMany.mockResolvedValue([{ alunoId: 'aluno-1' }]);
    mockPrisma.gymfyAlertaChurn.create.mockResolvedValue({});
  });

  it('6 dias sem check-in → não cria alerta', async () => {
    mockPrisma.gymfyCheckIn.findFirst.mockResolvedValue({ criadoEm: diasAtras(6) });
    await service.calcularChurnScores();
    expect(mockPrisma.gymfyAlertaChurn.create).not.toHaveBeenCalled();
  });

  it('7 dias sem check-in → RISCO_BAIXO', async () => {
    mockPrisma.gymfyCheckIn.findFirst.mockResolvedValue({ criadoEm: diasAtras(7) });
    await service.calcularChurnScores();
    expect(mockPrisma.gymfyAlertaChurn.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ risco: 'RISCO_BAIXO' }) }),
    );
  });

  it('14 dias sem check-in → RISCO_MEDIO', async () => {
    mockPrisma.gymfyCheckIn.findFirst.mockResolvedValue({ criadoEm: diasAtras(14) });
    await service.calcularChurnScores();
    expect(mockPrisma.gymfyAlertaChurn.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ risco: 'RISCO_MEDIO' }) }),
    );
  });

  it('21 dias sem check-in → RISCO_ALTO', async () => {
    mockPrisma.gymfyCheckIn.findFirst.mockResolvedValue({ criadoEm: diasAtras(21) });
    await service.calcularChurnScores();
    expect(mockPrisma.gymfyAlertaChurn.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ risco: 'RISCO_ALTO' }) }),
    );
  });

  it('aluno sem check-ins → não cria alerta', async () => {
    mockPrisma.gymfyCheckIn.findFirst.mockResolvedValue(null);
    await service.calcularChurnScores();
    expect(mockPrisma.gymfyAlertaChurn.create).not.toHaveBeenCalled();
  });
});
