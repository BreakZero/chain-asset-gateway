import { CHAINS } from '@/config/constants';
import type { TransactionDetail } from '@/domain/transaction';
import type { BitcoinTransactionRaw } from '@/providers/bitcoin/bitcoin.types';
import type { EvmTransactionRaw } from '@/providers/evm/evm.types';
import { formatTokenAmount } from '@/utils/amount';
import { nowIso } from '@/utils/time';

export const mapEvmTransactionToDetail = (tx: EvmTransactionRaw): TransactionDetail => {
  const effectiveGasPrice = tx.effectiveGasPrice ?? tx.gasPrice;
  const gasForFee = tx.gasUsed ?? tx.gas;
  const feeRaw = effectiveGasPrice ? (gasForFee * effectiveGasPrice).toString() : null;

  return {
    chain: CHAINS.ETHEREUM,
    chainId: tx.chainId,
    hash: tx.hash,
    status: tx.status,
    blockNumber: tx.blockNumber?.toString() ?? null,
    from: tx.from,
    to: tx.to,
    valueRaw: tx.value.toString(),
    valueFormatted: formatTokenAmount(tx.value, 18),
    decimals: 18,
    feeRaw,
    feeFormatted: feeRaw ? formatTokenAmount(BigInt(feeRaw), 18) : null,
    symbol: 'ETH',
    raw: {
      ...tx.raw,
      blockHash: tx.blockHash,
      transactionIndex: tx.transactionIndex,
    },
    updatedAt: nowIso(),
    source: 'ethereum-rpc',
  };
};

export const mapBitcoinTransactionToDetail = (tx: BitcoinTransactionRaw): TransactionDetail => ({
  chain: CHAINS.BITCOIN,
  chainId: null,
  hash: tx.txid,
  status: typeof tx.confirmations === 'number' && tx.confirmations > 0 ? 'confirmed' : 'unknown',
  blockNumber: null,
  from: null,
  to: null,
  valueRaw: null,
  valueFormatted: null,
  decimals: 8,
  feeRaw: null,
  feeFormatted: null,
  symbol: 'BTC',
  raw: tx.raw,
  updatedAt: nowIso(),
  source: 'bitcoin-rpc',
});
