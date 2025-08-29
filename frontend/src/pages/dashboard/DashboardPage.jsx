import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import http from "../../shared/lib/http";
import { API } from "../../shared/constants/api";

import QuickActions from "../../components/dashboard/QuickActions";
import KpiGrid from "../../components/dashboard/KpiGrid";
import RequestList from "../../components/dashboard/RequestList";

export default function DashboardPage() {
  const { user, hasRole, can } = useAuth();
  const [mine, setMine] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [allReqs, setAllReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      try {
        const calls = [];
        // Patient: δικά μου αιτήματα
        if (hasRole("patient") && can("view_own_requests")) {
          calls.push(http.get(API.REQUESTS.MINE));
        }
        // Staff: ανατεθειμένα σε μένα
        if (can("view_assigned_requests")) {
          calls.push(http.get(API.REQUESTS.ASSIGNED_TO_ME));
        }
        // Staff/Admin: όλα τα αιτήματα (για KPIs/δεξιά λίστα)
        if (can("view_requests")) {
          calls.push(http.get(API.REQUESTS.ALL));
        }

        const [mineRes, assignedRes, allRes] = await Promise.allSettled(calls);

        // Προσοχή: τα results θα έρθουν με σειρά calls. Οπότε “ματσάρω” με βάση τα ifs.
        let i = 0;
        if (hasRole("patient") && can("view_own_requests")) {
          const r = mineRes ?? calls.length > 0 ? mineRes : null;
          if (r?.status === "fulfilled") setMine(r.value.data ?? []);
          i++;
        }
        if (can("view_assigned_requests")) {
          const r = calls.length > i ? (assignedRes ?? null) : null;
          if (r?.status === "fulfilled") setAssigned(r.value.data ?? []);
          i++;
        }
        if (can("view_requests")) {
          const r = calls.length > i ? (allRes ?? null) : null;
          if (r?.status === "fulfilled") setAllReqs(r.value.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    boot();
    // δεν βάζω http/API στα deps. RBAC functions σταθερές από context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRole, can]);

  // KPIs (απλή λογική για ξεκίνημα)
  const myCount = mine.length;
  const assignedOpen = assigned.filter((r) => !["completed", "canceled"].includes(r?.status)).length;
  const openAll = allReqs.filter((r) => ["unassigned", "assigned", "in_progress"].includes(r?.status)).length;
  const completedThisWeek = 0; // TODO: όταν αποφασίσεις κριτήρια με timestamps

  return (
    <div className="space-y-6">
      {/* Heading */}
      <section className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Καλωσήρθες{user?.first_name ? `, ${user.first_name}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600">Γρήγορη εικόνα & ενέργειες με βάση τα δικαιώματά σου.</p>
        </div>
        <div className="hidden sm:block text-sm text-slate-500">{/* optional filters/date */}</div>
      </section>

      {/* Quick actions */}
      <QuickActions />

      {/* KPIs */}
      <KpiGrid
        loading={loading}
        openAll={openAll}
        assignedOpen={assignedOpen}
        completedThisWeek={completedThisWeek}
        myCount={myCount}
      />

      {/* Lists */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RequestList
          title={hasRole("patient") ? "Τα τελευταία αιτήματά μου" : "Ανατεθειμένα σε μένα"}
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

