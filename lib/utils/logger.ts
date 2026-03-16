/**
 * Simple logger utility for server-side logging
 * Used across features for debugging and monitoring
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	module: string;
	message: string;
	data?: Record<string, any>;
}

class Logger {
	private module: string;

	constructor(module: string) {
		this.module = module;
	}

	private log(level: LogLevel, message: string, data?: Record<string, any>) {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			module: this.module,
			message,
			data,
		};

		// In development, log to console
		if (process.env.NODE_ENV === "development") {
			const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${entry.module}]`;
			if (data) {
				console.log(prefix, message, data);
			} else {
				console.log(prefix, message);
			}
		}

		// Could be extended to send to external logging service
		// e.g., Sentry, LogRocket, Datadog, etc.
	}

	debug(message: string, data?: Record<string, any>) {
		this.log("debug", message, data);
	}

	info(message: string, data?: Record<string, any>) {
		this.log("info", message, data);
	}

	warn(message: string, data?: Record<string, any>) {
		this.log("warn", message, data);
	}

	error(message: string, data?: Record<string, any>) {
		this.log("error", message, data);
	}
}

export function getLogger(module: string): Logger {
	return new Logger(module);
}

export { Logger };
