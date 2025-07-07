-- Create email_subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    source TEXT DEFAULT 'unknown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('basic', 'premium', 'deluxe')),
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'paid', 'completed', 'failed')),
    image_data JSONB,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;

-- Create RLS policies for email_subscribers
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserting email subscribers" ON email_subscribers
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Allow inserting orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updating orders" ON orders
    FOR UPDATE USING (true);

-- Create storage policies
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow public access to uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Add updated_at trigger for orders
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();