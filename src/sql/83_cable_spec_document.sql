-- -- Cable specification document library for the Design & Costing module: users upload
-- -- standard/spec PDFs (IEC/IS/BS/ASTM etc.), which get chunked and embedded (Voyage AI)
-- -- so cableDesignAI.generateDesign() can retrieve relevant passages as grounding context.
-- CREATE TABLE IF NOT EXISTS cable_spec_document (
--   id BIGSERIAL PRIMARY KEY,
--   file_name VARCHAR(255) NOT NULL,
--   file_url VARCHAR(500) NOT NULL,
--   cable_standard VARCHAR(100),
--   description TEXT,
--   status SMALLINT NOT NULL DEFAULT 1,
--   created_by INTEGER NOT NULL REFERENCES users_master(id),
--   created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   modified_by INTEGER REFERENCES users_master(id),
--   modified_date TIMESTAMP,
--   deleted_by INTEGER REFERENCES users_master(id),
--   deleted_date TIMESTAMP
-- );

-- CREATE INDEX IF NOT EXISTS idx_cable_spec_document_status ON cable_spec_document(status);

-- COMMENT ON TABLE cable_spec_document IS 'Uploaded cable spec/standard PDFs (Design & Costing module); chunked and embedded into cable_spec_document_chunk for AI retrieval.';
-- COMMENT ON COLUMN cable_spec_document.file_url IS 'Path returned by /api/file/upload, e.g. /uploads/xyz.pdf';
-- COMMENT ON COLUMN cable_spec_document.cable_standard IS 'Governing standard this document covers, e.g. IEC 60502, IS 1554, BS 5467 (free text)';
-- COMMENT ON COLUMN cable_spec_document.status IS '1 = Active, 0 = Deleted (soft delete)';

-- -- voyage-3 embeddings are fixed at 1024 dimensions
-- CREATE TABLE IF NOT EXISTS cable_spec_document_chunk (
--   id BIGSERIAL PRIMARY KEY,
--   document_id BIGINT NOT NULL REFERENCES cable_spec_document(id) ON DELETE CASCADE,
--   chunk_index INTEGER NOT NULL,
--   chunk_text TEXT NOT NULL,
--   embedding vector(1024) NOT NULL,
--   created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE INDEX IF NOT EXISTS idx_cable_spec_chunk_document_id ON cable_spec_document_chunk(document_id);
-- CREATE INDEX IF NOT EXISTS idx_cable_spec_chunk_embedding ON cable_spec_document_chunk USING hnsw (embedding vector_cosine_ops);

-- COMMENT ON TABLE cable_spec_document_chunk IS 'Text chunks + embeddings of cable_spec_document PDFs, queried by cosine similarity for AI design grounding.';
-- COMMENT ON COLUMN cable_spec_document_chunk.chunk_index IS 'Order of this chunk within its source document (0-based)';
