const supabase = require('../config/supabase');

// ───────── READ ─────────
async function findByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listByCompany(companyId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, is_active, created_at')
    .eq('company_id', companyId);
  if (error) throw error;
  return data;
}

async function findByResetToken(token) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('reset_token', token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ───────── WRITE ─────────
async function createUser(user) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateUser(id, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateResetToken(id, resetToken, resetTokenExpiry) {
  const { error } = await supabase
    .from('users')
    .update({
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry
    })
    .eq('id', id);
  if (error) throw error;
}

async function updatePassword(id, passwordHash) {
  const { error } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expiry: null
    })
    .eq('id', id);
  if (error) throw error;
}

module.exports = { 
  findByEmail, 
  findById, 
  listByCompany, 
  findByResetToken,
  createUser, 
  updateUser,
  updateResetToken,
  updatePassword
};
