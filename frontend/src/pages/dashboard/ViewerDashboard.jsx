import { Link } from "react-router-dom";
import { ClipboardList, ClipboardCheck, ClipboardX, BarChart2 } from "lucide-react";
import DashboardHeader from "../../components/dashboard/HeaderDashboard";
import FancyMetricTile from "../../components/dashboard/FancyMetricTile";
import RequestList from "../../components/dashboard/RequestList";
import { useAllRequests } from "../../hooks/UseUserRequests";
import { REQUEST_STATUS } from "../../shared/constants/requestStatus";

export default function ViewerDashboard() {
  const { data, isLoading, isFetching } = useAllRequests({ page: 1, pageSize: 50 });
  const requests = Array.isArray(data?.requests)
    ? data.requests
    : Array.isArray(data)
    ? data
    : [];

  const OPEN_STATUSES = [
    REQUEST_STATUS.UNASSIGNED,
    REQUEST_STATUS.ASSIGNED,
    REQUEST_STATUS.IN_PROGRESS,
  ];

  const openCount = requests.filter(r => OPEN_STATUSES.includes(r?.status)).length;
  const completedCount = requests.filter(r => r?.status === REQUEST_STATUS.COMPLETED).length;
  const cancelledCount = requests.filter(r => r?.status === REQUEST_STATUS.CANCELLED).length;

  return (
    <div className="space-y-6">
      <DashboardHeader subtitle="Επισκόπηση πρόσφατων αιτημάτων." />

      <ViewerQuickActions isRefreshing={isFetching} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FancyMetricTile
          title="Αιτήματα (σύνολο)"
          value={requests.length}
          Icon={BarChart2}
          tone="primary"
          subtext={isFetching ? "Ανανέωση…" : ""}
        />
        <FancyMetricTile
          title="Ανοιχτά"
          value={openCount}
          Icon={ClipboardList}
          tone="default"
          subtext="Ανείσ/Ανατεθ./Σε εξέλιξη"
        />
        <FancyMetricTile
          title="Ολοκληρωμένα"
          value={completedCount}
          Icon={ClipboardCheck}
          tone="success"
          subtext="Επιτυχώς κλειστά"
        />
        <FancyMetricTile
          title="Ακυρωμένα"
          value={cancelledCount}
          Icon={ClipboardX}
          tone="caution"
          subtext="Μη ολοκληρωμένες περιπτώσεις"
        />
      </section>

      <RequestList
        title="Τελευταία αιτήματα (σύνολο)"
        items={requests}
        linkToAll="/app/requests"
        loading={isLoading}
        emptyMessage="Δεν υπάρχουν καταχωρημένα αιτήματα."
      />
    </div>
  );
}

function ViewerQuickActions({ isRefreshing }) {
  return (
    <section>
      <div className="text-center">
        <h2 className="text-sm font-semibold text-slate-700">Γρήγορες ενέργειες</h2>
        {isRefreshing && <div className="mt-1 text-xs text-slate-500">Ανανέωση…</div>}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link
          to="/app/requests"
          className="inline-flex w-full max-w-[12rem] items-center justify-center rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
        >
          Όλα τα αιτήματα
        </Link>
        <Link
          to="/app/users"
          className="inline-flex w-full max-w-[12rem] items-center justify-center rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
        >
          Διαχείριση χρηστών
        </Link>
      </div>
    </section>
  );
}
