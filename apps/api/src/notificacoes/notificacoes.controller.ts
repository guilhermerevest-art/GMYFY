import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificacoesService } from './notificacoes.service';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string }

@ApiTags('notificacoes')
@ApiBearerAuth()
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private service: NotificacoesService) {}

  @Get()
  getMinhas(@CurrentUser() user: AuthUser) {
    return this.service.getMinhas(user.id);
  }

  @Patch(':id/lida')
  marcarLida(@Param('id') id: string) {
    return this.service.marcarLida(id);
  }

  @Patch('todas/lidas')
  marcarTodasLidas(@CurrentUser() user: AuthUser) {
    return this.service.marcarTodasLidas(user.id);
  }
}
