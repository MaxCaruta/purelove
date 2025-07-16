-- Fix admin RPC function to use correct column name 'type' instead of 'message_type'
-- This fixes the error: column m.message_type does not exist

-- First, drop the existing function
DROP FUNCTION IF EXISTS get_all_messages_for_admin(text, text);

-- Recreate the function with correct column references
CREATE OR REPLACE FUNCTION get_all_messages_for_admin(user_id_param text, profile_id_param text)
RETURNS json AS $$
DECLARE
    messages_json json;
BEGIN
    -- Log the function call for debugging
    RAISE LOG 'get_all_messages_for_admin called with user_id: %, profile_id: %', user_id_param, profile_id_param;
    
    -- Get all messages between the user and profile
    SELECT json_agg(
        json_build_object(
            'id', m.id,
            'conversation_id', m.conversation_id,
            'content', m.content,
            'role', CASE 
                WHEN m.sender_id::text = user_id_param THEN 'user'
                ELSE 'assistant'
            END,
            'message_type', m.type,  -- Use 'type' column but alias as 'message_type' for compatibility
            'timestamp', m.created_at,
            'sender_id', m.sender_id,
            'receiver_id', m.receiver_id,
            'is_admin_response', false
        ) ORDER BY m.created_at ASC
    ) INTO messages_json
    FROM messages m
    WHERE (
        (m.sender_id::text = user_id_param AND m.receiver_id::text = profile_id_param) OR
        (m.sender_id::text = profile_id_param AND m.receiver_id::text = user_id_param)
    );
    
    -- Return the messages as JSON
    RETURN COALESCE(messages_json, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure admin users can execute this function
GRANT EXECUTE ON FUNCTION get_all_messages_for_admin(text, text) TO authenticated;

-- Also recreate the admin conversation function to use correct column
CREATE OR REPLACE FUNCTION get_admin_conversation(user_id_param text, profile_id_param text)
RETURNS json AS $$
DECLARE
    conversation_data json;
    user_data json;
    profile_data json;
    messages_data json;
    settings_data json;
BEGIN
    -- Get user data
    SELECT json_build_object(
        'id', p.id,
        'firstName', p.first_name,
        'lastName', p.last_name,
        'email', au.email
    ) INTO user_data
    FROM profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE p.id::text = user_id_param;
    
    -- Get profile data  
    SELECT json_build_object(
        'id', p.id,
        'firstName', p.first_name,
        'lastName', p.last_name,
        'photos', COALESCE(p.photos, '[]'::jsonb),
        'verified', COALESCE(p.verified, false)
    ) INTO profile_data
    FROM profiles p
    WHERE p.id::text = profile_id_param;
    
    -- Get messages using correct column name
    SELECT json_agg(
        json_build_object(
            'id', m.id,
            'conversationId', m.conversation_id,
            'content', m.content,
            'role', CASE 
                WHEN m.sender_id::text = user_id_param THEN 'user'
                ELSE 'assistant'
            END,
            'timestamp', m.created_at,
            'isAdminResponse', false
        ) ORDER BY m.created_at ASC
    ) INTO messages_data
    FROM messages m
    WHERE (
        (m.sender_id::text = user_id_param AND m.receiver_id::text = profile_id_param) OR
        (m.sender_id::text = profile_id_param AND m.receiver_id::text = user_id_param)
    );
    
    -- Try to get conversation settings (may fail due to RLS)
    BEGIN
        SELECT json_build_object(
            'notifications', COALESCE(cs.notifications, true),
            'sounds', COALESCE(cs.sounds, true)
        ) INTO settings_data
        FROM conversation_settings cs
        WHERE cs.user_id::text = user_id_param AND cs.profile_id::text = profile_id_param;
    EXCEPTION WHEN OTHERS THEN
        -- Default settings if can't access
        settings_data := '{"notifications": true, "sounds": true}'::json;
    END;
    
    -- Build final conversation object
    SELECT json_build_object(
        'id', COALESCE(
            (SELECT id FROM conversations WHERE 
             (user1_id::text = user_id_param AND user2_id::text = profile_id_param) OR
             (user1_id::text = profile_id_param AND user2_id::text = user_id_param)
            ),
            gen_random_uuid()
        ),
        'userId', user_id_param,
        'profileId', profile_id_param,
        'user', user_data,
        'profile', profile_data,
        'messages', COALESCE(messages_data, '[]'::json),
        'settings', settings_data,
        'status', 'active',
        'lastMessage', CASE 
            WHEN messages_data IS NOT NULL AND json_array_length(messages_data) > 0 
            THEN (messages_data->-1->>'content')
            ELSE ''
        END,
        'lastMessageAt', CASE 
            WHEN messages_data IS NOT NULL AND json_array_length(messages_data) > 0 
            THEN (messages_data->-1->>'timestamp')
            ELSE now()::text
        END
    ) INTO conversation_data;
    
    RETURN conversation_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_admin_conversation(text, text) TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema'; 