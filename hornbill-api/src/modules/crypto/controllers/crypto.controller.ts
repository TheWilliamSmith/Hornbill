import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CryptoPositionService } from '../services/crypto-position.service';
import { SellTargetService } from '../services/sell-target.service';
import { SellExecutionService } from '../services/sell-execution.service';
import { PriceFetcherService } from '../services/price-fetcher.service';
import { CreateCryptoPositionDto } from '../dto/position-dto/create-position.dto';
import { GetPositionsQueryDto } from '../dto/position-dto/get-positions-query.dto';
import { CreateSellTargetDto } from '../dto/sell-target-dto/create-sell-target.dto';
import { UpdateSellTargetDto } from '../dto/sell-target-dto/update-sell-target.dto';
import { CreateSellExecutionDto } from '../dto/execution-dto/create-execution.dto';

@UseGuards(JwtAuthGuard)
@Controller('crypto')
export class CryptoController {
  constructor(
    private readonly positionService: CryptoPositionService,
    private readonly sellTargetService: SellTargetService,
    private readonly sellExecutionService: SellExecutionService,
    private readonly priceFetcher: PriceFetcherService,
  ) {}

  // ─── Positions ──────────────────────────────────────────

  @Post('positions')
  async createPosition(@Body() dto: CreateCryptoPositionDto, @CurrentUser('sub') userId: string) {
    return await this.positionService.createPosition(dto, userId);
  }

  @Get('positions')
  async getPositions(@CurrentUser('sub') userId: string, @Query() query: GetPositionsQueryDto) {
    return await this.positionService.getPositions(userId, query);
  }

  @Get('positions/:id')
  async getPosition(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return await this.positionService.getPosition(id, userId);
  }

  @Delete('positions/:id')
  async deletePosition(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return await this.positionService.deletePosition(id, userId);
  }

  // ─── Sell Targets ───────────────────────────────────────

  @Post('positions/:positionId/targets')
  async addSellTarget(
    @Param('positionId') positionId: string,
    @Body() dto: CreateSellTargetDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.sellTargetService.addTarget(positionId, dto, userId);
  }

  @Patch('targets/:targetId')
  async updateSellTarget(
    @Param('targetId') targetId: string,
    @Body() dto: UpdateSellTargetDto,
    @CurrentUser('sub') userId: string,
  ) {
    return await this.sellTargetService.updateTarget(targetId, dto, userId);
  }

  @Delete('targets/:targetId')
  async deleteSellTarget(@Param('targetId') targetId: string, @CurrentUser('sub') userId: string) {
    return await this.sellTargetService.deleteTarget(targetId, userId);
  }

  // ─── Sell Executions ────────────────────────────────────

  @Post('executions')
  async createExecution(@Body() dto: CreateSellExecutionDto, @CurrentUser('sub') userId: string) {
    return await this.sellExecutionService.createExecution(dto, userId);
  }

  @Get('positions/:positionId/executions')
  async getExecutions(@Param('positionId') positionId: string, @CurrentUser('sub') userId: string) {
    return await this.sellExecutionService.getExecutions(positionId, userId);
  }

  @Delete('executions/:executionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExecution(
    @Param('executionId') executionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.sellExecutionService.deleteExecution(executionId, userId);
  }

  // ─── Prices ─────────────────────────────────────────────

  @Get('prices')
  async getPrices() {
    return {
      prices: this.priceFetcher.getAllPrices(),
      lastFetchTime: this.priceFetcher.getLastFetchTime(),
    };
  }

  @Post('prices/refresh')
  async refreshPrices() {
    await this.priceFetcher.forceFetch();
    return {
      prices: this.priceFetcher.getAllPrices(),
      lastFetchTime: this.priceFetcher.getLastFetchTime(),
    };
  }
}
