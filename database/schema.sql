-- Database schema for Paju Restaurant CMS
-- Run this in Vercel Postgres dashboard after creating your database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu categories table
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('breakfast', 'lunch', 'dinner')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('breakfast', 'lunch', 'dinner')),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant hours table
CREATE TABLE IF NOT EXISTS restaurant_hours (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL UNIQUE,
    is_closed BOOLEAN DEFAULT false,
    -- Breakfast service
    is_breakfast_service BOOLEAN DEFAULT false,
    breakfast_open_time TIME,
    breakfast_close_time TIME,
    -- Lunch service
    is_lunch_service BOOLEAN DEFAULT false,
    lunch_open_time TIME,
    lunch_close_time TIME,
    -- Dinner service
    is_dinner_service BOOLEAN DEFAULT false,
    dinner_open_time TIME,
    dinner_close_time TIME,
    -- Legacy fields for compatibility
    open_time TIME,
    close_time TIME,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu status table
CREATE TABLE IF NOT EXISTS menu_status (
    id SERIAL PRIMARY KEY,
    menu_type VARCHAR(20) NOT NULL UNIQUE CHECK (menu_type IN ('breakfast', 'lunch', 'dinner')),
    is_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$ZQli4KsPF.oReH2gtcvOzu47zW3NZaU/viXHIVS44eA5SDaoXK8xm', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default menu categories
INSERT INTO menu_categories (name, menu_type, display_order) VALUES 
-- Breakfast categories
('Pastries', 'breakfast', 1),
('Hot Breakfast', 'breakfast', 2),
('Beverages', 'breakfast', 3),
-- Lunch categories
('Appetizer', 'lunch', 1),
('Main Course', 'lunch', 2),
('Dessert', 'lunch', 3),
('Wine List', 'lunch', 4),
-- Dinner categories
('Appetizer', 'dinner', 1),
('Main Course', 'dinner', 2),
('Dessert', 'dinner', 3),
('Wine List', 'dinner', 4)
ON CONFLICT DO NOTHING;

-- Insert default restaurant hours
INSERT INTO restaurant_hours (day_of_week, is_closed, is_breakfast_service, breakfast_open_time, breakfast_close_time, is_lunch_service, lunch_open_time, lunch_close_time, is_dinner_service, dinner_open_time, dinner_close_time, open_time, close_time) VALUES 
('Monday', false, false, null, null, true, '11:00', '15:00', true, '17:00', '21:00', '11:00', '21:00'),
('Tuesday', false, false, null, null, true, '11:00', '15:00', true, '17:00', '21:00', '11:00', '21:00'),
('Wednesday', false, false, null, null, true, '11:00', '15:00', true, '17:00', '21:00', '11:00', '21:00'),
('Thursday', false, false, null, null, true, '11:00', '15:00', true, '17:00', '21:00', '11:00', '21:00'),
('Friday', false, false, null, null, true, '11:00', '15:00', true, '17:00', '22:00', '11:00', '22:00'),
('Saturday', false, true, '08:00', '11:00', true, '11:00', '15:00', true, '17:00', '22:00', '08:00', '22:00'),
('Sunday', false, true, '09:00', '12:00', true, '12:00', '15:00', false, null, null, '09:00', '15:00')
ON CONFLICT (day_of_week) DO NOTHING;

-- Insert default menu status
INSERT INTO menu_status (menu_type, is_enabled) VALUES 
('breakfast', true),
('lunch', true),
('dinner', true)
ON CONFLICT (menu_type) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (title, description, price, category, menu_type, is_available) VALUES 
-- Sample breakfast items
('Korean Breakfast Bowl', 'Traditional rice porridge with seasoned vegetables and egg', 14.00, 'Hot Breakfast', 'breakfast', true),
('Matcha Croissant', 'Flaky pastry infused with premium matcha powder', 6.00, 'Pastries', 'breakfast', true),
('Korean Coffee', 'House blend with subtle notes of caramel and nuts', 4.00, 'Beverages', 'breakfast', true),
-- Sample lunch items
('Kimchi Jeon', 'Crispy kimchi pancake served with dipping sauce', 14.00, 'Appetizer', 'lunch', true),
('Bibimbap', 'Mixed rice bowl with seasoned vegetables and gochujang', 18.00, 'Main Course', 'lunch', true),
('Green Tea Ice Cream', 'House-made ice cream with ceremonial grade matcha', 8.00, 'Dessert', 'lunch', true),
-- Sample dinner items
('Bulgogi', 'Marinated beef with traditional Korean flavors', 28.00, 'Main Course', 'dinner', true),
('Seafood Pancake', 'Crispy pancake filled with fresh seafood', 16.00, 'Appetizer', 'dinner', true),
('Korean Plum Wine', 'Traditional maesil-ju, served chilled', 12.00, 'Wine List', 'dinner', true)
ON CONFLICT DO NOTHING;