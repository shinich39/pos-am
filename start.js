import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from 'node:url';
import pos from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_PATH = path.join(__dirname, "input");
const OUTPUT_PATH = path.join(__dirname, "output");

;(async function() {
  await pos.exec(INPUT_PATH, OUTPUT_PATH, true);
})();