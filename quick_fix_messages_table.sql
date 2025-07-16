-- Quick fix: Add image_url column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Also add other media columns for future features
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS voice_url TEXT,
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS document_size TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Update type constraint to allow image type
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
    
    -- Add new constraint with all message types
    ALTER TABLE messages ADD CONSTRAINT messages_type_check 
    CHECK (type IN ('text', 'emoji', 'image', 'gift', 'voice', 'document', 'location'));
EXCEPTION WHEN OTHERS THEN
    -- If there's an error, just continue
    NULL;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('image_url', 'voice_url', 'type')
ORDER BY column_name;
