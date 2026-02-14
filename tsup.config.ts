import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node20",
  banner: ({ format }) => {
    if (format === "esm") {
      return {
        js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
      };
    }
    return {};
  },
});
