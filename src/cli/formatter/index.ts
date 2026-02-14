import type { Formatter } from "./types.js";
import { stylishFormatter } from "./stylish.js";
import { jsonFormatter } from "./json.js";

export type { Formatter, FormatInput, FormatResult } from "./types.js";

export function getFormatter(name: string): Formatter {
  switch (name) {
    case "json":
      return jsonFormatter;
    case "stylish":
    default:
      return stylishFormatter;
  }
}
