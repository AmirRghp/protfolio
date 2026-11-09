import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const filesToPatch = [
  path.join(rootDir, "node_modules", "glisse", "dist", "index.js"),
  path.join(rootDir, "node_modules", "glisse", "dist", "index.cjs"),
];

const targetPattern = /const boxUnits = \(\) => \/AppleWebKit\\\/\/\.test\(navigator\.userAgent\) && !\/Chrom\(\?:e\|ium\)\\\/\/\.test\(navigator\.userAgent\);/;
const replacement = "const boxUnits = () => false; /* Patched for WebKit/iOS Safari: enforce userSpaceOnUse pixel scaling */";

let patchedCount = 0;

for (const filePath of filesToPatch) {
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes(replacement)) {
    patchedCount++;
    continue;
  }

  if (targetPattern.test(content)) {
    const updated = content.replace(targetPattern, replacement);
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`[patch-glisse] Successfully patched: ${path.relative(rootDir, filePath)}`);
    patchedCount++;
  } else {
    console.warn(`[patch-glisse] Target pattern not found in: ${path.relative(rootDir, filePath)}`);
  }
}

if (patchedCount > 0) {
  console.log(`[patch-glisse] Glisse WebKit scale fix verified (${patchedCount} file(s)).`);
}
