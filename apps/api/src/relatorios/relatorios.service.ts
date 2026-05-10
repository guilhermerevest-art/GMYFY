import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  async getRelatorioMensal(academiaId: string, mes?: number, ano?: number) {
    const now = new Date();
    const m = mes ?? now.getMonth() + 1;
    const a = ano ?? now.getFullYear();
    const inicio = new Date(a, m - 1, 1);
    const fim = new Date(a, m, 0, 23, 59, 59);

    const totalCheckins = await this.prisma.gymfyCheckIn.count({
      where: { academiaId, criadoEm: { gte: inicio, lte: fim } },
    });

    const alunosAtivos = await this.prisma.gymfyCheckIn.groupBy({
      by: ['alunoId'],
      where: { academiaId, criadoEm: { gte: inicio, lte: fim } },
      _count: { alunoId: true },
    });

    const topAlunos = await this.prisma.gymfyCheckIn.groupBy({
      by: ['alunoId'],
      where: { academiaId, criadoEm: { gte: inicio, lte: fim } },
      _count: { alunoId: true },
      orderBy: { _count: { alunoId: 'desc' } },
      take: 10,
    });

    const alunoIds = topAlunos.map((a) => a.alunoId);
    const alunos = await this.prisma.gymfyUsuario.findMany({
      where: { id: { in: alunoIds } },
      select: { id: true, nome: true, avatarUrl: true },
    });
    const alunoMap = new Map(alunos.map((a) => [a.id, a]));

    const totalResgates = await this.prisma.gymfyResgate.count({
      where: { premio: { academiaId }, criadoEm: { gte: inicio, lte: fim } },
    });

    return {
      periodo: `${a}-${String(m).padStart(2, '0')}`,
      totalCheckins,
      alunosAtivos: alunosAtivos.length,
      mediaCheckinsPorAluno: alunosAtivos.length > 0 ? (totalCheckins / alunosAtivos.length).toFixed(1) : 0,
      totalResgates,
      topAlunos: topAlunos.map((t) => ({
        aluno: alunoMap.get(t.alunoId),
        checkins: t._count.alunoId,
      })),
    };
  }

  async getFrequencia(academiaId: string, dias = 30) {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - dias);

    const checkins = await this.prisma.gymfyCheckIn.findMany({
      where: { academiaId, criadoEm: { gte: inicio } },
      select: { criadoEm: true },
    });

    const porDia = new Map<string, number>();
    for (const c of checkins) {
      const dia = c.criadoEm.toISOString().split('T')[0]!;
      porDia.set(dia, (porDia.get(dia) ?? 0) + 1);
    }

    return Array.from(porDia.entries())
      .map(([data, total]) => ({ data, total }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  async calcularRoi(academiaId: string) {
    const totalPontosResgatados = await this.prisma.gymfyResgate.count({
      where: { premio: { academiaId }, status: 'ENTREGUE' },
    });

    const alunosAtivos30d = await this.prisma.gymfyCheckIn.groupBy({
      by: ['alunoId'],
      where: {
        academiaId,
        criadoEm: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    return {
      alunosAtivos30d: alunosAtivos30d.length,
      totalResgatesEntregues: totalPontosResgatados,
      estimativaRetencao: `${Math.min(alunosAtivos30d.length * 0.3, 100).toFixed(0)}%`,
    };
  }
}
