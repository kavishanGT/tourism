CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID,
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_regions_parent FOREIGN KEY (parent_id) REFERENCES regions(id)
);
CREATE INDEX idx_regions_location ON regions USING GIST(location);
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_destinations_region FOREIGN KEY (region_id) REFERENCES regions(id)
);
CREATE INDEX idx_destinations_region ON destinations(region_id);
CREATE INDEX idx_destinations_location ON destinations USING GIST(location);
CREATE INDEX idx_destinations_status ON destinations(status);
CREATE INDEX idx_destinations_featured ON destinations(featured)
WHERE featured = TRUE;