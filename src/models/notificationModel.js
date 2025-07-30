const supabase = require('../config/supabase');

// ───────── NOTIFICATION OPERATIONS ─────────
async function findById(id, userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listNotifications(userId, filters = {}, page = 1, limit = 20) {
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  // Apply filters
  if (filters.is_read !== undefined) {
    query = query.eq('is_read', filters.is_read);
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    notifications: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
}

async function createNotification(notification) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateNotification(id, updates) {
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function markAsRead(id, userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

async function markAllAsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count;
}

// ───────── BULK OPERATIONS ─────────
async function createBulkNotifications(notifications) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();
  if (error) throw error;
  return data;
}

module.exports = {
  findById,
  listNotifications,
  createNotification,
  updateNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createBulkNotifications
}; 