// generate-icons.js
// Usage: node scripts/generate-icons.js
// Requires: sharp (install with `npm install sharp`)

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(
  __dirname,
  "../public/icon/icon_transperent.png"
);
const outputDir = path.resolve(__dirname, "../public/icon");

const sizes = [16, 32, 48, 96, 128];

(async () => {
  if (!fs.existsSync(inputPath)) {
    console.error("Input file not found:", inputPath);
    process.exit(1);
  }
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${size}.png`);
    try {
      await sharp(inputPath).resize(size, size).toFile(outputPath);
      console.log(`Created ${outputPath}`);
    } catch (err) {
      console.error(`Failed to create ${outputPath}:`, err);
    }
  }
})();
