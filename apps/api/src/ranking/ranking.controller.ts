import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('ranking')
@ApiBearerAuth()
@Controller('ranking')
export class RankingController {
  constructor(private service: RankingService) {}

  @Get()
  getRanking(
    @CurrentUser() user: AuthUser,
    @Query('academia_id') academiaId?: string,
    @Query('periodo') periodo?: string,
    @Query('limit') limit?: string,
  ) {
    const id = academiaId ?? user.academiaId ?? '';
    return this.service.getRanking(id, periodo, limit ? parseInt(limit, 10) : 10);
  }

  @Get('me')
  getPosicao(@CurrentUser() user: AuthUser, @Query('academia_id') academiaId?: string) {
    const id = academiaId ?? user.academiaId ?? '';
    return this.service.getPosicaoAluno(id, user.id);
  }
}
