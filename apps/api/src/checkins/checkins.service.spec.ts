import { Test, TestingModule } from '@nestjs/testing';
import { CheckinsService } from './checkins.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RankingService } from '../ranking/ranking.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockPrisma = {
  gymfyAlunoAcademia: { findUnique: jest.fn() },
  gymfyCheckIn: { findFirst: jest.fn(), create: jest.fn(), count: jest.fn() },
  gymfyPonto: { create: jest.fn() },
  gymfyConfiguracaoAcademia: { findUnique: jest.fn() },
  gymfyConquista: { findFirst: jest.fn() },
  gymfyConquistaAluno: { upsert: jest.fn() },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('qr-token'),
  verify: jest.fn(),
};

const mockConfig = {
  get: jest.fn().mockReturnValue('test-secret'),
};

const mockRanking = {
  adicionarPontos: jest.fn(),
};

describe('CheckinsService', () => {
  let service: CheckinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckinsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: RankingService, useValue: mockRanking },
      ],
    }).compile();

    service = module.get<CheckinsService>(CheckinsService);
    jest.clearAllMocks();
  });

  describe('gerarQrCode', () => {
    it('deve gerar um token JWT assinado com JWT_QR_SECRET', async () => {
      const token = await service.gerarQrCode('academia-1');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ academiaId: 'academia-1' }),
        expect.objectContaining({ secret: 'test-secret', expiresIn: '60s' }),
      );
      expect(token).toBe('qr-token');
    });
  });

  describe('validarCheckin', () => {
    const qrPayload = { academiaId: 'academia-1', geradoEm: Date.now(), exp: Math.floor(Date.now() / 1000) + 60 };

    beforeEach(() => {
      mockJwt.verify.mockReturnValue(qrPayload);
      mockPrisma.gymfyAlunoAcademia.findUnique.mockResolvedValue({ ativo: true });
      mockPrisma.gymfyCheckIn.findFirst.mockResolvedValue(null);
      mockPrisma.gymfyConfiguracaoAcademia.findUnique.mockResolvedValue({ minimoCheckinsSemana: 3 });
      mockPrisma.gymfyCheckIn.count.mockResolvedValue(0);
      mockPrisma.gymfyCheckIn.create.mockResolvedValue({ id: 'checkin-1', pontosGanhos: 10 });
      mockPrisma.gymfyPonto.create.mockResolvedValue({});
      mockRanking.adicionarPontos.mockResolvedValue(undefined);
      mockPrisma.gymfyConquista.findFirst.mockResolvedValue(null);
    });

    it('deve rejeitar QR Code inválido', async () => {
      mockJwt.verify.mockImplementation(() => { throw new Error('invalid'); });
      await expect(service.validarCheckin('token-invalido', 'aluno-1')).rejects.toThrow(UnauthorizedException);
    });

    it('deve rejeitar aluno não vinculado à academia', async () => {
      mockPrisma.gymfyAlunoAcademia.findUnique.mockResolvedValue(null);
      await expect(service.validarCheckin('qr-token', 'aluno-1')).rejects.toThrow(UnauthorizedException);
    });

    it('deve rejeitar check-in duplicado no mesmo dia', async () => {
      mockPrisma.gymfyCheckIn.findFirst.mockResolvedValue({ id: 'checkin-existente' });
      await expect(service.validarCheckin('qr-token', 'aluno-1')).rejects.toThrow(ConflictException);
    });

    it('deve registrar check-in com 10 pontos base', async () => {
      const result = await service.validarCheckin('qr-token', 'aluno-1');
      expect(result.pontosGanhos).toBeGreaterThanOrEqual(10);
      expect(mockPrisma.gymfyCheckIn.create).toHaveBeenCalled();
      expect(mockPrisma.gymfyPonto.create).toHaveBeenCalled();
      expect(mockRanking.adicionarPontos).toHaveBeenCalledWith('academia-1', 'aluno-1', expect.any(Number));
    });

    it('deve adicionar bônus de primeiro treino da semana', async () => {
      mockPrisma.gymfyCheckIn.count.mockResolvedValue(0);
      const result = await service.validarCheckin('qr-token', 'aluno-1');
      expect(result.descricoes).toContain('Primeiro da semana (+5)');
    });
  });
});
