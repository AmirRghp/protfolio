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

const originalBoxedSnippet = `\t\tconst boxed = [
\t\t\timage(maps.across, \`across-\${k}\`),
\t\t\timage(maps.down, \`down-\${k}\`),
\t\t\timage(maps.light, merged("raw")),
\t\t\tsvg("feFlood", {
\t\t\t\t"flood-color": "rgb(128, 128, 128)",
\t\t\t\tresult: \`neutral-\${k}\`
\t\t\t})
\t\t];`;

const patchedBoxedSnippet = `\t\tconst boxed = [
\t\t\timage(maps.across, \`across-\${k}\`),
\t\t\timage(maps.down, \`down-\${k}\`),
\t\t\timage(maps.light, merged("raw"))
\t\t];
\t\tfilter.append(svg("feFlood", {
\t\t\t"flood-color": "rgb(128, 128, 128)",
\t\t\tresult: \`neutral-\${k}\`
\t\t}));`;

const originalRaysSnippet = `\t\t\tboxed.push(across);
\t\t\tfilter.append(across, down);`;

const patchedRaysSnippet = `\t\t\tboxed.push(across, down);
\t\t\tfilter.append(across, down);`;

const originalPlaceRectSnippet = `\t\tconst rect = box ? {
\t\t\tx: lens.x / across,
\t\t\ty: lens.y / down,
\t\t\twidth: lens.width / across,
\t\t\theight: lens.height / down
\t\t} : {`;

const patchedPlaceRectSnippet = `\t\tconst effAcross = (box && lens.effAcross) || across;
\t\tconst effDown = (box && lens.effDown) || down;
\t\tconst rect = box ? {
\t\t\tx: lens.x / effAcross,
\t\t\ty: lens.y / effDown,
\t\t\twidth: lens.width / effAcross,
\t\t\theight: lens.height / effDown
\t\t} : {`;

const originalRenderMemberSnippet = `\t\tfor (const member of surface.members) {
\t\t\tconst at = member.glass.getBoundingClientRect();
\t\t\tif (!member.fit || !at.width || !at.height) continue;
\t\t\tconst width = at.width / unit;
\t\t\tconst height = at.height / unit;
\t\t\tconst reach = member.fit.strength * Math.min(width, height) * member.amount;
\t\t\tconst { dispersion } = member.fit;
\t\t\tconst blur = member.fit.blur * member.amount;
\t\t\tmember.placed = {
\t\t\t\tx: (at.left - from.left) / unit,
\t\t\t\ty: (at.top - from.top) / unit,
\t\t\t\twidth,
\t\t\t\theight,
\t\t\t\treach,
\t\t\t\tdispersion,
\t\t\t\tblur
\t\t\t};
\t\t\tshown.push(member);
\t\t}`;

const patchedRenderMemberSnippet = `\t\tconst isBox = boxUnits();
\t\tlet padTop = 0, padLeft = 0, effAcross = across, effDown = down;
\t\tif (isBox) {
\t\t\tconst cs = getComputedStyle(content);
\t\t\tpadTop = parseFloat(cs.paddingTop) || 0;
\t\t\tpadLeft = parseFloat(cs.paddingLeft) || 0;
\t\t\teffAcross = Math.max(1, across - padLeft - (parseFloat(cs.paddingRight) || 0));
\t\t\teffDown = Math.max(1, down - padTop - (parseFloat(cs.paddingBottom) || 0));
\t\t}
\t\tfor (const member of surface.members) {
\t\t\tconst at = member.glass.getBoundingClientRect();
\t\t\tif (!member.fit || !at.width || !at.height) continue;
\t\t\tconst width = at.width / unit;
\t\t\tconst height = at.height / unit;
\t\t\tconst reach = member.fit.strength * Math.min(width, height) * member.amount;
\t\t\tconst { dispersion } = member.fit;
\t\t\tconst blur = member.fit.blur * member.amount;
\t\t\tmember.placed = {
\t\t\t\tx: isBox ? (at.left - from.left - padLeft) / unit : (at.left - from.left) / unit,
\t\t\t\ty: isBox ? (at.top - from.top - padTop) / unit : (at.top - from.top) / unit,
\t\t\t\twidth,
\t\t\t\theight,
\t\t\t\treach,
\t\t\t\tdispersion,
\t\t\t\tblur,
\t\t\t\teffAcross,
\t\t\t\teffDown
\t\t\t};
\t\t\tshown.push(member);
\t\t}`;

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

  if (content.includes(originalBoxedSnippet)) {
    content = content.replace(originalBoxedSnippet, patchedBoxedSnippet);
    modified = true;
  }

  if (content.includes(originalRaysSnippet)) {
    content = content.replace(originalRaysSnippet, patchedRaysSnippet);
    modified = true;
  }

  if (content.includes(originalPlaceRectSnippet)) {
    content = content.replace(originalPlaceRectSnippet, patchedPlaceRectSnippet);
    modified = true;
  }

  if (content.includes(originalRenderMemberSnippet)) {
    content = content.replace(originalRenderMemberSnippet, patchedRenderMemberSnippet);
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
  } else if (
    content.includes(patchMarker) &&
    content.includes(canonicalBoxUnits) &&
    content.includes("effAcross")
  ) {
    patchedCount++;
  } else {
    console.warn(`[patch-glisse] Target pattern not found in: ${path.relative(rootDir, filePath)}`);
  }
}

if (patchedCount > 0) {
  console.log(`[patch-glisse] Glisse WebKit objectBoundingBox + multi-section backdrop + bleed containment patch verified (${patchedCount} file(s)).`);
}
