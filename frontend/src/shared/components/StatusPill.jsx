import { getStatusLabel } from '../constants/requestStatus';

const BASE_CLASS = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
const STATUS_CLASS_MAP = {
  unassigned: 'bg-slate-50 text-slate-700 border border-slate-200',
  open: 'bg-blue-50 text-blue-700 border border-blue-200',
  assigned: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  in_progress: 'bg-amber-50 text-amber-700 border border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
  canceled: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function StatusPill({ status }) {
  const fallback = 'bg-slate-100 text-slate-700 border';
  return (
    <span className={`${BASE_CLASS} ${STATUS_CLASS_MAP[status] ?? fallback}`}>
      {getStatusLabel(status)}
    </span>
  );
}
