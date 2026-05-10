import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePremioDto, UpdatePremioDto } from './dto/premio.dto';

@Injectable()
export class PremiosService {
  constructor(private prisma: PrismaService) {}

  async create(academiaId: string, dto: CreatePremioDto) {
    return this.prisma.gymfyPremio.create({
      data: { academiaId, ...dto, estoque: dto.estoque ?? -1 },
    });
  }

  async findAll(academiaId: string) {
    return this.prisma.gymfyPremio.findMany({
      where: { academiaId, ativo: true },
      orderBy: { pontosNecessarios: 'asc' },
    });
  }

  async update(id: string, dto: UpdatePremioDto) {
    return this.prisma.gymfyPremio.update({ where: { id }, data: dto });
  }

  async resgatar(premioId: string, alunoId: string, academiaId: string) {
    const premio = await this.prisma.gymfyPremio.findUnique({ where: { id: premioId } });
    if (!premio || !premio.ativo) throw new NotFoundException('Prêmio não disponível');
    if (premio.estoque === 0) throw new BadRequestException('Prêmio sem estoque');

    const totalPontos = await this.prisma.gymfyPonto.aggregate({
      where: { alunoId, academiaId },
      _sum: { quantidade: true },
    });
    const pontos = totalPontos._sum.quantidade ?? 0;
    if (pontos < premio.pontosNecessarios) {
      throw new BadRequestException(`Pontos insuficientes. Necessário: ${premio.pontosNecessarios}, disponível: ${pontos}`);
    }

    const resgate = await this.prisma.gymfyResgate.create({
      data: { alunoId, premioId },
    });

    if (premio.estoque > 0) {
      await this.prisma.gymfyPremio.update({
        where: { id: premioId },
        data: { estoque: { decrement: 1 } },
      });
    }

    await this.prisma.gymfyPonto.create({
      data: {
        alunoId,
        academiaId,
        quantidade: -premio.pontosNecessarios,
        descricao: `Resgate: ${premio.nome}`,
      },
    });

    return resgate;
  }

  async getResgates(academiaId: string) {
    return this.prisma.gymfyResgate.findMany({
      where: { premio: { academiaId } },
      include: {
        aluno: { select: { id: true, nome: true, email: true } },
        premio: { select: { id: true, nome: true, pontosNecessarios: true } },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async atualizarStatusResgate(resgateId: string, status: string) {
    return this.prisma.gymfyResgate.update({
      where: { id: resgateId },
      data: { status: status as any },
    });
  }
}
