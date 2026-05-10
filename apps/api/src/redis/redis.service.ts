import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    super(configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379');
  }

  async onModuleDestroy() {
    await this.quit();
  }

  rankingKey(academiaId: string, periodo: string): string {
    return `gymfy:ranking:${academiaId}:${periodo}`;
  }

  rankingTsKey(academiaId: string, periodo: string): string {
    return `gymfy:ranking_ts:${academiaId}:${periodo}`;
  }
}
