CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL,
    destination_id UUID,
    name VARCHAR(250) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    duration_minutes INTEGER,
    min_guests INTEGER NOT NULL DEFAULT 1,
    max_guests INTEGER,
    price_from NUMERIC(12, 2),
    currency CHAR(3) DEFAULT 'USD',
    location GEOGRAPHY(POINT, 4326),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    FOREIGN KEY (provider_id) REFERENCES providers(id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    CONSTRAINT chk_experience_guests CHECK (
        max_guests IS NULL
        OR max_guests >= min_guests
    )
);
CREATE TABLE experience_categories (
    experience_id UUID NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (experience_id, category_id),
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE INDEX idx_experiences_destination ON experiences(destination_id);
CREATE INDEX idx_experiences_provider ON experiences(provider_id);
CREATE INDEX idx_experiences_location ON experiences USING GIST(location);