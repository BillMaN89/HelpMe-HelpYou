import { Link } from "react-router-dom";
import { getServiceTypeLabel } from "../../shared/constants/serviceTypes";
import { getStatusLabel } from "../../shared/constants/requestStatus";

function fmtDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("el-GR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusPill({ status }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const map = {
    unassigned: "bg-slate-50 text-slate-700 border border-slate-200",
    open: "bg-blue-50 text-blue-700 border border-blue-200",
    assigned: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    in_progress: "bg-amber-50 text-amber-700 border border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
    canceled: "bg-rose-50 text-rose-700 border border-rose-200",
  };
  return <span className={`${base} ${map[status] ?? "bg-slate-100 text-slate-700 border"}`}>{getStatusLabel(status)}</span>;
}

export default function RequestList({ title, items = [], linkToAll, loading, emptyMessage = "Δεν υπάρχουν εγγραφές." }) {
  const rows = Array.isArray(items) ? items.slice(0, 5) : [];

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {linkToAll && (
          <Link to={linkToAll} className="text-sm text-indigo-600 hover:underline">
            Προβολή όλων
          </Link>
        )}
      </div>

      {loading ? (
        <div className="mt-4 py-3 text-sm text-slate-400">Φόρτωση…</div>
      ) : rows.length === 0 ? (
        <div className="mt-4 py-6 text-sm text-slate-500">{emptyMessage}</div>
      ) : (
        <div className="mt-3 divide-y">
          {rows.map((r) => (
            <div key={r.request_id ?? JSON.stringify(r)} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">#{r.request_id}</span>
                  <span className="text-slate-700">{getServiceTypeLabel(r.service_type)}</span>
                  <StatusPill status={r.status} />
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">{fmtDate(r.updated_at ?? r.created_at)}</div>
              </div>
              {r.description && (
                <div className="mt-1 text-sm text-slate-700 truncate" title={r.description}>
                  {r.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
