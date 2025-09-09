"use strict";
// A structured logger for Cloud Functions to enable better monitoring and alerting.
// By logging in a structured JSON format, we can easily create metrics and alerts
// in Google Cloud's operations suite based on specific fields (like 'severity' or 'name').
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogSeverity = void 0;
exports.logInfo = logInfo;
exports.logWarning = logWarning;
exports.logError = logError;
exports.logCritical = logCritical;
// Enum for log severities, aligned with Google Cloud Logging standards.
var LogSeverity;
(function (LogSeverity) {
    LogSeverity["INFO"] = "INFO";
    LogSeverity["WARNING"] = "WARNING";
    LogSeverity["ERROR"] = "ERROR";
    LogSeverity["CRITICAL"] = "CRITICAL";
})(LogSeverity || (exports.LogSeverity = LogSeverity = {}));
/**
 * The core logging function.
 *
 * @param {LogSeverity} severity - The severity of the log entry.
 * @param {string} message - The main message for the log.
 * @param {LogPayload} [payload={}] - An optional object for additional structured data.
 */
function log(severity, message, payload = {}) {
    // We use console.log/warn/error because Cloud Functions automatically captures
    // these streams and processes them. Writing to stdout/stderr with JSON
    // is the standard way to do structured logging.
    const logEntry = Object.assign({ severity,
        message }, payload);
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
function logInfo(message, payload) {
    log(LogSeverity.INFO, message, payload);
}
function logWarning(message, payload) {
    log(LogSeverity.WARNING, message, payload);
}
function logError(message, payload) {
    log(LogSeverity.ERROR, message, payload);
}
function logCritical(message, payload) {
    log(LogSeverity.CRITICAL, message, payload);
}
//# sourceMappingURL=logging.js.map