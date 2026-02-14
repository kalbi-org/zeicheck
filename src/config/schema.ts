import { z } from "zod";

const severitySchema = z.enum(["error", "warning", "info", "off"]);

const ruleValueSchema = z.union([
  severitySchema,
  z.tuple([severitySchema, z.record(z.unknown())]),
]);

export const configSchema = z.object({
  rules: z.record(ruleValueSchema).default({}),
  priorYearFile: z.string().optional(),
  format: z.enum(["stylish", "json"]).default("stylish"),
  warningsAsErrors: z.boolean().default(false),
});

export type ConfigInput = z.input<typeof configSchema>;
