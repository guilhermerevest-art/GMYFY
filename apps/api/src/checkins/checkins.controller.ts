import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckinsService } from './checkins.service';
import { ValidarCheckinDto } from './dto/checkin.dto';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('checkins')
@ApiBearerAuth()
@Controller('checkins')
export class CheckinsController {
  constructor(private service: CheckinsService) {}

  @Post()
  validarCheckin(@Body() dto: ValidarCheckinDto, @CurrentUser() user: AuthUser) {
    return this.service.validarCheckin(dto.qrToken, user.id);
  }

  @Get('qr/:academiaId')
  gerarQrCode(@Param('academiaId') academiaId: string) {
    return this.service.gerarQrCode(academiaId);
  }

  @Get()
  getHistorico(@CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    return this.service.getHistorico(user.id, academiaId ?? user.academiaId ?? '');
  }
}
