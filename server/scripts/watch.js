const esbuild = require("esbuild");
const path = require("node:path");

const main = async () => {
  esbuild.build({
    absWorkingDir: path.resolve(__dirname, ".."),
    entryPoints: ["./src/index.ts"],
    bundle: true,
    external: ["./node_modules/*", "zod", "nanoid"],
    platform: "node",
    format: "cjs",
    target: "es2018",
    sourcemap: "linked",
    outdir: "dist",
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error("watch build failed:", error);
        } else {
          console.log("watch build succeeded:");
        }
      },
    },
  });

  console.log("watching for changes...");
};

main();
