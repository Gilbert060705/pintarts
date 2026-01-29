CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
    id  UUID gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    taste_vector vector(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paintings (
    id UUID gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    image_url TEXT NOT NULL,
    style VARCHAR(100),
    embedding vector(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS wishlists (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    painting_id UUID REFERENCES paintings(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, painting_id)
);

CREATE TABLE IF NOT EXISTS ownerships(
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    painting_id UUID REFERENCES paintings(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, painting_id)
);

CREATE TABLE IF NOT EXISTS blends(
    blend_id UUID gen_random_uuid() PRIMARY KEY, 
    first_user UUID references users(id) ON DELETE CASCADE, 
    second_user UUID references users(id) ON DELETE CASCADE, 
    blend_vector vector(512), 
    PRIMARY KEY (first_user, second_user)
);

CREATE INDEX IF NOT EXISTS ON paintings USING hnsw (embedding vector_cosine_ops);