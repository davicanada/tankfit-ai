import { readFile } from "node:fs/promises";

const productFile = new URL("../data/catalog/products.json", import.meta.url);
const commerceFile = new URL("../data/catalog/demo-commerce.json", import.meta.url);
const companyFile = new URL("../data/companies/companies.json", import.meta.url);

const [catalog, commerce, companyRegistry] = await Promise.all([
  readJson(productFile),
  readJson(commerceFile),
  readJson(companyFile),
]);

const errors = [];
const products = catalog.products;
const items = commerce.items;
const companies = companyRegistry.companies;

if (!Array.isArray(products) || products.length < 10) {
  errors.push("The descriptive catalog must contain at least 10 products.");
}

if (!Array.isArray(items)) {
  errors.push("The commerce seed must contain an items array.");
}

if (!Array.isArray(companies) || companies.length < 4) {
  errors.push("The company registry must contain at least four fictional companies.");
}

if (errors.length === 0) {
  validateProducts(products, errors);
  validateCommerce(products, items, errors);
  validateCompanies(companies, errors);
}

if (errors.length > 0) {
  console.error("Catalog validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Catalog validation passed: ${products.length} descriptive products, ${items.length} commerce records, and ${companies.length} company records.`,
  );
}

async function readJson(url) {
  try {
    return JSON.parse(await readFile(url, "utf8"));
  } catch (error) {
    console.error(`Unable to parse ${url.pathname}: ${error.message}`);
    process.exit(1);
  }
}

function validateProducts(entries, validationErrors) {
  const ids = new Set();
  const slugs = new Set();
  const imagePaths = new Set();

  for (const [index, product] of entries.entries()) {
    const location = `products[${index}]`;
    requireString(product, "id", location, validationErrors);
    requireString(product, "slug", location, validationErrors);
    requireString(product, "name", location, validationErrors);
    requireString(product, "description", location, validationErrors);
    requireString(product, "measurementMethod", location, validationErrors);
    requireNonEmptyArray(product, "supportedMaterials", location, validationErrors);
    requireNonEmptyArray(product, "supportedTankTypes", location, validationErrors);
    requireNonEmptyArray(product, "connectivity", location, validationErrors);
    requireNonEmptyArray(product, "capabilities", location, validationErrors);
    requireNonEmptyArray(product, "constraints", location, validationErrors);

    if (product.fictional !== true) {
      validationErrors.push(`${location}.fictional must be true.`);
    }

    if (ids.has(product.id)) validationErrors.push(`Duplicate product id: ${product.id}.`);
    if (slugs.has(product.slug)) validationErrors.push(`Duplicate product slug: ${product.slug}.`);
    ids.add(product.id);
    slugs.add(product.slug);

    const imagePath = product.image?.path;
    if (typeof imagePath !== "string" || !imagePath.startsWith("/images/products/") || !imagePath.endsWith(".webp")) {
      validationErrors.push(`${location}.image.path must use /images/products/*.webp.`);
    } else if (imagePaths.has(imagePath)) {
      validationErrors.push(`Duplicate image path: ${imagePath}.`);
    } else {
      imagePaths.add(imagePath);
    }

    if (typeof product.image?.alt !== "string" || product.image.alt.trim() === "") {
      validationErrors.push(`${location}.image.alt is required.`);
    }
  }

  for (const product of entries) {
    for (const accessoryId of product.compatibleAccessories ?? []) {
      if (!ids.has(accessoryId)) {
        validationErrors.push(`${product.id} references unknown accessory ${accessoryId}.`);
      }
    }
  }
}

function validateCommerce(productsList, commerceItems, validationErrors) {
  const productIds = new Set(productsList.map((product) => product.id));
  const commerceIds = new Set();
  const allowedAvailability = new Set(["in_stock", "limited", "backorder", "unavailable"]);

  for (const [index, item] of commerceItems.entries()) {
    const location = `items[${index}]`;
    requireString(item, "productId", location, validationErrors);

    if (!productIds.has(item.productId)) {
      validationErrors.push(`${location} references unknown product ${item.productId}.`);
    }
    if (commerceIds.has(item.productId)) {
      validationErrors.push(`Duplicate commerce record for ${item.productId}.`);
    }
    commerceIds.add(item.productId);

    requireNonNegativeNumber(item, "unitPriceCad", location, validationErrors);
    requireNonNegativeNumber(item, "monthlyServiceCad", location, validationErrors);
    requireNonNegativeInteger(item, "stockQuantity", location, validationErrors);
    requireNonNegativeInteger(item, "leadTimeBusinessDays", location, validationErrors);

    if (!allowedAvailability.has(item.availability)) {
      validationErrors.push(`${location}.availability is invalid.`);
    }
    if (item.availability === "unavailable" && item.stockQuantity !== 0) {
      validationErrors.push(`${location} cannot be unavailable with positive stock.`);
    }
  }

  for (const productId of productIds) {
    if (!commerceIds.has(productId)) {
      validationErrors.push(`Missing commerce record for ${productId}.`);
    }
  }
}

function validateCompanies(entries, validationErrors) {
  const ids = new Set();
  const paths = new Set();

  for (const [index, company] of entries.entries()) {
    const location = `companies[${index}]`;
    requireString(company, "id", location, validationErrors);
    requireString(company, "name", location, validationErrors);
    requireString(company, "role", location, validationErrors);
    requireString(company, "description", location, validationErrors);
    requireString(company, "logoPath", location, validationErrors);
    requireString(company, "logoAlt", location, validationErrors);

    if (company.fictional !== true) {
      validationErrors.push(`${location}.fictional must be true.`);
    }
    if (ids.has(company.id)) validationErrors.push(`Duplicate company id: ${company.id}.`);
    ids.add(company.id);

    if (typeof company.logoPath !== "string" || !company.logoPath.startsWith("/images/logos/") || !company.logoPath.endsWith(".svg")) {
      validationErrors.push(`${location}.logoPath must use /images/logos/*.svg.`);
    } else if (paths.has(company.logoPath)) {
      validationErrors.push(`Duplicate company logo path: ${company.logoPath}.`);
    } else {
      paths.add(company.logoPath);
    }
  }
}

function requireString(object, key, location, validationErrors) {
  if (typeof object?.[key] !== "string" || object[key].trim() === "") {
    validationErrors.push(`${location}.${key} must be a non-empty string.`);
  }
}

function requireNonEmptyArray(object, key, location, validationErrors) {
  if (!Array.isArray(object?.[key]) || object[key].length === 0) {
    validationErrors.push(`${location}.${key} must be a non-empty array.`);
  }
}

function requireNonNegativeNumber(object, key, location, validationErrors) {
  if (typeof object?.[key] !== "number" || !Number.isFinite(object[key]) || object[key] < 0) {
    validationErrors.push(`${location}.${key} must be a non-negative number.`);
  }
}

function requireNonNegativeInteger(object, key, location, validationErrors) {
  if (!Number.isInteger(object?.[key]) || object[key] < 0) {
    validationErrors.push(`${location}.${key} must be a non-negative integer.`);
  }
}
