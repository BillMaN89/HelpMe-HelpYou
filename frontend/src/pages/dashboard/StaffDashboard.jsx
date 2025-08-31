import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import http from "../../shared/lib/http";
import { API } from "../../shared/constants/api";

import DashboardHeader from "../../components/dashboard/HeaderDashboard";
import QuickActions from "../../components/dashboard/QuickActions";
import RequestList from "../../components/dashboard/RequestList";
import FancyMetricTile from "../../components/dashboard/FancyMetricTile";
import { ClipboardList, ClipboardCheck, Clock } from "lucide-react";

export default function StaffDashboardFancy() {
  const { user, hasRole, can } = useAuth();
  const [mine, setMine] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [allReqs, setAllReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      try {
        const calls = [];
        if (hasRole("patient") && can("view_own_requests")) calls.push(http.get(API.REQUESTS.MINE));
        if (can("view_assigned_requests")) calls.push(http.get(API.REQUESTS.ASSIGNED_TO_ME));
        if (can("view_requests")) calls.push(http.get(API.REQUESTS.ALL));
        const [mineRes, assignedRes, allRes] = await Promise.allSettled(calls);

        let i = 0;
        if (hasRole("patient") && can("view_own_requests")) {
          const r = mineRes ?? (calls.length > 0 ? mineRes : null);
          if (r?.status === "fulfilled") setMine(r.value.data ?? []);
          i++;
        }
        if (can("view_assigned_requests")) {
          const r = calls.length > i ? assignedRes ?? null : null;
          if (r?.status === "fulfilled") setAssigned(r.value.data ?? []);
          i++;
        }
        if (can("view_requests")) {
          const r = calls.length > i ? allRes ?? null : null;
          if (r?.status === "fulfilled") setAllReqs(r.value.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, [hasRole, can]);

  const myCount = mine.length;
  const assignedOpen = assigned.filter(r => !["completed","canceled"].includes(r?.status)).length;
  const openAll = allReqs.filter(r => ["unassigned","assigned","in_progress"].includes(r?.status)).length;
  const completedThisWeek = 0; // TODO: timestamp στο αίτημα

  return (
    <div className="space-y-6">
      <DashboardHeader subtitle="Γρήγορη εικόνα & ενέργειες με βάση τα δικαιώματά σου." />

      <QuickActions />

      {/* KPIs ως Fancy tiles */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {can("view_requests") && (
          <FancyMetricTile
            title="Ανοιχτά (σύνολο)"
            value={openAll}
            Icon={ClipboardList}
            tone="primary"
            subtext={loading ? "..." : "unassigned/assigned/in_progress"}
          />
        )}

        {can("view_assigned_requests") && (
          <FancyMetricTile
            title="Ανατεθειμένα σε μένα"
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

// Alternative: Business style KPIs
// import BizMetricTile from "../../components/dashboard/BizMetricStyle";
// export default function StaffDashboardBusiness() {
//   const { hasRole, can } = useAuth();
//   const [mine, setMine] = useState([]);
//   const [assigned, setAssigned] = useState([]);
//   const [allReqs, setAllReqs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function boot() {
//       try {
//         const calls = [];
//         if (hasRole("patient") && can("view_own_requests")) calls.push(http.get(API.REQUESTS.MINE));
//         if (can("view_assigned_requests")) calls.push(http.get(API.REQUESTS.ASSIGNED_TO_ME));
//         if (can("view_requests")) calls.push(http.get(API.REQUESTS.ALL));
//         const [mineRes, assignedRes, allRes] = await Promise.allSettled(calls);

//         let i = 0;
//         if (hasRole("patient") && can("view_own_requests")) {
//           const r = mineRes ?? (calls.length > 0 ? mineRes : null);
//           if (r?.status === "fulfilled") setMine(r.value.data ?? []);
//           i++;
//         }
//         if (can("view_assigned_requests")) {
//           const r = calls.length > i ? assignedRes ?? null : null;
//           if (r?.status === "fulfilled") setAssigned(r.value.data ?? []);
//           i++;
//         }
//         if (can("view_requests")) {
//           const r = calls.length > i ? allRes ?? null : null;
//           if (r?.status === "fulfilled") setAllReqs(r.value.data ?? []);
//         }
//       } finally {
//         setLoading(false);
//       }
//     }
//     boot();
//   }, [hasRole, can]);

//   const myCount = mine.length;
//   const assignedOpen = assigned.filter(r => !["completed","canceled"].includes(r?.status)).length;
//   const openAll = allReqs.filter(r => ["unassigned","assigned","in_progress"].includes(r?.status)).length;
//   const completedThisWeek = 0; // TODO

//   return (
//     <div className="space-y-6">
//       <DashboardHeader subtitle="Συνοπτική εικόνα λειτουργίας. Ό,τι μετριέται, βελτιώνεται." />

//       <QuickActions />

//       {/* KPIs σε business style */}
//       <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//         {can("view_requests") && (
//           <BizMetricTile
//             title="Ανοιχτά (σύνολο)"
//             value={openAll}
//             delta={0}          // TODO: diff vs last week
//             deltaLabel="από την προηγ. εβδομάδα"
//             positiveIsGood={false} 
//           />
//         )}

//         {can("view_assigned_requests") && (
//           <BizMetricTile
//             title="Ανατεθειμένα σε μένα"
//             value={assignedOpen}
//             delta={0}
//             deltaLabel="vs. χθες"
//             positiveIsGood={false}
//           />
//         )}

//         {can("view_requests") && (
//           <BizMetricTile
//             title="Ολοκληρώθηκαν (εβδ.)"
//             value={completedThisWeek}
//             delta={0}
//             deltaLabel="vs. προηγ. εβδ."
//             positiveIsGood={true} // περισσότερα completed = καλό
//           />
//         )}

//         {hasRole("patient") && can("view_own_requests") && (
//           <BizMetricTile
//             title="Δικά μου αιτήματα"
//             value={myCount}
//             delta={0}
//             deltaLabel="vs. χθες"
//             positiveIsGood={false}
//           />
//         )}
//       </section>

//       {/* Lists */}
//       <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         <RequestList
//           title={hasRole("patient") ? "Τα τελευταία αιτήματά μου" : "Ανατεθειμένα σε μένα"}
//           items={hasRole("patient") ? mine : assigned}
//           linkToAll={hasRole("patient") ? "/app/requests" : "/app/requests/assigned"}
//           loading={loading}
//           emptyMessage={hasRole("patient") ? "Δεν έχεις αιτήματα." : "Δεν έχεις ανατεθειμένα."}
//         />
//         <RequestList
//           title={can("view_requests") ? "Τελευταία αιτήματα (σύνολο)" : "Χρήσιμες πληροφορίες"}
//           items={can("view_requests") ? allReqs : []}
//           linkToAll={can("view_requests") ? "/app/requests" : undefined}
//           loading={loading}
//           emptyMessage="Καθαρός ουρανός — ούτε ένα αίτημα."
//         />
//       </section>
//     </div>
//   );
// }

// Default: Simple lists only
// import KpiGrid from "../../components/dashboard/KpiGrid";
// export default function DashboardPage() {
//   const { user, hasRole, can } = useAuth();
//   const [mine, setMine] = useState([]);
//   const [assigned, setAssigned] = useState([]);
//   const [allReqs, setAllReqs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function boot() {
//       try {
//         const calls = [];
//         // Patient
//         if (hasRole("patient") && can("view_own_requests")) {
//           calls.push(http.get(API.REQUESTS.MINE));
//         }
//         // Staff
//         if (can("view_assigned_requests")) {
//           calls.push(http.get(API.REQUESTS.ASSIGNED_TO_ME));
//         }
//         // Staff/Admin
//         if (can("view_requests")) {
//           calls.push(http.get(API.REQUESTS.ALL));
//         }

//         const [mineRes, assignedRes, allRes] = await Promise.allSettled(calls);

//         let i = 0;
//         if (hasRole("patient") && can("view_own_requests")) {
//           const r = mineRes ?? calls.length > 0 ? mineRes : null;
//           if (r?.status === "fulfilled") setMine(r.value.data ?? []);
//           i++;
//         }
//         if (can("view_assigned_requests")) {
//           const r = calls.length > i ? (assignedRes ?? null) : null;
//           if (r?.status === "fulfilled") setAssigned(r.value.data ?? []);
//           i++;
//         }
//         if (can("view_requests")) {
//           const r = calls.length > i ? (allRes ?? null) : null;
//           if (r?.status === "fulfilled") setAllReqs(r.value.data ?? []);
//         }
//       } finally {
//         setLoading(false);
//       }
//     }
//     boot();
//   }, [hasRole, can]);

//   // KPIs (simple logic)
//   const myCount = mine.length;
//   const assignedOpen = assigned.filter((r) => !["completed", "canceled"].includes(r?.status)).length;
//   const openAll = allReqs.filter((r) => ["unassigned", "assigned", "in_progress"].includes(r?.status)).length;
//   const completedThisWeek = 0; // TODO: timestamp στο αίτημα

//   return (
//     <div className="space-y-6">
//       {/* Heading */}
//         <DashboardHeader
//         // προαιρετικά: μπορείς να αφήσεις το default title με το όνομα
//         subtitle="Γρήγορη εικόνα & ενέργειες με βάση τα δικαιώματά σου."
//         right={<span>{new Date().toLocaleDateString('el-GR')}</span>}
//         />

//       {/* Quick actions */}
//       <QuickActions />

//       {/* KPIs */}
//       <KpiGrid
//         loading={loading}
//         openAll={openAll}
//         assignedOpen={assignedOpen}
//         completedThisWeek={completedThisWeek}
//         myCount={myCount}
//       />

//       {/* Lists */}
//       <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         <RequestList
//           title={hasRole("patient") ? "Τα τελευταία αιτήματά μου" : "Ανατεθειμένα σε μένα"}
//           items={hasRole("patient") ? mine : assigned}
//           linkToAll={hasRole("patient") ? "/app/requests" : "/app/requests/assigned"}
//           loading={loading}
//           emptyMessage={hasRole("patient") ? "Δεν έχεις αιτήματα." : "Δεν έχεις ανατεθειμένα."}
//         />

//         <RequestList
//           title={can("view_requests") ? "Τελευταία αιτήματα (σύνολο)" : "Χρήσιμες πληροφορίες"}
//           items={can("view_requests") ? allReqs : []}
//           linkToAll={can("view_requests") ? "/app/requests" : undefined}
//           loading={loading}
//           emptyMessage="Καθαρός ουρανός — ούτε ένα αίτημα."
//         />
//       </section>
//     </div>
//   );
// }

