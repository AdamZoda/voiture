-- Add youtube_url column to products table
ALTER TABLE products
ADD COLUMN youtube_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN products.youtube_url IS 'URL of the product demonstration video on YouTube';