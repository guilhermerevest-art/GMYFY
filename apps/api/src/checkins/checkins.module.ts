import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [JwtModule, RankingModule],
  controllers: [CheckinsController],
  providers: [CheckinsService],
  exports: [CheckinsService],
})
export class CheckinsModule {}
