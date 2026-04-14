import { BITCOIN_NETWORKS, EVM_CHAIN_IDS } from '@/config/constants';
import type { NetworkType } from '@/domain/asset';
import { AppError } from '@/utils/app-error';

export interface EthereumNetworkSelectionInput {
  network?: NetworkType;
  chainId?: number;
}

export const networkFromEthereumChainId = (chainId: number): NetworkType =>
  chainId === EVM_CHAIN_IDS.ETHEREUM_SEPOLIA ? BITCOIN_NETWORKS.TESTNET : BITCOIN_NETWORKS.MAINNET;

export const resolveEthereumNetworkSelection = (
  input: EthereumNetworkSelectionInput,
): { network: NetworkType; chainId: number } => {
  if (input.chainId !== undefined) {
    const resolvedNetwork = networkFromEthereumChainId(input.chainId);

    if (input.network && input.network !== resolvedNetwork) {
      throw new AppError('network and chainId do not match for ethereum requests', 400, 'VALIDATION_ERROR', input);
    }

    return {
      network: resolvedNetwork,
      chainId: input.chainId,
    };
  }

  return {
    network: input.network ?? BITCOIN_NETWORKS.MAINNET,
    chainId:
      input.network === BITCOIN_NETWORKS.TESTNET
        ? EVM_CHAIN_IDS.ETHEREUM_SEPOLIA
        : EVM_CHAIN_IDS.ETHEREUM_MAINNET,
  };
};

export const assertBitcoinMainnetOnly = (network: NetworkType): void => {
  if (network === BITCOIN_NETWORKS.TESTNET) {
    throw new AppError(
      'Bitcoin testnet switching is not supported by the current provider configuration',
      501,
      'TESTNET_UNSUPPORTED',
      { network },
    );
  }
};
