const fs = require("fs");
const pdfParse = require("pdf-parse");

const MAX_CHARS = 3000;
const OVERLAP_CHARS = 300;

// Splits text into ~MAX_CHARS chunks on paragraph boundaries where possible, with a
// trailing overlap carried into the next chunk so a fact split across the boundary
// still appears whole in at least one chunk.
function chunkText(text) {
    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const chunks = [];
    let current = "";

    for (const paragraph of paragraphs) {
        if (current && current.length + paragraph.length + 1 > MAX_CHARS) {
            chunks.push(current);
            current = current.slice(-OVERLAP_CHARS);
        }
        current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
    if (current) chunks.push(current);

    return chunks;
}

exports.extractChunksFromPdf = async function (absolutePath) {
    const buffer = fs.readFileSync(absolutePath);
    const { text } = await pdfParse(buffer);
    return chunkText(text);
};
