const supabase = require('../config/supabase');

// ───────── ISSUE OPERATIONS ─────────
async function findById(id, companyId) {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      vehicles (id, name, license_plate, vehicle_type),
      users (id, full_name, email)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listIssues(filters = {}, page = 1, limit = 20) {
  let query = supabase
    .from('issues')
    .select(`
      *,
      vehicles (id, name, license_plate, vehicle_type),
      users (id, full_name, email)
    `, { count: 'exact' });

  // Apply filters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null) {
      query = query.eq(key, filters[key]);
    }
  });

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    issues: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
}

async function createIssue(issue) {
  const { data, error } = await supabase
    .from('issues')
    .insert(issue)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateIssue(id, updates) {
  const { data, error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ───────── STATISTICS ─────────
async function getIssueStats(companyId, startDate = null, endDate = null) {
  let query = supabase
    .from('issues')
    .select('severity, resolved, created_at')
    .eq('company_id', companyId);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;

  const stats = {
    total: data.length,
    resolved: data.filter(i => i.resolved).length,
    unresolved: data.filter(i => !i.resolved).length,
    critical: data.filter(i => i.severity === 'critical').length,
    medium: data.filter(i => i.severity === 'medium').length,
    low: data.filter(i => i.severity === 'low').length
  };

  return stats;
}

module.exports = {
  findById,
  listIssues,
  createIssue,
  updateIssue,
  getIssueStats
}; 