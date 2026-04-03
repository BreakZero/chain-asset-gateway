import { formatUnits, parseUnits } from 'viem';

export const formatTokenAmount = (raw: bigint, decimals: number): string => formatUnits(raw, decimals);

export const parseTokenAmount = (value: string, decimals: number): bigint => parseUnits(value, decimals);

export const multiplyDecimalStrings = (left: string, right: string): string => {
  const leftValue = Number(left);
  const rightValue = Number(right);

  if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
    return '0';
  }

  return (leftValue * rightValue).toFixed(2);
};
