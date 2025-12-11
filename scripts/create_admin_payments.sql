-- Create admin_payments table
CREATE TABLE IF NOT EXISTS admin_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10, 2) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  month INTEGER,
  year INTEGER,
  status VARCHAR(50) DEFAULT 'pending'
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_payments_user_id ON admin_payments(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_admin_payments_created_at ON admin_payments(created_at);

-- Create an index on month and year for grouping
CREATE INDEX IF NOT EXISTS idx_admin_payments_month_year ON admin_payments(year, month);
