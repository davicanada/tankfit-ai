import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const publicRoot = join(repositoryRoot, "public");
const productDirectory = join(publicRoot, "images", "products");
const logoDirectory = join(publicRoot, "images", "logos");

const [catalog, companyRegistry] = await Promise.all([
  readJson(new URL("../data/catalog/products.json", import.meta.url)),
  readJson(new URL("../data/companies/companies.json", import.meta.url)),
]);

const productPaths = new Set(catalog.products.map((product) => product.image.path));
const logoPaths = new Set(companyRegistry.companies.map((company) => company.logoPath));
const errors = [];

await Promise.all([
  ...[...productPaths].map((assetPath) => validateWebp(assetPath, errors)),
  ...[...logoPaths].map((assetPath) => validateSvg(assetPath, errors)),
]);

await findOrphanedAssets(productDirectory, ".webp", productPaths, errors);
await findOrphanedAssets(logoDirectory, ".svg", logoPaths, errors);

if (errors.length > 0) {
  console.error("Asset validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Asset validation passed: ${productPaths.size} product WebP files and ${logoPaths.size} company SVG files are present, referenced, and structurally safe.`,
  );
}

async function validateWebp(assetPath, validationErrors) {
  const filePath = resolvePublicAsset(assetPath, ".webp", validationErrors);
  if (!filePath || !(await isFile(filePath))) {
    validationErrors.push(`Missing product image: ${assetPath}.`);
    return;
  }

  const buffer = await readFile(filePath);
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    validationErrors.push(`${assetPath} is not a valid WebP container.`);
    return;
  }

  const dimensions = readWebpDimensions(buffer);
  if (!dimensions) {
    validationErrors.push(`Unable to read WebP dimensions for ${assetPath}.`);
  } else if (dimensions.width !== 1600 || dimensions.height !== 1600) {
    validationErrors.push(`${assetPath} must be 1600 x 1600; found ${dimensions.width} x ${dimensions.height}.`);
  }
}

async function validateSvg(assetPath, validationErrors) {
  const filePath = resolvePublicAsset(assetPath, ".svg", validationErrors);
  if (!filePath || !(await isFile(filePath))) {
    validationErrors.push(`Missing company mark: ${assetPath}.`);
    return;
  }

  const content = await readFile(filePath, "utf8");
  const prohibited = [
    [/<script\b/i, "script element"],
    [/javascript:/i, "JavaScript URL"],
    [/\bon\w+\s*=/i, "event handler"],
    [/<foreignObject\b/i, "foreignObject element"],
    [/<image\b/i, "embedded raster image"],
    [/<text\b/i, "text element"],
    [/(?:href|xlink:href)\s*=/i, "external or embedded reference"],
  ];

  if (!/^\s*<svg\b/i.test(content) || !/\bviewBox\s*=/.test(content)) {
    validationErrors.push(`${assetPath} must be a standalone SVG with a viewBox.`);
  }

  for (const [pattern, label] of prohibited) {
    if (pattern.test(content)) validationErrors.push(`${assetPath} contains a prohibited ${label}.`);
  }
}

async function findOrphanedAssets(directory, extension, referencedPaths, validationErrors) {
  const referencedNames = new Set([...referencedPaths].map((assetPath) => basename(assetPath)));
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith(extension) && !referencedNames.has(entry.name)) {
      validationErrors.push(`Unreferenced ${extension} asset: ${entry.name}.`);
    }
  }
}

function resolvePublicAsset(assetPath, expectedExtension, validationErrors) {
  if (typeof assetPath !== "string" || !assetPath.startsWith("/images/") || !assetPath.endsWith(expectedExtension)) {
    validationErrors.push(`Invalid public asset path: ${String(assetPath)}.`);
    return null;
  }

  const filePath = join(publicRoot, ...assetPath.slice(1).split("/"));
  if (!filePath.startsWith(publicRoot)) {
    validationErrors.push(`Asset path escapes the public directory: ${assetPath}.`);
    return null;
  }
  return filePath;
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function readWebpDimensions(buffer) {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunk = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (chunk === "VP8X" && dataOffset + 10 <= buffer.length) {
      return {
        width: 1 + buffer.readUIntLE(dataOffset + 4, 3),
        height: 1 + buffer.readUIntLE(dataOffset + 7, 3),
      };
    }

    if (chunk === "VP8 " && dataOffset + 10 <= buffer.length) {
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    if (chunk === "VP8L" && dataOffset + 5 <= buffer.length) {
      const packed = buffer.readUInt32LE(dataOffset + 1);
      return {
        width: 1 + (packed & 0x3fff),
        height: 1 + ((packed >> 14) & 0x3fff),
      };
    }

    offset = dataOffset + size + (size % 2);
  }
  return null;
}

async function readJson(url) {
  try {
    return JSON.parse(await readFile(url, "utf8"));
  } catch (error) {
    console.error(`Unable to parse ${url.pathname}: ${error.message}`);
    process.exit(1);
  }
}
