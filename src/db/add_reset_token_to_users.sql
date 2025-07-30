-- Add reset token fields to users table
ALTER TABLE public.users 
ADD COLUMN reset_token text,
ADD COLUMN reset_token_expiry timestamptz;

-- Create index for reset token lookups
CREATE INDEX idx_users_reset_token ON public.users(reset_token); 