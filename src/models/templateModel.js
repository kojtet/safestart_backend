const supabase = require('../config/supabase');

// ───────── TEMPLATE OPERATIONS ─────────
async function findById(id, companyId) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listTemplates(companyId, vehicleType = null) {
  let query = supabase
    .from('checklist_templates')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);

  if (vehicleType) {
    query = query.eq('vehicle_type', vehicleType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function createTemplate(template) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .insert(template)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateTemplate(id, updates) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function deleteTemplate(id) {
  const { error } = await supabase
    .from('checklist_templates')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}

// ───────── TEMPLATE ITEMS OPERATIONS ─────────
async function getTemplateWithItems(templateId, companyId) {
  const { data, error } = await supabase
    .from('checklist_templates')
    .select(`
      *,
      checklist_items (
        id,
        label,
        input_type,
        is_required,
        sort_order
      )
    `)
    .eq('id', templateId)
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function createTemplateItem(item) {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert(item)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateTemplateItem(itemId, updates) {
  const { data, error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function deleteTemplateItem(itemId) {
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', itemId);
  if (error) throw error;
}

async function reorderTemplateItems(templateId, itemOrders) {
  // itemOrders should be an array of { id, sort_order }
  const updates = itemOrders.map(item => ({
    id: item.id,
    sort_order: item.sort_order
  }));

  const { error } = await supabase
    .from('checklist_items')
    .upsert(updates);
  if (error) throw error;
}

module.exports = {
  findById,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateWithItems,
  createTemplateItem,
  updateTemplateItem,
  deleteTemplateItem,
  reorderTemplateItems
}; 