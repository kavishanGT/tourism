INSERT INTO roles (name, description)
VALUES ('USER', 'Regular tourist user'),
    ('PROVIDER', 'Tourism service provider'),
    ('ADMIN', 'Platform administrator'),
    ('SUPER_ADMIN', 'System administrator');
INSERT INTO interests (name, slug)
VALUES ('Beach', 'beach'),
    ('Wildlife', 'wildlife'),
    ('Adventure', 'adventure'),
    ('Hiking', 'hiking'),
    ('Culture', 'culture'),
    ('Heritage', 'heritage'),
    ('Food', 'food'),
    ('Photography', 'photography'),
    ('Surfing', 'surfing'),
    ('Diving', 'diving'),
    ('Wellness', 'wellness'),
    ('Nature', 'nature'),
    ('Family', 'family'),
    ('Romance', 'romance');
INSERT INTO categories (name, slug)
VALUES ('Beaches', 'beaches'),
    ('Wildlife', 'wildlife'),
    ('Adventure', 'adventure'),
    ('Hiking', 'hiking'),
    ('Heritage', 'heritage'),
    ('Culture', 'culture'),
    ('Food', 'food'),
    ('Surfing', 'surfing'),
    ('Diving', 'diving'),
    ('Wellness', 'wellness'),
    ('Nature', 'nature'),
    ('Safari', 'safari'),
    ('Whale Watching', 'whale-watching'),
    ('Photography', 'photography');
INSERT INTO regions (name, slug, description)
VALUES ('Western', 'western', 'Western Sri Lanka'),
    (
        'Central',
        'central',
        'Central highlands and surrounding areas'
    ),
    (
        'Southern',
        'southern',
        'Southern coastal region'
    ),
    ('Northern', 'northern', 'Northern Sri Lanka'),
    ('Eastern', 'eastern', 'Eastern Sri Lanka'),
    (
        'North Central',
        'north-central',
        'Ancient cultural heartland'
    ),
    (
        'North Western',
        'north-western',
        'North western region'
    ),
    ('Uva', 'uva', 'Mountain and southeastern region'),
    (
        'Sabaragamuwa',
        'sabaragamuwa',
        'Rainforest and heritage region'
    );
INSERT INTO destinations (
        region_id,
        name,
        slug,
        short_description,
        description,
        location,
        featured,
        status
    )
SELECT id,
    'Ella',
    'ella',
    'A scenic mountain destination surrounded by tea plantations.',
    'Ella is a popular hill-country destination known for hiking, waterfalls, tea plantations and scenic landscapes.',
    ST_SetSRID(
        ST_MakePoint(81.0466, 6.8667),
        4326
    )::geography,
    TRUE,
    'PUBLISHED'
FROM regions
WHERE slug = 'uva';
INSERT INTO destinations (
        region_id,
        name,
        slug,
        short_description,
        description,
        location,
        featured,
        status
    )
SELECT id,
    'Mirissa',
    'mirissa',
    'A beautiful southern coastal destination.',
    'Mirissa is known for its beach, surfing and whale watching experiences.',
    ST_SetSRID(
        ST_MakePoint(80.4588, 5.9483),
        4326
    )::geography,
    TRUE,
    'PUBLISHED'
FROM regions
WHERE slug = 'southern';
INSERT INTO destinations (
        region_id,
        name,
        slug,
        short_description,
        description,
        location,
        featured,
        status
    )
SELECT id,
    'Kandy',
    'kandy',
    'A cultural city in the central hills of Sri Lanka.',
    'Kandy is an important cultural destination surrounded by mountains and home to the Temple of the Sacred Tooth Relic.',
    ST_SetSRID(
        ST_MakePoint(80.6337, 7.2906),
        4326
    )::geography,
    TRUE,
    'PUBLISHED'
FROM regions
WHERE slug = 'central';