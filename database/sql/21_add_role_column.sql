-- Add role column to profiles table
-- This migration adds a role column to track user permissions

-- Add role column with default value 'user'
ALTER TABLE profiles 
ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Add check constraint to ensure only valid roles are allowed
ALTER TABLE profiles 
ADD CONSTRAINT check_role_valid 
CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create index on role column for faster admin queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Update any existing profiles to have 'user' role (in case of existing data)
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy for admin access
-- Only admins can view/modify admin-specific data
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin(auth.uid()) OR id = auth.uid());

-- Create admin audit log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create index on admin_audit_log for faster queries
CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_timestamp ON admin_audit_log(timestamp);
CREATE INDEX idx_admin_audit_log_action ON admin_audit_log(action);

-- Enable RLS on admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can access audit logs
CREATE POLICY "Only admins can access audit logs" ON admin_audit_log
    FOR ALL USING (is_admin(auth.uid()));

-- Create admin_models table for AI model configuration
CREATE TABLE IF NOT EXISTS admin_models (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT false,
    max_tokens INTEGER DEFAULT 200,
    temperature DECIMAL(3,2) DEFAULT 0.8,
    presence_penalty DECIMAL(3,2),
    frequency_penalty DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Enable RLS on admin_models
ALTER TABLE admin_models ENABLE ROW LEVEL SECURITY;

-- Only admins can manage models
CREATE POLICY "Only admins can manage models" ON admin_models
    FOR ALL USING (is_admin(auth.uid()));

-- Insert default models
INSERT INTO admin_models (id, name, provider, model, active, max_tokens, temperature, presence_penalty, frequency_penalty) 
VALUES 
    ('gpt-3.5', 'GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo', true, 200, 0.8, 0.6, 0.3),
    ('gpt-4', 'GPT-4', 'openai', 'gpt-4', false, 200, 0.7, 0.5, 0.2),
    ('claude-3', 'Claude 3 Sonnet', 'anthropic', 'claude-3-sonnet-20240229', false, 200, 0.8, null, null)
ON CONFLICT (id) DO NOTHING;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action VARCHAR(100),
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    -- Only allow admins to log actions
    IF NOT is_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Access denied: User is not an admin';
    END IF;
    
    INSERT INTO admin_audit_log (admin_id, action, details, ip_address, user_agent)
    VALUES (p_admin_id, p_action, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp on admin_models
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_models_updated_at
    BEFORE UPDATE ON admin_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT, UPDATE ON admin_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_models TO authenticated;

-- Comments for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user, admin, or super_admin';
COMMENT ON TABLE admin_audit_log IS 'Audit log for admin actions';
COMMENT ON TABLE admin_models IS 'Configuration for AI models used in chat responses';
COMMENT ON FUNCTION is_admin(UUID) IS 'Check if a user has admin privileges';
COMMENT ON FUNCTION log_admin_action IS 'Log admin actions for audit trail';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Admin role system successfully created!';
    RAISE NOTICE 'To make a user admin, run: UPDATE profiles SET role = ''admin'' WHERE email = ''your-admin-email@example.com'';';
END $$; 