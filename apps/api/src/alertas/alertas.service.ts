import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CHURN_DIAS_RISCO_BAIXO, CHURN_DIAS_RISCO_MEDIO, CHURN_DIAS_RISCO_ALTO, RiscoChurn } from '@gymfy/shared';

@Injectable()
export class AlertasService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calcularChurnScores() {
    const academias = await this.prisma.gymfyAcademia.findMany({ where: { ativo: true } });
    for (const academia of academias) {
      await this.processarAcademia(academia.id);
    }
  }

  private async processarAcademia(academiaId: string) {
    const alunos = await this.prisma.gymfyAlunoAcademia.findMany({
      where: { academiaId, ativo: true },
      select: { alunoId: true },
    });

    for (const { alunoId } of alunos) {
      const ultimoCheckin = await this.prisma.gymfyCheckIn.findFirst({
        where: { alunoId, academiaId },
        orderBy: { criadoEm: 'desc' },
      });

      if (!ultimoCheckin) continue;

      const diasSemCheckin = Math.floor(
        (Date.now() - ultimoCheckin.criadoEm.getTime()) / (1000 * 60 * 60 * 24),
      );

      let risco: RiscoChurn;
      if (diasSemCheckin >= CHURN_DIAS_RISCO_ALTO) risco = RiscoChurn.RISCO_ALTO;
      else if (diasSemCheckin >= CHURN_DIAS_RISCO_MEDIO) risco = RiscoChurn.RISCO_MEDIO;
      else if (diasSemCheckin >= CHURN_DIAS_RISCO_BAIXO) risco = RiscoChurn.RISCO_BAIXO;
      else continue;

      await this.prisma.gymfyAlertaChurn.create({
        data: { alunoId, academiaId, risco, diasSemCheckin },
      });
    }
  }

  async getAlunosEmRisco(academiaId: string, risco?: string) {
    const where: any = { academiaId };
    if (risco) where.risco = risco;

    const alertas = await this.prisma.gymfyAlertaChurn.findMany({
      where,
      include: {
        aluno: { select: { id: true, nome: true, email: true, avatarUrl: true } },
      },
      orderBy: [{ risco: 'desc' }, { diasSemCheckin: 'desc' }],
      distinct: ['alunoId'],
    });

    return alertas;
  }

  async marcarAcaoTomada(alertaId: string) {
    return this.prisma.gymfyAlertaChurn.update({
      where: { id: alertaId },
      data: { acaoTomada: true },
    });
  }
}
