const path = require("path");
const { cableSpecDocument } = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");
const logger = require("../services/dailyLogService");
const { extractChunksFromPdf } = require("../services/pdfChunkService");
const { embedDocumentChunks, embedQuery } = require("../services/voyageEmbeddingService");

const PUBLIC_ROOT = path.join(__dirname, "..", "public");
const absolutePathForFileUrl = (file_url) => path.join(PUBLIC_ROOT, file_url);

async function reindexDocument(documentId, file_url) {
    await sequelize.query(
        `DELETE FROM cable_spec_document_chunk WHERE document_id = :documentId`,
        { replacements: { documentId } }
    );

    const chunks = await extractChunksFromPdf(absolutePathForFileUrl(file_url));
    if (!chunks.length) {
        throw new Error("No extractable text found in this PDF");
    }

    const embeddings = await embedDocumentChunks(chunks);
    for (let i = 0; i < chunks.length; i++) {
        await sequelize.query(
            `INSERT INTO cable_spec_document_chunk (document_id, chunk_index, chunk_text, embedding)
             VALUES (:documentId, :chunkIndex, :chunkText, :embedding::vector)`,
            {
                replacements: {
                    documentId,
                    chunkIndex: i,
                    chunkText: chunks[i],
                    embedding: `[${embeddings[i].join(",")}]`,
                },
            }
        );
    }
    return chunks.length;
}

exports.addData = async function (body) {
    const t = await sequelize.transaction();
    let result;
    try {
        result = await cableSpecDocument.create(body.data, { transaction: t });
        await t.commit();
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Add Document";
        return responseCodes.BAD_REQUEST;
    }

    try {
        await reindexDocument(result.id, body.data.file_url);
        responseCodes.SUCCESS.data = result.id;
        responseCodes.SUCCESS.message = "Document Added and Indexed Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        logger.error(`cable_spec_document ${result.id} indexing failed: ${e.message}`);
        responseCodes.SUCCESS.data = result.id;
        responseCodes.SUCCESS.message = `Document saved, but indexing failed: ${e.message}. Use reindexRow to retry.`;
        return responseCodes.SUCCESS;
    }
};

exports.updateData = async function (body) {
    const t = await sequelize.transaction();
    try {
        await cableSpecDocument.update(body.data, { where: { id: body.id }, transaction: t });
        await t.commit();
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Update Document";
        return responseCodes.BAD_REQUEST;
    }

    if (body.data.file_url) {
        try {
            await reindexDocument(body.id, body.data.file_url);
        } catch (e) {
            logger.error(`cable_spec_document ${body.id} reindexing failed: ${e.message}`);
            responseCodes.SUCCESS.data = null;
            responseCodes.SUCCESS.message = `Document updated, but re-indexing failed: ${e.message}. Use reindexRow to retry.`;
            return responseCodes.SUCCESS;
        }
    }
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Document Updated Successfully";
    return responseCodes.SUCCESS;
};

exports.reindexRow = async function (body) {
    try {
        const doc = await cableSpecDocument.findOne({ where: { id: body.id, status: 1 } });
        if (!doc) {
            responseCodes.NOT_FOUND.data = null;
            responseCodes.NOT_FOUND.message = "No Record Found";
            return responseCodes.NOT_FOUND;
        }
        const chunkCount = await reindexDocument(doc.id, doc.file_url);
        responseCodes.SUCCESS.data = { chunkCount };
        responseCodes.SUCCESS.message = "Document Re-indexed Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = `Failed to Re-index Document: ${e.message}`;
        return responseCodes.BAD_REQUEST;
    }
};

// Required lazily (not at module top) to avoid a load-order issue with the circular
// require - cableDesignAI.js itself requires this module for retrieveRelevantChunks.
exports.extractData = async function (body) {
    try {
        const doc = await cableSpecDocument.findOne({ where: { id: body.id, status: 1 } });
        if (!doc) {
            responseCodes.NOT_FOUND.data = null;
            responseCodes.NOT_FOUND.message = "No Record Found";
            return responseCodes.NOT_FOUND;
        }
        const cableDesignAI = require("../services/cableDesignAI");
        const extractedDesign = await cableDesignAI.extractDesignFromPdf(absolutePathForFileUrl(doc.file_url));
        await cableSpecDocument.update(
            { extracted_design: extractedDesign, extracted_at: new Date() },
            { where: { id: doc.id } }
        );
        responseCodes.SUCCESS.data = extractedDesign;
        responseCodes.SUCCESS.message = "Data Extracted Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = null;
        responseCodes.BAD_REQUEST.message = `Failed to Extract Data: ${e.message}`;
        return responseCodes.BAD_REQUEST;
    }
};

exports.deleteData = async function (body) {
    const t = await sequelize.transaction();
    try {
        await cableSpecDocument.update(body.data, { where: { id: body.id }, transaction: t });
        await t.commit();
        responseCodes.SUCCESS.data = null;
        responseCodes.SUCCESS.message = "Document Deleted Successfully";
        return responseCodes.SUCCESS;
    } catch (e) {
        await t.rollback();
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Delete Document";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getAllData = async function () {
    try {
        const query = `
            SELECT d.*, COUNT(c.id) AS chunk_count
            FROM cable_spec_document d
            LEFT JOIN cable_spec_document_chunk c ON c.document_id = d.id
            WHERE d.status = 1
            GROUP BY d.id
            ORDER BY d.id DESC`;
        const data = await sequelize.query(query, { type: QueryTypes.SELECT });
        responseCodes.SUCCESS.data = data;
        responseCodes.SUCCESS.message = "";
        return responseCodes.SUCCESS;
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Documents";
        return responseCodes.BAD_REQUEST;
    }
};

exports.getOneData = async function (id) {
    try {
        const data = await cableSpecDocument.findOne({ where: { id, status: 1 } });
        if (data) {
            responseCodes.SUCCESS.data = data;
            responseCodes.SUCCESS.message = "";
            return responseCodes.SUCCESS;
        } else {
            responseCodes.NOT_FOUND.data = null;
            responseCodes.NOT_FOUND.message = "No Record Found";
            return responseCodes.NOT_FOUND;
        }
    } catch (e) {
        responseCodes.BAD_REQUEST.data = e;
        responseCodes.BAD_REQUEST.message = "Failed to Load Document";
        return responseCodes.BAD_REQUEST;
    }
};

// Used by cableDesignAI.generateDesign() to ground a design in relevant spec passages.
// Best-effort: any failure (missing API key, no indexed documents, network error) logs
// and returns an empty array rather than blocking design generation.
exports.retrieveRelevantChunks = async function (queryText, topK = 5) {
    try {
        const queryEmbedding = await embedQuery(queryText);
        const query = `
            SELECT c.chunk_text, d.file_name, d.cable_standard,
                   1 - (c.embedding <=> :queryVec::vector) AS similarity
            FROM cable_spec_document_chunk c
            JOIN cable_spec_document d ON d.id = c.document_id
            WHERE d.status = 1
            ORDER BY c.embedding <=> :queryVec::vector
            LIMIT :topK`;
        return await sequelize.query(query, {
            replacements: { queryVec: `[${queryEmbedding.join(",")}]`, topK },
            type: QueryTypes.SELECT,
        });
    } catch (e) {
        logger.error(`retrieveRelevantChunks failed: ${e.message}`);
        return [];
    }
};
