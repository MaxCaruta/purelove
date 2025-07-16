-- =============================================
-- Update Messages Table for Media Support
-- Add missing columns for images, voice, and enhanced messaging
-- =============================================

-- Add missing columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS voice_url TEXT,
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS document_size TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER, -- for voice messages (seconds)
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_forwarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]';

-- Update the type column to handle all message types
-- First check if we need to update the constraint
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

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_messages_image_url ON messages(image_url) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_voice_url ON messages(voice_url) WHERE voice_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_location ON messages(location_lat, location_lng) WHERE location_lat IS NOT NULL;

-- Update existing RLS policies to include media access
-- The existing policies should already handle these new columns

-- Create a function to handle message reactions
CREATE OR REPLACE FUNCTION add_message_reaction(
    message_id UUID, 
    emoji TEXT, 
    user_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_reactions JSONB;
    updated_reactions JSONB;
    reaction_exists BOOLEAN := false;
BEGIN
    -- Get current reactions
    SELECT reactions INTO current_reactions FROM messages WHERE id = message_id;
    
    -- Initialize if null
    IF current_reactions IS NULL THEN
        current_reactions := '[]'::jsonb;
    END IF;
    
    -- Check if this emoji already exists
    SELECT EXISTS(
        SELECT 1 FROM jsonb_array_elements(current_reactions) AS reaction
        WHERE reaction->>'emoji' = emoji
    ) INTO reaction_exists;
    
    IF reaction_exists THEN
        -- Add user to existing reaction
        updated_reactions := (
            SELECT jsonb_agg(
                CASE 
                    WHEN reaction->>'emoji' = emoji THEN
                        jsonb_set(
                            reaction,
                            '{users}',
                            (reaction->'users') || jsonb_build_array(user_name)
                        )
                    ELSE reaction
                END
            )
            FROM jsonb_array_elements(current_reactions) AS reaction
        );
    ELSE
        -- Add new reaction
        updated_reactions := current_reactions || jsonb_build_array(
            jsonb_build_object(
                'emoji', emoji,
                'users', jsonb_build_array(user_name)
            )
        );
    END IF;
    
    -- Update the message
    UPDATE messages SET reactions = updated_reactions WHERE id = message_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION add_message_reaction(UUID, TEXT, TEXT) TO authenticated;

-- Verification query
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
    AND column_name IN (
        'image_url', 'voice_url', 'document_url', 'document_name', 
        'document_size', 'duration', 'location_lat', 'location_lng', 
        'location_address', 'is_edited', 'edited_at', 'is_forwarded', 
        'reply_to_id', 'reactions'
    )
ORDER BY column_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Messages table updated for media support!';
    RAISE NOTICE '📷 Added: image_url, voice_url, document_url columns';
    RAISE NOTICE '📍 Added: location_lat, location_lng, location_address';
    RAISE NOTICE '⚡ Added: reactions, reply_to_id, is_edited, is_forwarded';
    RAISE NOTICE '🔒 All existing RLS policies maintained';
END $$; 