import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PontosService {
  constructor(private prisma: PrismaService) {}

  async getTotalPontos(alunoId: string, academiaId: string): Promise<number> {
    const result = await this.prisma.gymfyPonto.aggregate({
      where: { alunoId, academiaId },
      _sum: { quantidade: true },
    });
    return result._sum.quantidade ?? 0;
  }

  async getHistorico(alunoId: string, academiaId: string) {
    return this.prisma.gymfyPonto.findMany({
      where: { alunoId, academiaId },
      orderBy: { criadoEm: 'desc' },
      take: 50,
    });
  }

  async getPontosMensal(alunoId: string, academiaId: string) {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const result = await this.prisma.gymfyPonto.aggregate({
      where: { alunoId, academiaId, criadoEm: { gte: inicioMes } },
      _sum: { quantidade: true },
    });
    return result._sum.quantidade ?? 0;
  }
}
