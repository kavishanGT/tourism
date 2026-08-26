-- V14: Content Management - add workflow columns to destination/attraction/experience
-- ── Destinations ──────────────────────────────────────────────────────────────
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS published_by UUID,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE destinations
ADD CONSTRAINT fk_destinations_published_by FOREIGN KEY (published_by) REFERENCES users(id);
-- ── Attractions ───────────────────────────────────────────────────────────────
ALTER TABLE attractions
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS published_by UUID,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE attractions
ADD CONSTRAINT fk_attractions_published_by FOREIGN KEY (published_by) REFERENCES users(id);
-- ── Experiences ───────────────────────────────────────────────────────────────
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS published_by UUID,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE experiences
ADD CONSTRAINT fk_experiences_published_by FOREIGN KEY (published_by) REFERENCES users(id);
-- ── Media metadata ────────────────────────────────────────────────────────────
ALTER TABLE media
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS content_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS file_size BIGINT,
    ADD COLUMN IF NOT EXISTS width INTEGER,
    ADD COLUMN IF NOT EXISTS height INTEGER,
    ADD COLUMN IF NOT EXISTS uploaded_by UUID,
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE';
ALTER TABLE media
ADD CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id);
-- ── Reviews: add rejection_reason for moderation ─────────────────────────────
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;