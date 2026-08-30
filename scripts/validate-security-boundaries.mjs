import { readdir, readFile } from "node:fs/promises";
import { extname, relative } from "node:path";

const repositoryRoot = new URL("../", import.meta.url);
const runtimeRoots = ["src", "app", "lib", "server"];
const runtimeExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);

const prohibitedPatterns = [
  {
    label: "raw HTML rendering",
    pattern: /dangerouslySetInnerHTML/,
  },
  {
    label: "operating-system command execution",
    pattern: /(?:node:)?child_process/,
  },
  {
    label: "dynamic eval execution",
    pattern: /\beval\s*\(/,
  },
  {
    label: "dynamic Function execution",
    pattern: /\bnew\s+Function\s*\(/,
  },
  {
    label: "user-influenced raw SQL sink",
    pattern: /\bsql\.raw\s*\(/,
  },
  {
    label: "XML parser dependency in runtime source",
    pattern: /(?:fast-xml-parser|xml2js|libxmljs|xmldom)/,
  },
  {
    label: "likely public secret environment variable",
    pattern: /NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|TOKEN|API_KEY|PRIVATE_KEY)/,
  },
];

const files = [];
for (const root of runtimeRoots) {
  await collectRuntimeFiles(new URL(`${root}/`, repositoryRoot), files);
}

const violations = [];
for (const file of files) {
  const content = await readFile(file, "utf8");
  for (const rule of prohibitedPatterns) {
    if (rule.pattern.test(content)) {
      violations.push(`${displayPath(file)}: ${rule.label}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Security-boundary validation failed:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  console.error("\nIf a prohibited capability is genuinely required, update the threat model and approve an ADR before changing this guardrail.");
  process.exitCode = 1;
} else {
  console.log(`Security-boundary validation passed across ${files.length} runtime source files.`);
}

async function collectRuntimeFiles(directoryUrl, results) {
  let entries;
  try {
    entries = await readdir(directoryUrl, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directoryUrl);
    if (entry.isDirectory()) {
      await collectRuntimeFiles(entryUrl, results);
    } else if (runtimeExtensions.has(extname(entry.name))) {
      results.push(entryUrl);
    }
  }
}

function displayPath(fileUrl) {
  return relative(repositoryRoot.pathname, fileUrl.pathname).replaceAll("\\", "/");
}
