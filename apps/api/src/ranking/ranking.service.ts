import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingService {
  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  async adicionarPontos(academiaId: string, alunoId: string, pontos: number) {
    const periodo = this.getPeriodoAtual();
    const key = this.redis.rankingKey(academiaId, periodo);
    const tsKey = this.redis.rankingTsKey(academiaId, periodo);

    await this.redis.zincrby(key, pontos, alunoId);
    await this.redis.hset(tsKey, alunoId, Date.now().toString());
  }

  async getRanking(academiaId: string, periodo?: string, limit = 10) {
    const p = periodo ?? this.getPeriodoAtual();
    const key = this.redis.rankingKey(academiaId, p);
    const tsKey = this.redis.rankingTsKey(academiaId, p);

    const membros = await this.redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

    const ranking: Array<{ alunoId: string; pontos: number; posicao: number; ultimoCheckin: number }> = [];
    for (let i = 0; i < membros.length; i += 2) {
      const alunoId = membros[i]!;
      const pontos = parseInt(membros[i + 1]!, 10);
      const ts = await this.redis.hget(tsKey, alunoId);
      ranking.push({
        alunoId,
        pontos,
        posicao: Math.floor(i / 2) + 1,
        ultimoCheckin: ts ? parseInt(ts, 10) : 0,
      });
    }

    ranking.sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      return b.ultimoCheckin - a.ultimoCheckin;
    });

    ranking.forEach((item, idx) => { item.posicao = idx + 1; });

    const alunoIds = ranking.map((r) => r.alunoId);
    const alunos = await this.prisma.gymfyUsuario.findMany({
      where: { id: { in: alunoIds } },
      select: { id: true, nome: true, avatarUrl: true },
    });
    const alunoMap = new Map(alunos.map((a) => [a.id, a]));

    return ranking.map((r) => ({
      ...r,
      aluno: alunoMap.get(r.alunoId) ?? null,
    }));
  }

  async getPosicaoAluno(academiaId: string, alunoId: string) {
    const periodo = this.getPeriodoAtual();
    const key = this.redis.rankingKey(academiaId, periodo);
    const rank = await this.redis.zrevrank(key, alunoId);
    const pontos = await this.redis.zscore(key, alunoId);
    return {
      posicao: rank !== null ? rank + 1 : null,
      pontos: pontos ? parseInt(pontos, 10) : 0,
    };
  }

  @Cron('0 0 1 * *')
  async resetMensal() {
    const academias = await this.prisma.gymfyAcademia.findMany({ where: { ativo: true } });
    const periodoAnterior = this.getPeriodoAnterior();

    for (const academia of academias) {
      const key = this.redis.rankingKey(academia.id, periodoAnterior);
      const membros = await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');

      for (let i = 0; i < membros.length; i += 2) {
        const alunoId = membros[i]!;
        const pontos = parseInt(membros[i + 1]!, 10);
        await this.prisma.gymfyRankingHistorico.create({
          data: {
            alunoId,
            academiaId: academia.id,
            periodo: periodoAnterior,
            posicao: Math.floor(i / 2) + 1,
            pontos,
          },
        });
      }

      await this.redis.del(key);
      await this.redis.del(this.redis.rankingTsKey(academia.id, periodoAnterior));
    }
  }

  private getPeriodoAtual(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private getPeriodoAnterior(): string {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
