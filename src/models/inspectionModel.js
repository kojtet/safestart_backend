const supabase = require('../config/supabase');

// ───────── INSPECTION OPERATIONS ─────────
async function findById(id, companyId) {
  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      vehicles (id, name, license_plate, vehicle_type),
      users (id, full_name, email),
      checklist_templates (id, title)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listInspections(filters = {}, page = 1, limit = 20) {
  let query = supabase
    .from('inspections')
    .select(`
      *,
      vehicles (id, name, license_plate, vehicle_type),
      users (id, full_name, email),
      checklist_templates (id, title)
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
    inspections: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
}

async function createInspection(inspection) {
  const { data, error } = await supabase
    .from('inspections')
    .insert(inspection)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateInspection(id, updates) {
  const { data, error } = await supabase
    .from('inspections')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ───────── INSPECTION ANSWERS OPERATIONS ─────────
async function getInspectionWithAnswers(inspectionId, companyId) {
  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      vehicles (id, name, license_plate, vehicle_type),
      users (id, full_name, email),
      checklist_templates (id, title),
      inspection_answers (
        id,
        item_id,
        value_bool,
        value_text,
        value_number,
        value_photo_url,
        checklist_items (
          id,
          label,
          input_type,
          is_required,
          sort_order
        )
      )
    `)
    .eq('id', inspectionId)
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function createInspectionAnswers(inspectionId, answers) {
  // answers should be an array of answer objects
  const answerData = answers.map(answer => ({
    inspection_id: inspectionId,
    ...answer
  }));

  const { data, error } = await supabase
    .from('inspection_answers')
    .insert(answerData)
    .select();
  if (error) throw error;
  return data;
}

async function updateInspectionAnswers(inspectionId, answers) {
  // First delete existing answers
  await supabase
    .from('inspection_answers')
    .delete()
    .eq('inspection_id', inspectionId);

  // Then create new answers
  return await createInspectionAnswers(inspectionId, answers);
}

// ───────── STATISTICS ─────────
async function getInspectionStats(companyId, startDate = null, endDate = null) {
  let query = supabase
    .from('inspections')
    .select('status, created_at')
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
    pass: data.filter(i => i.status === 'pass').length,
    fail: data.filter(i => i.status === 'fail').length,
    needs_attention: data.filter(i => i.status === 'needs_attention').length
  };

  return stats;
}

module.exports = {
  findById,
  listInspections,
  createInspection,
  updateInspection,
  getInspectionWithAnswers,
  createInspectionAnswers,
  updateInspectionAnswers,
  getInspectionStats
}; 