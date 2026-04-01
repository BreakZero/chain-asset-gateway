type LogMeta = Record<string, unknown> | undefined;

const log = (level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: LogMeta): void => {
  const payload = meta ? ` ${JSON.stringify(meta)}` : '';
  console[level === 'ERROR' ? 'error' : 'log'](`[${level}] ${message}${payload}`);
};

export const logger = {
  info: (message: string, meta?: LogMeta): void => log('INFO', message, meta),
  warn: (message: string, meta?: LogMeta): void => log('WARN', message, meta),
  error: (message: string, meta?: LogMeta): void => log('ERROR', message, meta),
};
