import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export class EnviarMensagemDto {
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @IsString()
  @IsNotEmpty()
  texto!: string;

  @IsString()
  @IsOptional()
  nomeAluno?: string;
}

export class EnviarMensagemPersonalizadaDto {
  @IsString()
  @IsNotEmpty()
  alunoId!: string;

  @IsString()
  @IsNotEmpty()
  texto!: string;
}

@ApiTags('whatsapp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsapp: WhatsAppService) {}

  @Get('status')
  @ApiOperation({ summary: 'Verifica conexão com Evolution API' })
  async status() {
    return this.whatsapp.verificarConexao();
  }

  @Get('qrcode')
  @ApiOperation({ summary: 'Obtém QR Code para conectar instância WhatsApp' })
  async qrcode() {
    return this.whatsapp.obterQrCode();
  }

  @Post('enviar')
  @ApiOperation({ summary: 'Envia mensagem WhatsApp para um número' })
  async enviar(@Body() dto: EnviarMensagemDto) {
    const texto = dto.nomeAluno
      ? dto.texto.replace('{nome}', dto.nomeAluno)
      : dto.texto;
    return this.whatsapp.enviarMensagem(dto.numero, texto);
  }
}
