import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AlunosService } from './alunos.service';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('alunos')
@ApiBearerAuth()
@Controller('alunos')
export class AlunosController {
  constructor(private service: AlunosService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.service.findById(user.id);
  }

  @Get('me/perfil')
  getPerfil(@CurrentUser() user: AuthUser) {
    return this.service.getPerfil(user.id, user.academiaId ?? '');
  }

  @Get('me/historico')
  getHistorico(@CurrentUser() user: AuthUser) {
    return this.service.getHistorico(user.id, user.academiaId ?? '');
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch('me/fcm-token')
  updateFcmToken(@CurrentUser() user: AuthUser, @Body('fcmToken') fcmToken: string) {
    return this.service.updateFcmToken(user.id, fcmToken);
  }
}
