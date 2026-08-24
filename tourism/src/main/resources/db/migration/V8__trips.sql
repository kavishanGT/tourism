CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    visibility VARCHAR(30) NOT NULL DEFAULT 'PRIVATE',
    source VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_trip_dates CHECK (
        end_date IS NULL
        OR start_date IS NULL
        OR end_date >= start_date
    )
);
CREATE TABLE trip_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    day_number INTEGER NOT NULL,
    date DATE,
    title VARCHAR(250),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    UNIQUE (trip_id, day_number),
    CONSTRAINT chk_day_number CHECK (day_number > 0)
);
CREATE TABLE trip_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_day_id UUID NOT NULL,
    attraction_id UUID,
    experience_id UUID,
    restaurant_id UUID,
    accommodation_id UUID,
    title VARCHAR(250) NOT NULL,
    start_time TIME,
    end_time TIME,
    position INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    estimated_cost NUMERIC(12, 2),
    currency CHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (trip_day_id) REFERENCES trip_days(id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id),
    FOREIGN KEY (experience_id) REFERENCES experiences(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id),
    CONSTRAINT chk_trip_item_time CHECK (
        end_time IS NULL
        OR start_time IS NULL
        OR end_time >= start_time
    )
);
ALTER TABLE trip_items
ADD CONSTRAINT chk_trip_item_entity CHECK (
        (
            CASE
                WHEN attraction_id IS NOT NULL THEN 1
                ELSE 0
            END + CASE
                WHEN experience_id IS NOT NULL THEN 1
                ELSE 0
            END + CASE
                WHEN restaurant_id IS NOT NULL THEN 1
                ELSE 0
            END + CASE
                WHEN accommodation_id IS NOT NULL THEN 1
                ELSE 0
            END
        ) <= 1
    );
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, entity_type, entity_id)
);