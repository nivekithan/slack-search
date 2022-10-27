const esbuild = require("esbuild");
const path = require("node:path");

const main = async (command) => {
  const watch =
    command === "watch"
      ? {
          onRebuild(error, result) {
            if (error) {
              console.error("watch build failed:", error);
            } else {
              console.log("watch build succeeded:");
            }
          },
        }
      : undefined;

  esbuild.build({
    absWorkingDir: path.resolve(__dirname, ".."),
    entryPoints: ["./src/index.ts"],
    bundle: true,
    external: ["./node_modules/*", "zod", "nanoid", "msw", "@faker-js/faker"],
    platform: "node",
    format: "cjs",
    target: "es2018",
    sourcemap: "linked",
    outdir: "dist",
    watch,
  });

  console.log("watching for changes...");
};

main();
