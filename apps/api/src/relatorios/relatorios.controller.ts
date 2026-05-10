import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('relatorios')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private service: RelatoriosService) {}

  @Get('mensal')
  getMensal(@CurrentUser() user: AuthUser, @Query('mes') mes?: string, @Query('ano') ano?: string) {
    return this.service.getRelatorioMensal(
      user.academiaId ?? '',
      mes ? parseInt(mes, 10) : undefined,
      ano ? parseInt(ano, 10) : undefined,
    );
  }

  @Get('frequencia')
  getFrequencia(@CurrentUser() user: AuthUser, @Query('dias') dias?: string) {
    return this.service.getFrequencia(user.academiaId ?? '', dias ? parseInt(dias, 10) : 30);
  }

  @Get('roi')
  getRoi(@CurrentUser() user: AuthUser) {
    return this.service.calcularRoi(user.academiaId ?? '');
  }
}
