const supabase = require('../config/supabase');

// ───────── READ ─────────
async function findById(id, companyId) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findByLicensePlate(licensePlate) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('license_plate', licensePlate)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listVehicles(filters = {}, search = '', page = 1, limit = 20) {
  let query = supabase
    .from('vehicles')
    .select('*', { count: 'exact' });

  // Apply filters
  Object.keys(filters).forEach(key => {
    query = query.eq(key, filters[key]);
  });

  // Apply search
  if (search) {
    query = query.or(`name.ilike.%${search}%,license_plate.ilike.%${search}%,vehicle_type.ilike.%${search}%`);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    vehicles: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
}

// ───────── WRITE ─────────
async function createVehicle(vehicle) {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateVehicle(id, updates) {
  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = {
  findById,
  findByLicensePlate,
  listVehicles,
  createVehicle,
  updateVehicle
}; 