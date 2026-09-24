-- V1__init_schema.sql - Database schema for SIH26132 Farmer Market Linkage Platform

-- 1. Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'ROLE_FARMER', 'ROLE_BUYER', 'ROLE_ADMIN'
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farmer Profiles
CREATE TABLE farmer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    village VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    preferred_language VARCHAR(50) DEFAULT 'Hindi',
    farm_size VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buyer Profiles
CREATE TABLE buyer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address VARCHAR(300),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    verified BOOLEAN DEFAULT FALSE,
    rating DOUBLE PRECISION DEFAULT 4.5,
    total_transactions INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crops
CREATE TABLE crops (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    unit VARCHAR(30) DEFAULT 'Quintal'
);

-- 5. Crop Varieties
CREATE TABLE crop_varieties (
    id BIGSERIAL PRIMARY KEY,
    crop_id BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT uk_crop_variety UNIQUE (crop_id, name)
);

-- 6. Markets (Mandi yards)
CREATE TABLE markets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address VARCHAR(300),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- 7. Market Prices
CREATE TABLE market_prices (
    id BIGSERIAL PRIMARY KEY,
    market_id BIGINT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    crop_id BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    variety_id BIGINT REFERENCES crop_varieties(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    min_price DOUBLE PRECISION NOT NULL,
    max_price DOUBLE PRECISION NOT NULL,
    modal_price DOUBLE PRECISION NOT NULL,
    arrival_quantity DOUBLE PRECISION DEFAULT 0.0,
    unit VARCHAR(30) DEFAULT '₹/Quintal',
    source VARCHAR(100) DEFAULT 'AGMARKNET',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_market_crop_variety_date UNIQUE (market_id, crop_id, variety_id, date)
);

-- Indexes for Market Prices
CREATE INDEX idx_market_prices_crop_id ON market_prices(crop_id);
CREATE INDEX idx_market_prices_market_id ON market_prices(market_id);
CREATE INDEX idx_market_prices_date ON market_prices(date);
CREATE INDEX idx_market_prices_crop_market_date ON market_prices(crop_id, market_id, date);

-- 8. Buyer Requirements
CREATE TABLE buyer_requirements (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
    crop_id BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    variety_id BIGINT REFERENCES crop_varieties(id) ON DELETE SET NULL,
    quantity DOUBLE PRECISION NOT NULL,
    minimum_quality VARCHAR(50) DEFAULT 'GRADE_A',
    required_date DATE NOT NULL,
    location VARCHAR(200),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    offer_price DOUBLE PRECISION NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSED', 'EXPIRED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buyer_requirements_crop_variety_status ON buyer_requirements(crop_id, variety_id, status);

-- 9. Farmer Crops (Available harvest lots)
CREATE TABLE farmer_crops (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    crop_id BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    variety_id BIGINT REFERENCES crop_varieties(id) ON DELETE SET NULL,
    quantity DOUBLE PRECISION NOT NULL,
    available_date DATE NOT NULL,
    expected_price DOUBLE PRECISION,
    quality VARCHAR(50) DEFAULT 'GRADE_A',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'SOLD'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farmer_crops_crop_variety_status ON farmer_crops(crop_id, variety_id, status);

-- 10. Offers (Trade negotiations between Farmer and Buyer)
CREATE TABLE offers (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    buyer_id BIGINT NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
    requirement_id BIGINT REFERENCES buyer_requirements(id) ON DELETE SET NULL,
    crop_id BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    quantity DOUBLE PRECISION NOT NULL,
    price_per_unit DOUBLE PRECISION NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'COMPLETED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_farmer_status ON offers(farmer_id, status);
CREATE INDEX idx_offers_buyer_status ON offers(buyer_id, status);
