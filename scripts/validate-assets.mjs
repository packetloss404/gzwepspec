import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const supportedImageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const supportedLocalMimeTypes = new Map([
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

async function importTypeScriptModule(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const source = fs.readFileSync(absolutePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: absolutePath,
    reportDiagnostics: true,
  });

  const blockingDiagnostics =
    transpiled.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error) ?? [];
  if (blockingDiagnostics.length > 0) {
    const rendered = ts.formatDiagnosticsWithColorAndContext(blockingDiagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => root,
      getNewLine: () => "\n",
    });
    throw new Error(`Unable to transpile ${relativePath}\n${rendered}`);
  }

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString("base64")}`;
  return import(moduleUrl);
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  });
}

function flattenLocalAssets(manifest) {
  return Object.entries(manifest.local).flatMap(([groupName, group]) =>
    Object.values(group).map((asset) => ({ ...asset, groupName })),
  );
}

function addDuplicateWarnings(values, label, warnings) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  for (const duplicate of duplicates) {
    warnings.push(`Duplicate ${label}: ${duplicate}`);
  }
}

function detectLocalImageMimeType(filePath) {
  const header = fs.readFileSync(filePath).subarray(0, 12);

  if (
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    header.length >= 12 &&
    header.toString("ascii", 0, 4) === "RIFF" &&
    header.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return undefined;
}

const errors = [];
const warnings = [];

const [{ assetManifest }, { platforms, parts }] = await Promise.all([
  importTypeScriptModule("src/data/assetManifest.ts"),
  importTypeScriptModule("src/data/armory.ts"),
]);

const localAssets = flattenLocalAssets(assetManifest);
const manifestLocalPaths = new Set();

for (const asset of localAssets) {
  if (!asset.id || !asset.category || !asset.src || !asset.localPath) {
    errors.push(`Incomplete local asset entry: ${JSON.stringify(asset)}`);
    continue;
  }

  if (!asset.src.startsWith("/assets/")) {
    errors.push(`${asset.category}:${asset.id} src should live under /assets/: ${asset.src}`);
  }

  if (!asset.localPath.startsWith(`${assetManifest.policy.localPathRoot}/assets/`)) {
    errors.push(`${asset.category}:${asset.id} localPath should live under public/assets/: ${asset.localPath}`);
  }

  const absoluteLocalPath = path.join(root, asset.localPath);
  manifestLocalPaths.add(toPosixPath(asset.localPath));

  const localFileExists = fs.existsSync(absoluteLocalPath);
  if (!localFileExists) {
    errors.push(`${asset.category}:${asset.id} points to missing file: ${asset.localPath}`);
  }

  const expectedMimeType = supportedLocalMimeTypes.get(path.extname(asset.localPath).toLowerCase());
  if (!expectedMimeType) {
    warnings.push(`${asset.category}:${asset.id} uses ${asset.localPath}; expected a PNG or WebP local render.`);
  } else if (asset.mimeType !== expectedMimeType) {
    warnings.push(`${asset.category}:${asset.id} declares ${asset.mimeType} at ${asset.localPath}; expected ${expectedMimeType}.`);
  } else if (localFileExists) {
    const detectedMimeType = detectLocalImageMimeType(absoluteLocalPath);
    if (detectedMimeType !== asset.mimeType) {
      errors.push(
        `${asset.category}:${asset.id} declares ${asset.mimeType} at ${asset.localPath}; file header ${
          detectedMimeType ? `looks like ${detectedMimeType}` : "is not a supported PNG/WebP image"
        }.`,
      );
    }
  }
}

addDuplicateWarnings(
  localAssets.map((asset) => `${asset.category}:${asset.id}`),
  "manifest asset id",
  warnings,
);

const weaponCoverageList = Object.values(assetManifest.local.weapons).flatMap((asset) => asset.coverage?.armoryIds ?? []);
const partCoverageList = Object.values(assetManifest.local.parts).flatMap((asset) => asset.coverage?.armoryIds ?? []);
const weaponCoverage = new Set(weaponCoverageList);
const partCoverage = new Set(partCoverageList);

addDuplicateWarnings(weaponCoverageList, "weapon coverage id", warnings);
addDuplicateWarnings(partCoverageList, "part coverage id", warnings);

const missingWeaponCoverage = platforms.map((platform) => platform.id).filter((id) => !weaponCoverage.has(id));
if (missingWeaponCoverage.length > 0) {
  warnings.push(`Weapon platforms without local manifest coverage: ${missingWeaponCoverage.join(", ")}`);
}

const missingPartCoverage = parts.map((part) => part.id).filter((id) => !partCoverage.has(id));
if (missingPartCoverage.length > 0) {
  warnings.push(
    `Parts without local manifest coverage (${missingPartCoverage.length}/${parts.length}): ${missingPartCoverage.join(", ")}`,
  );
}

const publicAssetFiles = walkFiles(path.join(root, "public", "assets"))
  .filter((filePath) => supportedImageExtensions.has(path.extname(filePath).toLowerCase()))
  .map((filePath) => toPosixPath(path.relative(root, filePath)));

const unmanifestedLocalFiles = publicAssetFiles.filter((filePath) => !manifestLocalPaths.has(filePath));
if (unmanifestedLocalFiles.length > 0) {
  warnings.push(`Local public asset files not listed in manifest: ${unmanifestedLocalFiles.join(", ")}`);
}

if (warnings.length > 0) {
  console.warn("Asset manifest warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length > 0) {
  console.error("Asset manifest validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Asset manifest OK: ${localAssets.length} local assets, ${Object.keys(assetManifest.remote.gameMedia).length} remote game media entries, ${publicAssetFiles.length} public asset files checked.`,
);
