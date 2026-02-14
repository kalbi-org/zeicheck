/**
 * Custom error classes for zeicheck.
 */

export class ParseError extends Error {
  constructor(message: string, public readonly filePath?: string) {
    super(message);
    this.name = "ParseError";
  }
}

export class ConfigError extends Error {
  constructor(message: string, public readonly configPath?: string) {
    super(message);
    this.name = "ConfigError";
  }
}
