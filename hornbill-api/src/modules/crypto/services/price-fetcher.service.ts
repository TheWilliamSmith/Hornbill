import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TargetCheckerService } from './target-checker.service';

/**
 * Mapping des symboles de notre app vers les IDs CoinGecko
 */
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  POL: 'matic-network',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  ADA: 'cardano',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  UNI: 'uniswap',
};

@Injectable()
export class PriceFetcherService implements OnModuleInit {
  private readonly logger = new Logger(PriceFetcherService.name);
  private priceCache: Map<string, number> = new Map();
  private lastFetchTime: Date | null = null;

  constructor(private readonly targetChecker: TargetCheckerService) {}

  /**
   * Fetch initial au démarrage du serveur
   */
  async onModuleInit() {
    this.logger.log('Initializing price fetcher...');
    await this.fetchPrices();
  }

  /**
   * Cron job qui tourne toutes les 60 secondes
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async fetchPrices() {
    this.logger.log('Fetching crypto prices from CoinGecko...');

    try {
      // Récupérer tous les symboles uniques
      const symbols = Object.keys(SYMBOL_TO_COINGECKO_ID);
      const coinGeckoIds = symbols.map((s) => SYMBOL_TO_COINGECKO_ID[s]);
      const uniqueIds = [...new Set(coinGeckoIds)].join(',');

      // Appel à l'API CoinGecko (gratuit, max 30 calls/min)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds}&vs_currencies=eur`,
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Mettre à jour le cache
      for (const symbol of symbols) {
        const coinGeckoId = SYMBOL_TO_COINGECKO_ID[symbol];
        const priceData = data[coinGeckoId];
        if (priceData && priceData.eur) {
          this.priceCache.set(symbol, priceData.eur);
        }
      }

      this.lastFetchTime = new Date();
      this.logger.log(`Fetched ${this.priceCache.size} prices successfully`);

      // Déclencher le target checker après chaque fetch
      await this.targetChecker.checkTargets(this.priceCache);
    } catch (error) {
      this.logger.error('Failed to fetch prices from CoinGecko', error);
    }
  }

  /**
   * Récupérer le prix actuel d'une crypto depuis le cache
   */
  getPrice(symbol: string): number | null {
    return this.priceCache.get(symbol.toUpperCase()) ?? null;
  }

  /**
   * Forcer un fetch immédiat (utile pour les tests ou au démarrage)
   */
  async forceFetch(): Promise<void> {
    await this.fetchPrices();
  }

  /**
   * Récupérer tous les prix
   */
  getAllPrices(): Record<string, number> {
    const prices: Record<string, number> = {};
    this.priceCache.forEach((price, symbol) => {
      prices[symbol] = price;
    });
    return prices;
  }

  /**
   * Informations sur le dernier fetch
   */
  getLastFetchTime(): Date | null {
    return this.lastFetchTime;
  }
}
