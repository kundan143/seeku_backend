CREATE TABLE IF NOT EXISTS user_document_master (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users_master(id),
    doc_type        VARCHAR(50)  NOT NULL,   -- e.g. 'PAN', 'UAN', 'PF_ACCOUNT', 'AADHAR', etc.
    doc_no          VARCHAR(100),
    doc_url         VARCHAR(500),
    status          SMALLINT NOT NULL DEFAULT 1,
    created_by      BIGINT REFERENCES users_master(id),
    created_date    TIMESTAMP,
    modified_by     BIGINT REFERENCES users_master(id),
    modified_date   TIMESTAMP,
    deleted_by      BIGINT REFERENCES users_master(id),
    deleted_date    TIMESTAMP
);

COMMENT ON TABLE  user_document_master          IS 'Stores employee documents like PAN, UAN, PF Account, Aadhar, etc.';
COMMENT ON COLUMN user_document_master.doc_type IS 'Document type: PAN, UAN, PF_ACCOUNT, AADHAR, PASSPORT, etc.';
COMMENT ON COLUMN user_document_master.doc_no   IS 'Document number / identifier';
COMMENT ON COLUMN user_document_master.doc_url  IS 'Relative URL to uploaded document scan/image';
COMMENT ON COLUMN user_document_master.status   IS '1: active, 2: deleted';
