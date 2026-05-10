import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

const mockRedis = {
  zincrby: jest.fn(),
  hset: jest.fn(),
  zrevrange: jest.fn(),
  hget: jest.fn(),
  zrevrank: jest.fn(),
  zscore: jest.fn(),
  del: jest.fn(),
  rankingKey: jest.fn().mockReturnValue('gymfy:ranking:academia-1:2025-01'),
  rankingTsKey: jest.fn().mockReturnValue('gymfy:ranking_ts:academia-1:2025-01'),
};

const mockPrisma = {
  gymfyAcademia: { findMany: jest.fn() },
  gymfyUsuario: { findMany: jest.fn() },
  gymfyRankingHistorico: { create: jest.fn() },
};

describe('RankingService', () => {
  let service: RankingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        { provide: RedisService, useValue: mockRedis },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    jest.clearAllMocks();
  });

  describe('adicionarPontos', () => {
    it('deve chamar ZINCRBY no Redis com os pontos corretos', async () => {
      mockRedis.zincrby.mockResolvedValue('25');
      mockRedis.hset.mockResolvedValue(1);

      await service.adicionarPontos('academia-1', 'aluno-1', 15);

      expect(mockRedis.zincrby).toHaveBeenCalledWith(
        expect.any(String),
        15,
        'aluno-1',
      );
    });
  });

  describe('getRanking', () => {
    it('deve desempatar por check-in mais recente quando pontos iguais', async () => {
      const tsAluno1 = Date.now() - 1000;
      const tsAluno2 = Date.now();

      mockRedis.zrevrange.mockResolvedValue(['aluno-1', '100', 'aluno-2', '100']);
      mockRedis.hget
        .mockResolvedValueOnce(tsAluno1.toString())
        .mockResolvedValueOnce(tsAluno2.toString());
      mockPrisma.gymfyUsuario.findMany.mockResolvedValue([
        { id: 'aluno-1', nome: 'João', avatarUrl: null },
        { id: 'aluno-2', nome: 'Maria', avatarUrl: null },
      ]);

      const ranking = await service.getRanking('academia-1');

      expect(ranking[0]!.alunoId).toBe('aluno-2');
      expect(ranking[1]!.alunoId).toBe('aluno-1');
    });

    it('deve retornar posições corretas', async () => {
      mockRedis.zrevrange.mockResolvedValue(['aluno-1', '50', 'aluno-2', '30']);
      mockRedis.hget.mockResolvedValue(Date.now().toString());
      mockPrisma.gymfyUsuario.findMany.mockResolvedValue([
        { id: 'aluno-1', nome: 'João', avatarUrl: null },
        { id: 'aluno-2', nome: 'Maria', avatarUrl: null },
      ]);

      const ranking = await service.getRanking('academia-1');

      expect(ranking[0]!.posicao).toBe(1);
      expect(ranking[1]!.posicao).toBe(2);
    });
  });

  describe('getPosicaoAluno', () => {
    it('deve retornar posição e pontos do aluno', async () => {
      mockRedis.zrevrank.mockResolvedValue(2);
      mockRedis.zscore.mockResolvedValue('75');

      const result = await service.getPosicaoAluno('academia-1', 'aluno-1');

      expect(result.posicao).toBe(3);
      expect(result.pontos).toBe(75);
    });

    it('deve retornar posição null quando aluno não está no ranking', async () => {
      mockRedis.zrevrank.mockResolvedValue(null);
      mockRedis.zscore.mockResolvedValue(null);

      const result = await service.getPosicaoAluno('academia-1', 'aluno-novo');

      expect(result.posicao).toBeNull();
      expect(result.pontos).toBe(0);
    });
  });
});
