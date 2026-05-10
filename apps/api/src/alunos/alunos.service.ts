import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlunosService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const aluno = await this.prisma.gymfyUsuario.findUnique({
      where: { id },
      select: {
        id: true, nome: true, email: true, avatarUrl: true, tipo: true, criadoEm: true,
        alunoAcademias: { include: { academia: { select: { id: true, nome: true, logoUrl: true } } } },
      },
    });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');
    return aluno;
  }

  async getPerfil(id: string, academiaId: string) {
    const aluno = await this.findById(id);
    const totalCheckins = await this.prisma.gymfyCheckIn.count({ where: { alunoId: id, academiaId } });
    const totalPontos = await this.prisma.gymfyPonto.aggregate({
      where: { alunoId: id, academiaId },
      _sum: { quantidade: true },
    });
    const conquistas = await this.prisma.gymfyConquistaAluno.findMany({
      where: { alunoId: id },
      include: { conquista: true },
    });
    return { ...aluno, totalCheckins, totalPontos: totalPontos._sum.quantidade ?? 0, conquistas };
  }

  async getHistorico(id: string, academiaId: string) {
    return this.prisma.gymfyCheckIn.findMany({
      where: { alunoId: id, academiaId },
      orderBy: { criadoEm: 'desc' },
      take: 50,
    });
  }

  async updateFcmToken(id: string, fcmToken: string) {
    return this.prisma.gymfyUsuario.update({ where: { id }, data: { fcmToken } });
  }
}
