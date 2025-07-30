const supabase = require('../config/supabase');

// ───────── COMPANY OPERATIONS ─────────
async function findById(id) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function createCompany(company) {
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateCompany(id, updates) {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = {
  findById,
  createCompany,
  updateCompany
}; 