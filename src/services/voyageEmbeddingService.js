const axios = require("axios");
const MODEL = "voyage-3";
const BATCH_SIZE = 64;
const MAX_RETRIES = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Voyage's rate limit is low enough that even one multi-batch document upload can trip
// it. Retries on 429 with the server's Retry-After header when present, otherwise
// exponential backoff, before giving up.
async function postWithRetry(payload) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await axios.post(`${process.env.VOYAGE_EMBEDDINGS_URL}`, payload, {
                headers: { Authorization: `Bearer ${process.env.VOYAGE_API_KEY}` },
            });
        } catch (e) {
            const status = e.response?.status;
            if (status !== 429 || attempt === MAX_RETRIES) {
                // e.config carries the Authorization header (the API key) - never let the
                // raw axios error escape this module, in case a caller logs/returns it as-is.
                throw new Error(`Voyage embeddings request failed${status ? ` (${status})` : ""}: ${e.message}`);
            }
            const retryAfter = Number(e.response.headers?.["retry-after"]);
            const delayMs = retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt;
            await sleep(delayMs);
        }
    }
}

// input_type: "document" when embedding chunks for storage, "query" when embedding a
// search query - Voyage applies different prompt prefixes internally for each, which
// improves retrieval quality over embedding both the same way.
async function embedTexts(texts, inputType) {
    const results = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const { data } = await postWithRetry({ input: batch, model: MODEL, input_type: inputType });
        results.push(...data.data.map((d) => d.embedding));
    }
    return results;
}

exports.embedDocumentChunks = (chunks) => embedTexts(chunks, "document");
exports.embedQuery = async (query) => (await embedTexts([query], "query"))[0];
