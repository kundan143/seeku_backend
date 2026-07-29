const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const RENDER_TIMEOUT_MS = 20000;
const MERGE_TAG_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

const MIME_BY_EXTENSION = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

let browserPromise = null;
const logoDataUriCache = new Map();

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
      .then((browser) => {
        browser.on("disconnected", () => {
          browserPromise = null;
        });
        return browser;
      });
  }
  return browserPromise;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractMergeTags(html) {
  const tags = new Set();
  let match;
  MERGE_TAG_PATTERN.lastIndex = 0;
  while ((match = MERGE_TAG_PATTERN.exec(html || "")) !== null) {
    tags.add(match[1]);
  }
  return Array.from(tags);
}

function mergeTemplate(html, data) {
  return String(html || "").replace(MERGE_TAG_PATTERN, (_, key) => escapeHtml(data ? data[key] : ""));
}

function getLogoDataUri(logoPath) {
  if (!logoPath) return "";
  try {
    const resolvedPath = path.join(__dirname, "..", "public", logoPath.replace(/^\//, ""));
    const ext = path.extname(resolvedPath).toLowerCase();
    const mimeType = MIME_BY_EXTENSION[ext];
    if (!mimeType) return "";

    const stat = fs.statSync(resolvedPath);
    const cacheKey = `${resolvedPath}:${stat.mtimeMs}`;
    if (logoDataUriCache.has(cacheKey)) {
      return logoDataUriCache.get(cacheKey);
    }

    const base64 = fs.readFileSync(resolvedPath).toString("base64");
    const dataUri = `data:${mimeType};base64,${base64}`;
    logoDataUriCache.clear();
    logoDataUriCache.set(cacheKey, dataUri);
    return dataUri;
  } catch (e) {
    return "";
  }
}

async function withSandboxedPage(fn) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", (req) => req.abort());
    return await withTimeout(fn(page), RENDER_TIMEOUT_MS, "PDF render");
  } finally {
    await page.close();
  }
}

async function renderHtmlToPdfBuffer(html) {
  return withSandboxedPage(async (page) => {
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    // Puppeteer's page.pdf() returns a Uint8Array (not a Node Buffer) — wrap it
    // so downstream .toString("base64") actually base64-encodes the bytes
    // instead of joining raw byte values with commas.
    const pdfBytes = await page.pdf({ format: "A4", printBackground: true, margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" } });
    return Buffer.from(pdfBytes);
  });
}

async function renderHtmlToPdfFile(html, filePath) {
  await withSandboxedPage(async (page) => {
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.pdf({ path: filePath, format: "A4", printBackground: true, margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" } });
  });
}

module.exports = {
  escapeHtml,
  extractMergeTags,
  mergeTemplate,
  getLogoDataUri,
  renderHtmlToPdfBuffer,
  renderHtmlToPdfFile,
};
