import { Module } from '@nestjs/common';
import { PremiosController } from './premios.controller';
import { PremiosService } from './premios.service';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsAppModule],
  controllers: [PremiosController],
  providers: [PremiosService],
  exports: [PremiosService],
})
export class PremiosModule {}
