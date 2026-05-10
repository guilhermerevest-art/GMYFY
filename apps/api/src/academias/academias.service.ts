import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademiaDto, UpdateAcademiaDto, UpdateConfiguracaoDto } from './dto/academia.dto';
import { SISTEMA_ID } from '@gymfy/shared';

@Injectable()
export class AcademiasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAcademiaDto, usuarioId: string) {
    const slugExiste = await this.prisma.gymfyAcademia.findUnique({ where: { slug: dto.slug } });
    if (slugExiste) throw new ConflictException('Slug já em uso');

    const academia = await this.prisma.gymfyAcademia.create({
      data: {
        sistemaId: SISTEMA_ID,
        nome: dto.nome,
        slug: dto.slug,
        email: dto.email,
        telefone: dto.telefone,
        endereco: dto.endereco,
        logoUrl: dto.logoUrl,
        corPrimaria: dto.corPrimaria,
      },
    });

    await this.prisma.gymfyUsuario.update({
      where: { id: usuarioId },
      data: { academiaId: academia.id },
    });

    await this.prisma.gymfyConfiguracaoAcademia.create({
      data: { academiaId: academia.id },
    });

    return academia;
  }

  async findById(id: string) {
    const academia = await this.prisma.gymfyAcademia.findUnique({
      where: { id },
      include: { configuracoes: true },
    });
    if (!academia) throw new NotFoundException('Academia não encontrada');
    return academia;
  }

  async update(id: string, dto: UpdateAcademiaDto) {
    await this.findById(id);
    return this.prisma.gymfyAcademia.update({ where: { id }, data: dto });
  }

  async updateConfiguracao(academiaId: string, dto: UpdateConfiguracaoDto) {
    return this.prisma.gymfyConfiguracaoAcademia.upsert({
      where: { academiaId },
      create: { academiaId, ...dto },
      update: dto,
    });
  }

  async getAlunos(academiaId: string) {
    return this.prisma.gymfyAlunoAcademia.findMany({
      where: { academiaId, ativo: true },
      include: { aluno: { select: { id: true, nome: true, email: true, avatarUrl: true } } },
    });
  }

  async convidarAluno(academiaId: string, alunoId: string) {
    const existe = await this.prisma.gymfyAlunoAcademia.findUnique({
      where: { alunoId_academiaId: { alunoId, academiaId } },
    });
    if (existe) {
      return this.prisma.gymfyAlunoAcademia.update({
        where: { alunoId_academiaId: { alunoId, academiaId } },
        data: { ativo: true },
      });
    }
    return this.prisma.gymfyAlunoAcademia.create({ data: { alunoId, academiaId } });
  }
}
