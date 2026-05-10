import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PontosService } from './pontos.service';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('pontos')
@ApiBearerAuth()
@Controller('pontos')
export class PontosController {
  constructor(private service: PontosService) {}

  @Get('total')
  getTotal(@CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    return this.service.getTotalPontos(user.id, academiaId ?? user.academiaId ?? '');
  }

  @Get('historico')
  getHistorico(@CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    return this.service.getHistorico(user.id, academiaId ?? user.academiaId ?? '');
  }

  @Get('mensal')
  getMensal(@CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    return this.service.getPontosMensal(user.id, academiaId ?? user.academiaId ?? '');
  }
}
