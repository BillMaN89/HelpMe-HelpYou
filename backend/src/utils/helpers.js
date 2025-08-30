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