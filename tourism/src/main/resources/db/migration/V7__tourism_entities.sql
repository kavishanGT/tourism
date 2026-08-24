CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID,
    name VARCHAR(250) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    location GEOGRAPHY(POINT, 4326),
    organizer VARCHAR(250),
    ticket_required BOOLEAN NOT NULL DEFAULT FALSE,
    ticket_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    CONSTRAINT chk_event_dates CHECK (
        end_datetime IS NULL
        OR end_datetime >= start_datetime
    )
);
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID,
    provider_id UUID,
    name VARCHAR(250) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT,
    location GEOGRAPHY(POINT, 4326),
    price_level VARCHAR(20),
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID,
    provider_id UUID,
    name VARCHAR(250) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    description TEXT,
    accommodation_type VARCHAR(50),
    location GEOGRAPHY(POINT, 4326),
    price_from NUMERIC(12, 2),
    currency CHAR(3) DEFAULT 'USD',
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (destination_id) REFERENCES destinations(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);