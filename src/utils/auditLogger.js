const { supabase } = require('../config/supabase');

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {number} params.userId - User ID who performed the action
 * @param {number} params.companyId - Company ID for tenant isolation
 * @param {string} params.action - Action performed (e.g., 'CREATE_VEHICLE', 'UPDATE_INSPECTION')
 * @param {string} params.resourceType - Type of resource affected (e.g., 'vehicle', 'inspection')
 * @param {number|null} params.resourceId - ID of the resource affected (null for general actions)
 * @param {Object} params.details - Additional details about the action
 * @returns {Promise<Object>} Created audit log entry
 */
const createAuditLog = async ({ userId, companyId, action, resourceType, resourceId, details }) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        company_id: companyId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
        ip_address: null, // Could be added from request object if needed
        user_agent: null, // Could be added from request object if needed
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating audit log:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createAuditLog:', error);
    return null;
  }
};

/**
 * Get audit logs for a company with filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {number} filters.companyId - Company ID
 * @param {number} filters.userId - Optional user ID filter
 * @param {string} filters.action - Optional action filter
 * @param {string} filters.resourceType - Optional resource type filter
 * @param {string} filters.startDate - Optional start date filter
 * @param {string} filters.endDate - Optional end date filter
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Audit logs with pagination
 */
const getAuditLogs = async (filters, page = 1, limit = 10) => {
  try {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        users!audit_logs_user_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('company_id', filters.companyId);

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', filters.companyId);

    if (countError) {
      console.error('Error getting audit log count:', countError);
      return { logs: [], total: 0 };
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit;
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting audit logs:', error);
      return { logs: [], total: 0 };
    }

    return {
      logs: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    return { logs: [], total: 0 };
  }
};

/**
 * Get audit logs for a specific resource
 * @param {number} companyId - Company ID
 * @param {string} resourceType - Type of resource
 * @param {number} resourceId - ID of the resource
 * @param {number} limit - Maximum number of logs to return (default: 50)
 * @returns {Promise<Array>} Audit logs for the resource
 */
const getResourceAuditLogs = async (companyId, resourceType, resourceId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        users!audit_logs_user_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('company_id', companyId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting resource audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getResourceAuditLogs:', error);
    return [];
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getResourceAuditLogs
}; 