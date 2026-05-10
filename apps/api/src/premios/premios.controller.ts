import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PremiosService } from './premios.service';
import { CreatePremioDto, UpdatePremioDto } from './dto/premio.dto';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('premios')
@ApiBearerAuth()
@Controller('premios')
export class PremiosController {
  constructor(private service: PremiosService) {}

  @Post()
  create(@Body() dto: CreatePremioDto, @CurrentUser() user: AuthUser) {
    return this.service.create(user.academiaId ?? '', dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    return this.service.findAll(academiaId ?? user.academiaId ?? '');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePremioDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/resgatar')
  resgatar(@Param('id') id: string, @CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    return this.service.resgatar(id, user.id, academiaId ?? user.academiaId ?? '');
  }

  @Get('resgates')
  getResgates(@CurrentUser() user: AuthUser) {
    return this.service.getResgates(user.academiaId ?? '');
  }

  @Patch('resgates/:id/status')
  atualizarStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.atualizarStatusResgate(id, status);
  }
}
