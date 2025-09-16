import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import http from "../../shared/lib/http";
import { API } from "../../shared/constants/api";

import DashboardHeader from "../../components/dashboard/HeaderDashboard";
import QuickActions from "../../components/dashboard/QuickActions";
import RequestList from "../../components/dashboard/RequestList";
import FancyMetricTile from "../../components/dashboard/FancyMetricTile";
import { ClipboardList, ClipboardCheck, Clock } from "lucide-react";
import { REQUEST_STATUS, REQUEST_STATUS_LABEL } from "../../shared/constants/requestStatus";

export default function StaffDashboardFancy() {
  const { user, hasRole, can } = useAuth();
  const [mine, setMine] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [allReqs, setAllReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      try {
        // Build promises in fixed order
        const pMine = hasRole("patient") && can("view_own_requests")
          ? http.get(API.REQUESTS.MINE)
          : undefined;
        const pAssigned = can("view_assigned_requests")
          ? http.get(API.REQUESTS.ASSIGNED_TO_ME)
          : undefined;
        const pAll = can("view_requests")
          ? http.get(API.REQUESTS.ALL)
          : undefined;

        const [mineRes, assignedRes, allRes] = await Promise.allSettled([
          pMine,
          pAssigned,
          pAll,
        ]);

        if (pMine) {
          if (mineRes?.status === "fulfilled") setMine(mineRes.value?.data?.requests ?? []);
          else setMine([]);
        }
        if (pAssigned) {
          if (assignedRes?.status === "fulfilled") setAssigned(assignedRes.value?.data?.requests ?? []);
          else setAssigned([]);
        }
        if (pAll) {
          if (allRes?.status === "fulfilled") setAllReqs(allRes.value?.data?.requests ?? []);
          else setAllReqs([]);
        }
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, [hasRole, can]);

  const myCount = mine.length;
  const CLOSED_STATUSES = [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.CANCELLED];
  const assignedOpen = assigned.filter(r => !CLOSED_STATUSES.includes(r?.status)).length;
  const OPEN_STATUSES = [
    REQUEST_STATUS.UNASSIGNED,
    REQUEST_STATUS.ASSIGNED,
    REQUEST_STATUS.IN_PROGRESS,
  ];
  const openAll = allReqs.filter(r => OPEN_STATUSES.includes(r?.status)).length;
  const completedThisWeek = 0; // TODO: timestamp στο αίτημα

  return (
    <div className="space-y-6">
      <DashboardHeader subtitle="Γρήγορη εικόνα & πίνακας ενεργειών." />

      <QuickActions />

      {/* KPIs as Fancy tiles */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {can("view_requests") && (
          <FancyMetricTile
            title="Ανοιχτά (σύνολο)"
            value={openAll}
            Icon={ClipboardList}
            tone="primary"
            subtext={loading ? "..." : OPEN_STATUSES.map(s => REQUEST_STATUS_LABEL[s]).join("/")}
          />
        )}

        {can("view_assigned_requests") && (
          <FancyMetricTile
            title="Ανατεθειμένα σε εμένα"
            value={assignedOpen}
            Icon={Clock}
            tone="caution"
            subtext={loading ? "..." : "εκκρεμή"}
          />
        )}

        {can("view_requests") && (
          <FancyMetricTile
            title="Ολοκληρώθηκαν (εβδ.)"
            value={completedThisWeek}
            Icon={ClipboardCheck}
            tone="success"
            subtext="θα μπει με timestamps"
          />
        )}

        {hasRole("patient") && can("view_own_requests") && (
          <FancyMetricTile
            title="Δικά μου αιτήματα"
            value={myCount}
            Icon={ClipboardList}
            tone="default"
          />
        )}
      </section>

      {/* Lists */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RequestList
          title={hasRole("patient") ? "Τα τελευταία αιτήματά μου" : "Ανατεθειμένα σε εμένα"}
          items={hasRole("patient") ? mine : assigned}
          linkToAll={hasRole("patient") ? "/app/requests" : "/app/requests/assigned"}
          loading={loading}
          emptyMessage={hasRole("patient") ? "Δεν έχεις αιτήματα." : "Δεν έχεις ανατεθειμένα."}
        />
        <RequestList
          title={can("view_requests") ? "Τελευταία αιτήματα (σύνολο)" : "Χρήσιμες πληροφορίες"}
          items={can("view_requests") ? allReqs : []}
          linkToAll={can("view_requests") ? "/app/requests" : undefined}
          loading={loading}
          emptyMessage="Καθαρός ουρανός — ούτε ένα αίτημα."
        />
      </section>
    </div>
  );
}
