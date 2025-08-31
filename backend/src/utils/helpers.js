import { pool } from "../db/pool.js";

export function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

export function ensureInteger(v) {
  if (v === null || v === undefined) return NaN;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

// Simple helper for required fields
export function validateRequired(fields) {
  return !fields.some(isEmpty);
}

export async function getUserRolesAndPermissions(email, client = pool) {
  const normalized = String(email).trim().toLowerCase();
  const { rows } = await client.query(
    `SELECT
       COALESCE(ARRAY_AGG(DISTINCT ur.role_name)
                FILTER (WHERE ur.role_name IS NOT NULL), ARRAY[]::text[]) AS roles,
       COALESCE(ARRAY_AGG(DISTINCT rp.permission_name)
                FILTER (WHERE rp.permission_name IS NOT NULL), ARRAY[]::text[]) AS permissions
     FROM user_roles ur
     LEFT JOIN role_permissions rp ON rp.role_name = ur.role_name
     WHERE ur.email = $1`,
    [normalized]
  );
  return rows[0] ?? { roles: [], permissions: [] };
}

