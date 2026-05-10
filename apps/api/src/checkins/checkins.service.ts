import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';
import {
  PONTOS_BASE_CHECKIN,
  PONTOS_BONUS_PRIMEIRO_SEMANA,
  PONTOS_BONUS_SEMANA_PERFEITA,
  PONTOS_BONUS_FORA_PICO,
} from '@gymfy/shared';

interface QrPayload {
  academiaId: string;
  geradoEm: number;
  exp: number;
}

@Injectable()
export class CheckinsService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private rankingService: RankingService,
  ) {}

  async gerarQrCode(academiaId: string): Promise<string> {
    const payload: QrPayload = {
      academiaId,
      geradoEm: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_QR_SECRET'),
      expiresIn: '60s',
    });
  }

  async validarCheckin(qrToken: string, alunoId: string) {
    let payload: QrPayload;
    try {
      payload = this.jwt.verify<QrPayload>(qrToken, {
        secret: this.config.get<string>('JWT_QR_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('QR Code inválido ou expirado');
    }

    const { academiaId } = payload;

    const vinculo = await this.prisma.gymfyAlunoAcademia.findUnique({
      where: { alunoId_academiaId: { alunoId, academiaId } },
    });
    if (!vinculo || !vinculo.ativo) {
      throw new UnauthorizedException('Aluno não vinculado a esta academia');
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const checkinHoje = await this.prisma.gymfyCheckIn.findFirst({
      where: { alunoId, academiaId, criadoEm: { gte: hoje, lt: amanha } },
    });
    if (checkinHoje) throw new ConflictException('Já existe um check-in registrado hoje');

    const config = await this.prisma.gymfyConfiguracaoAcademia.findUnique({ where: { academiaId } });
    const foraHorarioPico = this.verificarForaPico(config?.horarioPicoInicio, config?.horarioPicoFim);

    const { pontos, descricoes } = await this.calcularPontos(alunoId, academiaId, foraHorarioPico);

    const checkin = await this.prisma.gymfyCheckIn.create({
      data: { alunoId, academiaId, pontosGanhos: pontos, foraHorarioPico },
    });

    await this.prisma.gymfyPonto.create({
      data: { alunoId, academiaId, checkInId: checkin.id, quantidade: pontos, descricao: descricoes.join(', ') },
    });

    await this.rankingService.adicionarPontos(academiaId, alunoId, pontos);

    await this.verificarConquistas(alunoId, academiaId);

    return { checkin, pontosGanhos: pontos, descricoes };
  }

  private verificarForaPico(inicio?: string | null, fim?: string | null): boolean {
    if (!inicio || !fim) return false;
    const agora = new Date();
    const hora = agora.getHours() * 60 + agora.getMinutes();
    const [hI, mI] = inicio.split(':').map(Number);
    const [hF, mF] = fim.split(':').map(Number);
    const picoInicio = (hI ?? 0) * 60 + (mI ?? 0);
    const picoFim = (hF ?? 0) * 60 + (mF ?? 0);
    return hora < picoInicio || hora > picoFim;
  }

  private async calcularPontos(alunoId: string, academiaId: string, foraHorarioPico: boolean) {
    let pontos = PONTOS_BASE_CHECKIN;
    const descricoes = ['Check-in (+10)'];

    const inicioSemana = this.getInicioSemana();
    const checkinsNaSemana = await this.prisma.gymfyCheckIn.count({
      where: { alunoId, academiaId, criadoEm: { gte: inicioSemana } },
    });

    if (checkinsNaSemana === 0) {
      pontos += PONTOS_BONUS_PRIMEIRO_SEMANA;
      descricoes.push('Primeiro da semana (+5)');
    }

    const config = await this.prisma.gymfyConfiguracaoAcademia.findUnique({ where: { academiaId } });
    const meta = config?.minimoCheckinsSemana ?? 3;
    if (checkinsNaSemana + 1 >= meta) {
      pontos += PONTOS_BONUS_SEMANA_PERFEITA;
      descricoes.push(`Semana perfeita (+${PONTOS_BONUS_SEMANA_PERFEITA})`);
    }

    if (foraHorarioPico) {
      pontos += PONTOS_BONUS_FORA_PICO;
      descricoes.push('Fora do horário de pico (+3)');
    }

    return { pontos, descricoes };
  }

  private getInicioSemana(): Date {
    const hoje = new Date();
    const dia = hoje.getDay();
    const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);
    const segunda = new Date(hoje.setDate(diff));
    segunda.setHours(0, 0, 0, 0);
    return segunda;
  }

  private async verificarConquistas(alunoId: string, academiaId: string) {
    const total = await this.prisma.gymfyCheckIn.count({ where: { alunoId, academiaId } });
    const marcos = [10, 25, 50, 100];
    for (const marco of marcos) {
      if (total === marco) {
        const conquista = await this.prisma.gymfyConquista.findFirst({ where: { valor: marco } });
        if (conquista) {
          await this.prisma.gymfyConquistaAluno.upsert({
            where: { alunoId_conquistaId: { alunoId, conquistaId: conquista.id } },
            create: { alunoId, conquistaId: conquista.id },
            update: {},
          });
        }
      }
    }
  }

  async getHistorico(alunoId: string, academiaId: string) {
    return this.prisma.gymfyCheckIn.findMany({
      where: { alunoId, academiaId },
      orderBy: { criadoEm: 'desc' },
      take: 30,
    });
  }
}
