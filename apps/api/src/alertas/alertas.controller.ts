import { Controller, Get, Param, Patch, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AlertasService } from './alertas.service';
import { CurrentUser } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthUser { id: string; academiaId: string | null }

export class EnviarMensagemAlunoDto {
  @IsString()
  @IsNotEmpty()
  texto!: string;
}

@ApiTags('alertas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private service: AlertasService) {}

  @Get('churn')
  @ApiOperation({ summary: 'Lista alunos em risco de churn' })
  getAlunosEmRisco(@CurrentUser() user: AuthUser, @Query('risco') risco?: string) {
    return this.service.getAlunosEmRisco(user.academiaId ?? '', risco);
  }

  @Patch(':id/acao')
  @ApiOperation({ summary: 'Marca alerta como ação tomada' })
  marcarAcao(@Param('id') id: string) {
    return this.service.marcarAcaoTomada(id);
  }

  @Post(':alunoId/mensagem')
  @ApiOperation({ summary: 'Envia mensagem WhatsApp manual para aluno em risco' })
  enviarMensagem(
    @CurrentUser() user: AuthUser,
    @Param('alunoId') alunoId: string,
    @Body() dto: EnviarMensagemAlunoDto,
  ) {
    return this.service.enviarMensagemManual(user.academiaId ?? '', alunoId, dto.texto);
  }
}
