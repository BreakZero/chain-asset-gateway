import { EVM_CHAIN_IDS } from '@/config/constants';
import type { Portfolio } from '@/domain/portfolio';
import { EthereumBalanceService } from '@/services/ethereum-balance.service';
import { nowIso } from '@/utils/time';

export class PortfolioService {
  constructor(
    private readonly chainId = EVM_CHAIN_IDS.ETHEREUM_MAINNET,
    private readonly ethereumBalanceService: EthereumBalanceService = new EthereumBalanceService(chainId),
  ) {}

  async getEthereumPortfolio(address: string): Promise<Portfolio> {
    const nativeBalance = await this.ethereumBalanceService.getNativeBalance(address, true);

    return {
      chain: 'ethereum',
      chainId: this.chainId,
      address: address.toLowerCase(),
      items: [
        {
          chain: 'ethereum',
          chainId: this.chainId,
          address: address.toLowerCase(),
          balance: nativeBalance,
          includedInTotal: true,
        },
      ],
      totalValueUsd: nativeBalance.valueUsd,
      source: 'ethereum-rpc',
      updatedAt: nowIso(),
      warnings: [
        'ERC20 auto-discovery is not implemented in this MVP. Raw Ethereum JSON-RPC alone is not sufficient for reliable wallet-wide token discovery without an indexer or curated token list.',
      ],
    };
  }
}
