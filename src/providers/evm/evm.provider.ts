import { createPublicClient, erc20Abi, formatEther, getContract, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import { EVM_CHAIN_IDS } from '@/config/constants';
import { env } from '@/config/env';
import type { EvmProvider, EvmTokenMetadata, EvmTransactionRaw } from '@/providers/evm/evm.types';
import { AppError } from '@/utils/app-error';

export class ViemEvmProvider implements EvmProvider {
  private readonly client;
  private readonly chainId: number;

  constructor(chainId = EVM_CHAIN_IDS.ETHEREUM_MAINNET) {
    this.chainId = chainId;
    const { chain, rpcUrl } = this.resolveNetwork(chainId);

    this.client = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });
  }

  async getNativeBalance(address: string): Promise<bigint> {
    return this.client.getBalance({
      address: address as `0x${string}`,
    });
  }

  async getErc20Metadata(contractAddress: string): Promise<EvmTokenMetadata> {
    const contract = getContract({
      address: contractAddress as `0x${string}`,
      abi: erc20Abi,
      client: this.client,
    });

    const [name, symbol, decimals] = await Promise.all([
      contract.read.name().catch(() => null),
      contract.read.symbol().catch(() => null),
      contract.read.decimals(),
    ]);

    return {
      chainId: this.chainId,
      name,
      symbol,
      decimals,
      contractAddress: contractAddress.toLowerCase(),
    };
  }

  async getErc20Balance(address: string, contractAddress: string): Promise<bigint> {
    const contract = getContract({
      address: contractAddress as `0x${string}`,
      abi: erc20Abi,
      client: this.client,
    });

    return contract.read.balanceOf([address as `0x${string}`]);
  }

  async getTransactionByHash(txHash: string): Promise<EvmTransactionRaw | null> {
    let tx;
    try {
      tx = await this.client.getTransaction({
        hash: txHash as `0x${string}`,
      });
    } catch {
      return null;
    }

    let receipt:
      | {
          status: 'success' | 'reverted';
          gasUsed: bigint;
          effectiveGasPrice: bigint;
        }
      | null = null;

    try {
      const txReceipt = await this.client.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      receipt = {
        status: txReceipt.status,
        gasUsed: txReceipt.gasUsed,
        effectiveGasPrice: txReceipt.effectiveGasPrice,
      };
    } catch {
      receipt = null;
    }

    return {
      chainId: this.chainId,
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice ?? null,
      effectiveGasPrice: receipt?.effectiveGasPrice ?? null,
      gasUsed: receipt?.gasUsed ?? null,
      status: receipt ? (receipt.status === 'success' ? 'confirmed' : 'failed') : tx.blockNumber ? 'confirmed' : 'pending',
      blockHash: tx.blockHash ?? null,
      transactionIndex: tx.transactionIndex ?? null,
      raw: {
        hash: tx.hash,
        blockNumber: tx.blockNumber?.toString() ?? null,
        blockHash: tx.blockHash ?? null,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        gas: tx.gas.toString(),
        gasPrice: tx.gasPrice?.toString() ?? null,
        gasUsed: receipt?.gasUsed?.toString() ?? null,
        effectiveGasPrice: receipt?.effectiveGasPrice?.toString() ?? null,
        status: receipt?.status ?? null,
        maxFeePerGas: tx.maxFeePerGas?.toString() ?? null,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString() ?? null,
        nonce: tx.nonce,
        transactionIndex: tx.transactionIndex ?? null,
        type: tx.type,
      },
    };
  }

  async getBlockNumber(): Promise<bigint> {
    return this.client.getBlockNumber();
  }

  static formatNativeAmount(value: bigint): string {
    return formatEther(value);
  }

  private resolveNetwork(chainId: number): { chain: typeof mainnet | typeof sepolia; rpcUrl: string } {
    if (chainId === EVM_CHAIN_IDS.ETHEREUM_MAINNET) {
      if (!env.ETHEREUM_RPC_URL) {
        throw new AppError(
          'ETHEREUM_RPC_URL is required for Ethereum mainnet operations',
          500,
          'EVM_PROVIDER_NOT_CONFIGURED',
        );
      }

      return {
        chain: mainnet,
        rpcUrl: env.ETHEREUM_RPC_URL,
      };
    }

    if (chainId === EVM_CHAIN_IDS.ETHEREUM_SEPOLIA) {
      if (!env.SEPOLIA_RPC_URL) {
        throw new AppError(
          'SEPOLIA_RPC_URL is required for Sepolia operations',
          500,
          'EVM_PROVIDER_NOT_CONFIGURED',
        );
      }

      return {
        chain: sepolia,
        rpcUrl: env.SEPOLIA_RPC_URL,
      };
    }

    throw new AppError('Unsupported EVM chainId', 400, 'UNSUPPORTED_CHAIN_ID', { chainId });
  }
}
