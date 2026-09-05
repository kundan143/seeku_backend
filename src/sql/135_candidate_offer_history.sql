-- Audit trail for candidate offer revisions. The live candidates row always holds only the
-- CURRENT offer (no versioning) - this table is the append-only record of what it was before
-- each edit, so a revision isn't lost when the current row gets overwritten in place (see
-- OP_Candidates.js updateData). old_letter_url points at a copy of the Offer Letter PDF that was
-- generated for the OLD version, archived before regeneration overwrites the live file.
CREATE TABLE IF NOT EXISTS candidate_offer_history (
  id BIGSERIAL PRIMARY KEY,
  candidate_id BIGINT NOT NULL REFERENCES candidates(id),

  -- Full candidate-row snapshots (all offer/salary fields) before and after this edit, so the
  -- exact change is reconstructable without needing candidates to still hold either value.
  old_snapshot JSONB NOT NULL,
  new_snapshot JSONB NOT NULL,

  -- Archived copy of whatever Offer Letter PDF was live immediately before this edit - null if
  -- no letter had been generated yet at that point.
  old_letter_url VARCHAR(255),

  modified_by BIGINT REFERENCES users_master(id),
  modified_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidate_offer_history_candidate ON candidate_offer_history(candidate_id);

COMMENT ON TABLE candidate_offer_history IS 'Append-only history of offer revisions made via Candidates > Edit.';
COMMENT ON COLUMN candidate_offer_history.old_snapshot IS 'Full candidates row snapshot immediately before this edit.';
COMMENT ON COLUMN candidate_offer_history.new_snapshot IS 'Fields submitted as the new current offer (the values saved as the new current candidate row).';
COMMENT ON COLUMN candidate_offer_history.old_letter_url IS 'Archived copy of the Offer Letter PDF that was live before this edit, if one existed.';
