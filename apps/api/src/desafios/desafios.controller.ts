import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DesafiosService } from './desafios.service';
import { CreateDesafioDto, UpdateDesafioDto } from './dto/desafio.dto';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('desafios')
@ApiBearerAuth()
@Controller('desafios')
export class DesafiosController {
  constructor(private service: DesafiosService) {}

  @Post()
  create(@Body() dto: CreateDesafioDto, @CurrentUser() user: AuthUser) {
    return this.service.create(user.academiaId ?? '', dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    return this.service.findAll(academiaId ?? user.academiaId ?? '');
  }

  @Get('ativos')
  getAtivos(@CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    return this.service.getDesafiosAtivos(academiaId ?? user.academiaId ?? '');
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDesafioDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/ativar')
  ativar(@Param('id') id: string) {
    return this.service.ativar(id);
  }

  @Patch(':id/finalizar')
  finalizar(@Param('id') id: string) {
    return this.service.finalizar(id);
  }

  @Post(':id/participar')
  participar(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.participar(id, user.id);
  }
}
