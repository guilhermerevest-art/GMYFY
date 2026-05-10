import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AlertasService } from './alertas.service';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('alertas')
@ApiBearerAuth()
@Controller('alertas')
export class AlertasController {
  constructor(private service: AlertasService) {}

  @Get('churn')
  getAlunosEmRisco(@CurrentUser() user: AuthUser, @Query('risco') risco?: string) {
    return this.service.getAlunosEmRisco(user.academiaId ?? '', risco);
  }

  @Patch(':id/acao')
  marcarAcao(@Param('id') id: string) {
    return this.service.marcarAcaoTomada(id);
  }
}
