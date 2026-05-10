import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { CreatePostDto, CreateReacaoDto } from './dto/feed.dto';
import { CurrentUser } from '../auth/decorators';

interface AuthUser { id: string; academiaId: string | null }

@ApiTags('feed')
@ApiBearerAuth()
@Controller('feed')
export class FeedController {
  constructor(private service: FeedService) {}

  @Post()
  createPost(@Body() dto: CreatePostDto, @CurrentUser() user: AuthUser) {
    return this.service.createPost(user.id, user.academiaId ?? '', dto);
  }

  @Get()
  getFeed(
    @CurrentUser() user: AuthUser,
    @Query('academia_id') academiaId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getFeed(
      academiaId ?? user.academiaId ?? '',
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post(':id/reacoes')
  reagir(@Param('id') id: string, @Body() dto: CreateReacaoDto, @CurrentUser() user: AuthUser) {
    return this.service.reagir(id, user.id, dto);
  }

  @Delete(':id/reacoes')
  removerReacao(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.removerReacao(id, user.id);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.service.deletePost(id);
  }
}
