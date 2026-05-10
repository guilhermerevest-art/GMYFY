import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, CreateReacaoDto } from './dto/feed.dto';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async createPost(autorId: string, academiaId: string, dto: CreatePostDto) {
    return this.prisma.gymfyFeedPost.create({
      data: { autorId, academiaId, ...dto },
      include: { autor: { select: { id: true, nome: true, avatarUrl: true } } },
    });
  }

  async getFeed(academiaId: string, cursor?: string, limit = 20) {
    const posts = await this.prisma.gymfyFeedPost.findMany({
      where: { academiaId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { criadoEm: 'desc' },
      include: {
        autor: { select: { id: true, nome: true, avatarUrl: true } },
        reacoes: true,
        _count: { select: { reacoes: true } },
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return { items, nextCursor, hasMore };
  }

  async reagir(postId: string, autorId: string, dto: CreateReacaoDto) {
    return this.prisma.gymfyFeedReacao.upsert({
      where: { postId_autorId: { postId, autorId } },
      create: { postId, autorId, tipo: dto.tipo as any },
      update: { tipo: dto.tipo as any },
    });
  }

  async removerReacao(postId: string, autorId: string) {
    return this.prisma.gymfyFeedReacao.delete({
      where: { postId_autorId: { postId, autorId } },
    });
  }

  async deletePost(id: string) {
    return this.prisma.gymfyFeedPost.delete({ where: { id } });
  }
}
