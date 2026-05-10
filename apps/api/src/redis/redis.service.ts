import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(configService: ConfigService) {
    super(configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 500, 3000);
      },
      lazyConnect: true,
    });

    // Register error handler BEFORE connect to avoid unhandled error events
    this.on('error', (err: Error) => {
      this.logger.warn(`Redis indisponível — ranking em tempo real desabilitado: ${err.message}`);
    });

    this.connect().catch(() => {});
  }

  async onModuleDestroy() {
    await this.quit().catch(() => {});
  }

  rankingKey(academiaId: string, periodo: string): string {
    return `gymfy:ranking:${academiaId}:${periodo}`;
  }

  rankingTsKey(academiaId: string, periodo: string): string {
    return `gymfy:ranking_ts:${academiaId}:${periodo}`;
  }
}
