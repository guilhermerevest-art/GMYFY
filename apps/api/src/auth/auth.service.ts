import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { TipoUsuario, SISTEMA_ID } from '../shared/constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.prisma.gymfyUsuario.findUnique({
      where: { email: dto.email },
    });
    if (existe) throw new ConflictException('E-mail já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.gymfyUsuario.create({
      data: {
        sistemaId: SISTEMA_ID,
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        tipo: dto.tipo ?? TipoUsuario.ALUNO,
        academiaId: dto.academiaId ?? null,
      },
    });

    if (dto.academiaId && dto.tipo === TipoUsuario.ALUNO) {
      await this.prisma.gymfyAlunoAcademia.create({
        data: { alunoId: usuario.id, academiaId: dto.academiaId },
      });
    }

    return this.gerarToken(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.gymfyUsuario.findUnique({
      where: { email: dto.email },
    });
    if (!usuario || !usuario.senhaHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) throw new UnauthorizedException('Credenciais inválidas');

    return this.gerarToken(usuario);
  }

  private gerarToken(usuario: { id: string; email: string; tipo: string; academiaId: string | null }) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      academiaId: usuario.academiaId,
    };
    return {
      access_token: this.jwt.sign(payload),
      usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
    };
  }
}
