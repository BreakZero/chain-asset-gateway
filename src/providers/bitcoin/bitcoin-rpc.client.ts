import axios, { type AxiosInstance } from 'axios';

import { env } from '@/config/env';
import { AppError } from '@/utils/app-error';

interface JsonRpcSuccess<T> {
  result: T;
  error: null;
  id: string;
}

interface JsonRpcFailure {
  result: null;
  error: {
    code: number;
    message: string;
  };
  id: string;
}

type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcFailure;

export class BitcoinRpcClient {
  private readonly client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    if (!env.BITCOIN_RPC_URL) {
      throw new AppError(
        'BITCOIN_RPC_URL is required for Bitcoin RPC operations',
        500,
        'BITCOIN_PROVIDER_NOT_CONFIGURED',
      );
    }

    this.client =
      client ??
      axios.create({
        baseURL: env.BITCOIN_RPC_URL,
        timeout: 10_000,
        auth:
          env.BITCOIN_RPC_USERNAME && env.BITCOIN_RPC_PASSWORD
            ? {
                username: env.BITCOIN_RPC_USERNAME,
                password: env.BITCOIN_RPC_PASSWORD,
              }
            : undefined,
      });
  }

  async call<T>(method: string, params: unknown[] = []): Promise<T> {
    const response = await this.client.post<JsonRpcResponse<T>>('/', {
      jsonrpc: '2.0',
      id: `${Date.now()}`,
      method,
      params,
    });

    if (response.data.error) {
      throw new AppError(response.data.error.message, 502, 'BITCOIN_RPC_ERROR', response.data.error);
    }

    return response.data.result;
  }
}
