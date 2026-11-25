import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface AuditLogItem {
  id?: string;
  adminId: string;
  adminEmail?: string;
  action: string; // e.g. 'CREATE_PROVIDER', 'UPDATE_PROVIDER', 'BULK_PUBLISH', 'DELETE_PROVIDER', 'TOGGLE_SEO'
  entityType: string; // e.g. 'PROVIDER', 'CATEGORY', 'LOCATION', 'SETTINGS'
  entityId: string;
  details?: Record<string, any>;
  createdAt?: string;
}

// In-memory store for audit logs (resilient fallback)
export const localAuditLogs: AuditLogItem[] = [
  {
    id: 'init-audit-log-1',
    adminId: 'super-admin-root',
    adminEmail: 'admin@baseera.com',
    action: 'INITIALIZE_SUPER_ADMIN_PANEL',
    entityType: 'SYSTEM',
    entityId: 'baseera-system',
    details: { phase: 1, initializedAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
  },
];

/**
 * Records an audit log entry to Supabase and in-memory fallback.
 */
export async function recordAuditLog(entry: AuditLogItem): Promise<void> {
  const item: AuditLogItem = {
    id: entry.id || crypto.randomUUID(),
    adminId: entry.adminId || 'system-admin',
    adminEmail: entry.adminEmail || 'admin@baseera.com',
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    details: entry.details || {},
    createdAt: entry.createdAt || new Date().toISOString(),
  };

  // 1. In-memory append (newest first)
  localAuditLogs.unshift(item);
  if (localAuditLogs.length > 500) {
    localAuditLogs.pop();
  }

  // 2. Persist to Supabase if connected
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from('audit_logs').insert({
        id: item.id,
        admin_id: item.adminId,
        admin_email: item.adminEmail,
        action: item.action,
        entity_type: item.entityType,
        entity_id: item.entityId,
        details: item.details,
        created_at: item.createdAt,
      });
    } catch (err: any) {
      console.warn('AuditLog Supabase notice:', err?.message || err);
    }
  }
}

/**
 * Retrieves the most recent audit logs.
 */
export async function getAuditLogs(limit = 50): Promise<AuditLogItem[]> {
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          adminId: row.admin_id,
          adminEmail: row.admin_email,
          action: row.action,
          entityType: row.entity_type,
          entityId: row.entity_id,
          details: row.details,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn('getAuditLogs Supabase note:', err);
    }
  }

  return localAuditLogs.slice(0, limit);
}
