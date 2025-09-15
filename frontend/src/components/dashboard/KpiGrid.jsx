export default function KpiGrid({ loading, openAll, assignedOpen, completedThisWeek, myCount }) {
  const val = (x) => (loading ? "—" : x);

  return (
    <section>
      <h2 className="sr-only">KPIs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Ανοιχτά Αιτήματα</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{val(openAll)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Ανατεθειμένα σε εμένα</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{val(assignedOpen)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Ολοκληρώθηκαν αυτή την εβδομάδα</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{val(completedThisWeek)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Δικά μου αιτήματα</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{val(myCount)}</div>
        </div>
      </div>
    </section>
  );
}
