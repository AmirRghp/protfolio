import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const filesToPatch = [
  path.join(rootDir, "node_modules", "glisse", "dist", "index.js"),
  path.join(rootDir, "node_modules", "glisse", "dist", "index.cjs"),
];

const legacyBoxUnitsPatch =
  "const boxUnits = () => false; /* Patched for WebKit/iOS Safari: enforce userSpaceOnUse pixel scaling */";
const canonicalBoxUnits =
  "const boxUnits = () => /AppleWebKit\\//.test(navigator.userAgent) && !/Chrom(?:e|ium)\\//.test(navigator.userAgent);";

const originalUpdateSnippet = `\t\tupdate(amount) {
\t\t\tif (amount !== void 0) member.amount = clamp$3(amount, 0, 1);
\t\t\tif (active) render(shared);
\t\t},`;

const patchedUpdateSnippet = `\t\tupdate(amount) {
\t\t\tif (amount !== void 0) member.amount = clamp$3(amount, 0, 1);
\t\t\tif (active) {
\t\t\t\tif (!member.fit) prepare();
\t\t\t\trender(shared);
\t\t\t}
\t\t},`;

const originalBackdropBlock = `function findBackdrop(element) {
\tconst box = element.getBoundingClientRect();
\tconst behind = (candidate) => {
\t\tif (candidate.contains(element) || element.contains(candidate)) return false;
\t\tconst other = visibleBox(candidate);
\t\treturn other.left < box.right && other.right > box.left && other.top < box.bottom && other.bottom > box.top;
\t};
\tfor (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
\t\tconst found = [...node.querySelectorAll(\`[\${MARK}]\`)].find(behind);
\t\tif (found) return found;
\t}
\treturn null;
}
const followed = /* @__PURE__ */ new Map();
let following = 0;
function follow() {
\tfor (const lenses of followed.values()) lenses.values().next().value?.update();
\tfollowing = followed.size ? requestAnimationFrame(follow) : 0;
}
function bend(element, source) {
\tconst lens = createLens(element, source, GLASS);
\tlet started = false;
\tconst fitting = refitting(element, () => {
\t\tpaintRim(element);
\t\tif (started) return lens.refit();
\t\tstarted = true;
\t\tlens.setActive(true);
\t\tlet lenses = followed.get(source);
\t\tif (!lenses) followed.set(source, lenses = /* @__PURE__ */ new Set());
\t\tlenses.add(lens);
\t\tfollowing ||= requestAnimationFrame(follow);
\t}, ["--lg-rim"]);
\treturn {
\t\trefit: fitting.refit,
\t\tstop: () => {
\t\t\tfitting.stop();
\t\t\tconst lenses = followed.get(source);
\t\t\tlenses?.delete(lens);
\t\t\tif (lenses && !lenses.size) followed.delete(source);
\t\t\tlens.destroy();
\t\t}
\t};
}`;

const patchMarker = "/* [patch-glisse] Multi-section dynamic backdrop refraction */";

const patchedBackdropBlock = `${patchMarker}
function findBackdrop(element) {
\tif (element.closest(\`[\${MARK}]\`)) return null;
\tfor (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
\t\tconst found = [...node.querySelectorAll(\`[\${MARK}]\`)].filter((candidate) => !candidate.contains(element) && !element.contains(candidate));
\t\tif (found.length) return found;
\t}
\treturn null;
}
const followed = /* @__PURE__ */ new Map();
let following = 0;
function follow() {
\tfor (const sync of followed.values()) sync();
\tfollowing = followed.size ? requestAnimationFrame(follow) : 0;
}
function bend(element, source) {
\tconst list = Array.isArray(source) ? source : [source];
\tconst entries = list.map((item) => ({
\t\tsource: item,
\t\tlens: createLens(element, item, GLASS)
\t}));
\tconst sync = () => {
\t\tconst box = element.getBoundingClientRect();
\t\tconst style = getComputedStyle(element);
\t\tconst shown = box.width > 0 && box.height > 0 && style.visibility !== "hidden" && parseFloat(style.opacity || "1") > 0.01;
\t\tfor (const { source: item, lens } of entries) {
\t\t\tlet active = false;
\t\t\tif (shown) {
\t\t\t\tconst other = visibleBox(item);
\t\t\t\tactive = other.left < box.right && other.right > box.left && other.top < box.bottom && other.bottom > box.top;
\t\t\t}
\t\t\tif (active) {
\t\t\t\tlens.setActive(true);
\t\t\t\tlens.update();
\t\t\t} else {
\t\t\t\tlens.setActive(false);
\t\t\t}
\t\t}
\t};
\tfollowed.set(element, sync);
\tfollowing ||= requestAnimationFrame(follow);
\tconst fitting = refitting(element, () => {
\t\tpaintRim(element);
\t\tfor (const { lens } of entries) lens.refit();
\t\tsync();
\t}, ["--lg-rim"]);
\treturn {
\t\trefit: () => {
\t\t\tfitting.refit();
\t\t\tsync();
\t\t},
\t\tstop: () => {
\t\t\tfitting.stop();
\t\t\tfollowed.delete(element);
\t\t\tfor (const { lens } of entries) lens.destroy();
\t\t}
\t};
}`;

let patchedCount = 0;

for (const filePath of filesToPatch) {
  if (!fs.existsSync(filePath)) {
    continue;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  if (content.includes(legacyBoxUnitsPatch)) {
    content = content.replace(legacyBoxUnitsPatch, canonicalBoxUnits);
    modified = true;
  }

  if (content.includes(originalUpdateSnippet)) {
    content = content.replace(originalUpdateSnippet, patchedUpdateSnippet);
    modified = true;
  }

  if (content.includes(originalBackdropBlock)) {
    content = content.replace(originalBackdropBlock, patchedBackdropBlock);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`[patch-glisse] Successfully patched: ${path.relative(rootDir, filePath)}`);
    patchedCount++;
    const viteCacheDir = path.join(rootDir, "node_modules", ".vite");
    if (fs.existsSync(viteCacheDir)) {
      fs.rmSync(viteCacheDir, { recursive: true, force: true });
    }
  } else if (content.includes(patchMarker) && content.includes(canonicalBoxUnits)) {
    patchedCount++;
  } else {
    console.warn(`[patch-glisse] Target pattern not found in: ${path.relative(rootDir, filePath)}`);
  }
}

if (patchedCount > 0) {
  console.log(`[patch-glisse] Glisse WebKit objectBoundingBox + multi-section backdrop patch verified (${patchedCount} file(s)).`);
}
