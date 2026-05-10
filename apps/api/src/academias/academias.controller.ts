import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AcademiasService } from './academias.service';
import { CreateAcademiaDto, UpdateAcademiaDto, UpdateConfiguracaoDto } from './dto/academia.dto';
import { CurrentUser } from '../auth/decorators';

interface AuthUser {
  id: string;
  academiaId: string | null;
}

@ApiTags('academias')
@ApiBearerAuth()
@Controller('academias')
export class AcademiasController {
  constructor(private service: AcademiasService) {}

  @Post()
  create(@Body() dto: CreateAcademiaDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAcademiaDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/configuracoes')
  updateConfiguracao(@Param('id') id: string, @Body() dto: UpdateConfiguracaoDto) {
    return this.service.updateConfiguracao(id, dto);
  }

  @Get(':id/alunos')
  getAlunos(@Param('id') id: string) {
    return this.service.getAlunos(id);
  }

  @Post(':id/alunos/:alunoId')
  convidarAluno(@Param('id') id: string, @Param('alunoId') alunoId: string) {
    return this.service.convidarAluno(id, alunoId);
  }
}
