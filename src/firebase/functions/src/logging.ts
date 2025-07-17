// A structured logger for Cloud Functions to enable better monitoring and alerting.
// By logging in a structured JSON format, we can easily create metrics and alerts
// in Google Cloud's operations suite based on specific fields (like 'severity' or 'name').

// Enum for log severities, aligned with Google Cloud Logging standards.
export enum LogSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

interface LogPayload {
  [key: string]: any;
}

/**
 * The core logging function.
 *
 * @param {LogSeverity} severity - The severity of the log entry.
 * @param {string} message - The main message for the log.
 * @param {LogPayload} [payload={}] - An optional object for additional structured data.
 */
function log(severity: LogSeverity, message: string, payload: LogPayload = {}): void {
  // We use console.log/warn/error because Cloud Functions automatically captures
  // these streams and processes them. Writing to stdout/stderr with JSON
  // is the standard way to do structured logging.
  const logEntry = {
    severity,
    message,
    ...payload,
  };
  
  switch (severity) {
    case LogSeverity.WARNING:
      console.warn(JSON.stringify(logEntry));
      break;
    case LogSeverity.ERROR:
    case LogSeverity.CRITICAL:
      console.error(JSON.stringify(logEntry));
      break;
    case LogSeverity.INFO:
    default:
      console.log(JSON.stringify(logEntry));
      break;
  }
}

// Helper functions for each log level.

export function logInfo(message: string, payload?: LogPayload): void {
  log(LogSeverity.INFO, message, payload);
}

export function logWarning(message: string, payload?: LogPayload): void {
  log(LogSeverity.WARNING, message, payload);
}

export function logError(message: string, payload?: LogPayload): void {
  log(LogSeverity.ERROR, message, payload);
}

export function logCritical(message: string, payload?: LogPayload): void {
  log(LogSeverity.CRITICAL, message, payload);
}
