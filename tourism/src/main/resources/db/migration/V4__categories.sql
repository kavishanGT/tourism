CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);
CREATE TABLE destination_categories (
    destination_id UUID NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (destination_id, category_id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE TABLE attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    duration_minutes INTEGER,
    price_from NUMERIC(12, 2),
    currency CHAR(3) DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
);
CREATE INDEX idx_attractions_destination ON attractions(destination_id);
CREATE INDEX idx_attractions_location ON attractions USING GIST(location);
CREATE INDEX idx_attractions_status ON attractions(status);
CREATE TABLE attraction_categories (
    attraction_id UUID NOT NULL,
    category_id UUID NOT NULL,
    PRIMARY KEY (attraction_id, category_id),
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);