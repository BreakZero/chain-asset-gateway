import { BitcoinRpcClient } from '@/providers/bitcoin/bitcoin-rpc.client';
import type { BitcoinChainInfo, BitcoinProvider, BitcoinTransactionRaw } from '@/providers/bitcoin/bitcoin.types';
import { AppError } from '@/utils/app-error';

export class BitcoinCoreProvider implements BitcoinProvider {
  constructor(private readonly rpcClient: BitcoinRpcClient = new BitcoinRpcClient()) {}

  async getChainInfo(): Promise<BitcoinChainInfo> {
    const response = await this.rpcClient.call<{
      chain: string;
      blocks: number;
      headers: number;
      bestblockhash: string;
    }>('getblockchaininfo');

    return {
      chain: response.chain,
      blocks: response.blocks,
      headers: response.headers,
      bestBlockHash: response.bestblockhash,
    };
  }

  async getRawTransaction(txHash: string): Promise<BitcoinTransactionRaw | null> {
    try {
      const response = await this.rpcClient.call<Record<string, unknown>>('getrawtransaction', [txHash, true]);
      return {
        txid: String(response.txid ?? txHash),
        hex: typeof response.hex === 'string' ? response.hex : undefined,
        blockhash: typeof response.blockhash === 'string' ? response.blockhash : undefined,
        confirmations: typeof response.confirmations === 'number' ? response.confirmations : undefined,
        time: typeof response.time === 'number' ? response.time : undefined,
        raw: response,
      };
    } catch (error) {
      if (error instanceof AppError && error.code === 'BITCOIN_RPC_ERROR') {
        return null;
      }
      throw error;
    }
  }

  async broadcastTransaction(rawTx: string): Promise<{ txHash: string }> {
    const txHash = await this.rpcClient.call<string>('sendrawtransaction', [rawTx]);
    return { txHash };
  }

  async getAddressUtxos(_address: string): Promise<unknown[]> {
    // TODO: Pure Bitcoin Core RPC does not provide reliable address-based UTXO indexing without extra indexers.
    return [];
  }
}
