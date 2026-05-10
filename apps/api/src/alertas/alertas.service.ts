import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CHURN_DIAS_RISCO_BAIXO, CHURN_DIAS_RISCO_MEDIO, CHURN_DIAS_RISCO_ALTO, RiscoChurn } from '@gymfy/shared';

@Injectable()
export class AlertasService {
  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calcularChurnScores() {
    const academias = await this.prisma.gymfyAcademia.findMany({ where: { ativo: true } });
    for (const academia of academias) {
      await this.processarAcademia(academia.id);
    }
  }

  private async processarAcademia(academiaId: string) {
    const academia = await this.prisma.gymfyAcademia.findUnique({ where: { id: academiaId } });
    if (!academia) return;

    const alunos = await this.prisma.gymfyAlunoAcademia.findMany({
      where: { academiaId, ativo: true },
      include: { aluno: { select: { id: true, nome: true, telefone: true } } },
    });

    for (const { aluno } of alunos) {
      const ultimoCheckin = await this.prisma.gymfyCheckIn.findFirst({
        where: { alunoId: aluno.id, academiaId },
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
        data: { alunoId: aluno.id, academiaId, risco, diasSemCheckin },
      });

      // Envio automático de WhatsApp para risco médio e alto
      if (aluno.telefone && risco !== RiscoChurn.RISCO_BAIXO) {
        const texto =
          risco === RiscoChurn.RISCO_ALTO
            ? this.whatsapp.mensagemChurnRiscoAlto(aluno.nome, academia.nome, diasSemCheckin)
            : this.whatsapp.mensagemChurnRiscoMedio(aluno.nome, academia.nome, diasSemCheckin);

        await this.whatsapp.enviarMensagem(aluno.telefone, texto);
      }
    }
  }

  async getAlunosEmRisco(academiaId: string, risco?: string) {
    const where: Record<string, unknown> = { academiaId };
    if (risco) where['risco'] = risco;

    return this.prisma.gymfyAlertaChurn.findMany({
      where,
      include: {
        aluno: { select: { id: true, nome: true, email: true, avatarUrl: true } },
      },
      orderBy: [{ risco: 'desc' }, { diasSemCheckin: 'desc' }],
      distinct: ['alunoId'],
    });
  }

  async marcarAcaoTomada(alertaId: string) {
    return this.prisma.gymfyAlertaChurn.update({
      where: { id: alertaId },
      data: { acaoTomada: true },
    });
  }

  async enviarMensagemManual(academiaId: string, alunoId: string, texto: string) {
    const academia = await this.prisma.gymfyAcademia.findUnique({ where: { id: academiaId } });
    const aluno = await this.prisma.gymfyUsuario.findUnique({ where: { id: alunoId } });

    if (!academia || !aluno?.telefone) {
      return { enviado: false, motivo: 'Aluno sem telefone cadastrado' };
    }

    const mensagem = this.whatsapp.mensagemPersonalizada(aluno.nome, texto, academia.nome);
    const resultado = await this.whatsapp.enviarMensagem(aluno.telefone, mensagem);

    return { enviado: !!resultado };
  }
}
