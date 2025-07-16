-- Fix the get_user_conversations function to use correct column names
CREATE OR REPLACE FUNCTION get_user_conversations()
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_user_profile JSON,
    last_message JSON,
    unread_count INTEGER,
    is_archived BOOLEAN,
    is_favorite BOOLEAN,
    last_message_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        CASE 
            WHEN c.user1_id = auth.uid() THEN c.user2_id
            ELSE c.user1_id
        END as other_user_id,
        json_build_object(
            'id', p.id,
            'user_id', p.id, -- Use p.id instead of p.user_id
            'first_name', p.first_name,
            'last_name', p.last_name,
            'photos', p.photos,
            'verified', p.verified,
            'birth_date', p.birth_date,
            'country', p.country,
            'city', p.city
        ) as other_user_profile,
        CASE 
            WHEN m.id IS NOT NULL THEN json_build_object(
                'id', m.id,
                'content', m.content,
                'created_at', m.created_at,
                'message_type', COALESCE(m.type, 'text'),
                'sender_id', m.sender_id
            )
            ELSE NULL
        END as last_message,
        CASE 
            WHEN c.user1_id = auth.uid() THEN c.user1_unread_count
            ELSE c.user2_unread_count
        END as unread_count,
        COALESCE(cs.is_archived, false) as is_archived,
        COALESCE(cs.is_favorite, false) as is_favorite,
        c.last_message_at
    FROM conversations c
    LEFT JOIN profiles p ON (
        p.id = CASE WHEN c.user1_id = auth.uid() THEN c.user2_id ELSE c.user1_id END
    )
    LEFT JOIN conversation_settings cs ON (
        cs.user_id = auth.uid() AND 
        cs.other_user_id = CASE 
            WHEN c.user1_id = auth.uid() THEN c.user2_id
            ELSE c.user1_id
        END
    )
    LEFT JOIN messages m ON c.last_message_id = m.id
    WHERE 
        (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
        AND c.is_active = true
        AND COALESCE(cs.is_archived, false) = false
    ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_conversations() TO authenticated; 