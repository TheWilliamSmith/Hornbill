import { Module } from '@nestjs/common';
import { CryptoController } from './controllers/crypto.controller';
import { CryptoPositionRepository } from './repositories/crypto-position.repository';
import { SellTargetRepository } from './repositories/sell-target.repository';
import { SellExecutionRepository } from './repositories/sell-execution.repository';
import { CryptoPositionService } from './services/crypto-position.service';
import { SellTargetService } from './services/sell-target.service';
import { SellExecutionService } from './services/sell-execution.service';
import { PriceFetcherService } from './services/price-fetcher.service';
import { TargetCheckerService } from './services/target-checker.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [CryptoController],
  providers: [
    CryptoPositionRepository,
    SellTargetRepository,
    SellExecutionRepository,
    CryptoPositionService,
    SellTargetService,
    SellExecutionService,
    PriceFetcherService,
    TargetCheckerService,
  ],
})
export class CryptoModule {}
