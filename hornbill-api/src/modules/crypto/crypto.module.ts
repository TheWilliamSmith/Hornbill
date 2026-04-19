import { Module } from '@nestjs/common';
import { CryptoController } from './controllers/crypto.controller';
import { CryptoPositionRepository } from './repositories/crypto-position.repository';
import { SellTargetRepository } from './repositories/sell-target.repository';
import { CryptoPositionService } from './services/crypto-position.service';
import { SellTargetService } from './services/sell-target.service';

@Module({
  controllers: [CryptoController],
  providers: [
    CryptoPositionRepository,
    SellTargetRepository,
    CryptoPositionService,
    SellTargetService,
  ],
})
export class CryptoModule {}
