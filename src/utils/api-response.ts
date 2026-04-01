import type { ApiResponse } from '@/domain/api';
import { nowIso } from '@/utils/time';

export const ok = <T>(data: T, source?: string): ApiResponse<T> => ({
  success: true,
  data,
  meta: {
    source,
    updatedAt: nowIso(),
  },
});
