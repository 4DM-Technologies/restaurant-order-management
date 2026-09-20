/* Centralized console logging for the frontend.
   Mirrors the backend `src/utils/logger.py` convention: named module + level +
   message, with an optional structured payload. Enabled in dev, or in prod when
   VITE_ENABLE_LOGS=true. Never logs tokens, passwords, or PII. */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  payload?: unknown;
  timestamp: string;
}

const ENABLED =
  import.meta.env.DEV === true || import.meta.env.VITE_ENABLE_LOGS === 'true';

const STYLES: Record<LogLevel, string> = {
  debug: 'color:#6b7280',
  info: 'color:#4f46e5',
  warn: 'color:#b45309;font-weight:600',
  error: 'color:#b91c1c;font-weight:700',
};

function now(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function emit(entry: LogEntry): void {
  if (!ENABLED) return;
  const { level, module, message, payload, timestamp } = entry;
  const line = `[${timestamp} ${level.toUpperCase()}] Soroco:${module}: ${message}`;
  const method = level === 'debug' ? 'info' : level;
  if (payload !== undefined) {
    // eslint-disable-next-line no-console
    console[method](`%c${line}`, STYLES[level], payload);
  } else {
    // eslint-disable-next-line no-console
    console[method](`%c${line}`, STYLES[level]);
  }
}

export const log = {
  debug: (module: string, message: string, payload?: unknown) =>
    emit({ level: 'debug', module, message, payload, timestamp: now() }),
  info: (module: string, message: string, payload?: unknown) =>
    emit({ level: 'info', module, message, payload, timestamp: now() }),
  warn: (module: string, message: string, payload?: unknown) =>
    emit({ level: 'warn', module, message, payload, timestamp: now() }),
  error: (module: string, message: string, payload?: unknown) =>
    emit({ level: 'error', module, message, payload, timestamp: now() }),
};