import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesafioDto, UpdateDesafioDto } from './dto/desafio.dto';

@Injectable()
export class DesafiosService {
  constructor(private prisma: PrismaService) {}

  async create(academiaId: string, dto: CreateDesafioDto) {
    return this.prisma.gymfyDesafio.create({
      data: {
        academiaId,
        nome: dto.nome,
        descricao: dto.descricao,
        tipo: dto.tipo as any ?? 'INDIVIDUAL',
        metaCheckins: dto.metaCheckins,
        pontosBonus: dto.pontosBonus ?? 0,
        inicioEm: new Date(dto.inicioEm),
        fimEm: new Date(dto.fimEm),
      },
    });
  }

  async findAll(academiaId: string) {
    return this.prisma.gymfyDesafio.findMany({
      where: { academiaId },
      orderBy: { criadoEm: 'desc' },
      include: { _count: { select: { participantes: true } } },
    });
  }

  async findById(id: string) {
    const desafio = await this.prisma.gymfyDesafio.findUnique({
      where: { id },
      include: { participantes: { include: { aluno: { select: { id: true, nome: true, avatarUrl: true } } } } },
    });
    if (!desafio) throw new NotFoundException('Desafio não encontrado');
    return desafio;
  }

  async update(id: string, dto: UpdateDesafioDto) {
    await this.findById(id);
    return this.prisma.gymfyDesafio.update({ where: { id }, data: dto });
  }

  async ativar(id: string) {
    return this.prisma.gymfyDesafio.update({ where: { id }, data: { status: 'ATIVO' } });
  }

  async finalizar(id: string) {
    return this.prisma.gymfyDesafio.update({ where: { id }, data: { status: 'FINALIZADO' } });
  }

  async participar(desafioId: string, alunoId: string) {
    return this.prisma.gymfyDesafioParticipante.upsert({
      where: { desafioId_alunoId: { desafioId, alunoId } },
      create: { desafioId, alunoId },
      update: {},
    });
  }

  async atualizarProgresso(desafioId: string, alunoId: string) {
    const participante = await this.prisma.gymfyDesafioParticipante.findUnique({
      where: { desafioId_alunoId: { desafioId, alunoId } },
    });
    if (!participante) return;

    const desafio = await this.prisma.gymfyDesafio.findUnique({ where: { id: desafioId } });
    const novoProgresso = participante.progresso + 1;
    const concluido = desafio?.metaCheckins ? novoProgresso >= desafio.metaCheckins : false;

    await this.prisma.gymfyDesafioParticipante.update({
      where: { desafioId_alunoId: { desafioId, alunoId } },
      data: { progresso: novoProgresso, concluido },
    });
  }

  async getDesafiosAtivos(academiaId: string) {
    return this.prisma.gymfyDesafio.findMany({
      where: { academiaId, status: 'ATIVO', fimEm: { gte: new Date() } },
      include: { _count: { select: { participantes: true } } },
    });
  }
}
