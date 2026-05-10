import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { AcademiasModule } from './academias/academias.module';
import { AlunosModule } from './alunos/alunos.module';
import { CheckinsModule } from './checkins/checkins.module';
import { PontosModule } from './pontos/pontos.module';
import { RankingModule } from './ranking/ranking.module';
import { DesafiosModule } from './desafios/desafios.module';
import { PremiosModule } from './premios/premios.module';
import { AlertasModule } from './alertas/alertas.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { FeedModule } from './feed/feed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    AcademiasModule,
    AlunosModule,
    CheckinsModule,
    PontosModule,
    RankingModule,
    DesafiosModule,
    PremiosModule,
    AlertasModule,
    NotificacoesModule,
    RelatoriosModule,
    FeedModule,
  ],
})
export class AppModule {}
