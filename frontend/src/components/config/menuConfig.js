// import { useEffect, useMemo, useState } from 'react';
// import { DASHBOARD_CARDS } from './menuConfig';
// import { useAuth } from '../auth/AuthContext';
// import http from '../../shared/lib/http';

// export function useDashboardCards() {
//   const auth = useAuth();
//   const visible = useMemo(
//     () => DASHBOARD_CARDS.filter(c => c.showIf(auth)),
//     [auth.user] // refilter on user change
//   );

//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState(null);

//   useEffect(() => {
//     let cancel = false;
//     setLoading(true);
//     setErr(null);

//     http.get('/dashboard/summary')
//       .then(({ data }) => { if (!cancel) setSummary(data); })
//       .catch((e) => { if (!cancel) setErr(e); })
//       .finally(() => { if (!cancel) setLoading(false); });

//     return () => { cancel = true; };
//   }, [auth.user?.email]); // refetch on user change

//   // enrich ορατές κάρτες με value από summary (αν έχουν fetchKey)
//   const cards = visible.map(card => {
//     if (card.kind === 'metric') {
//       const value = summary?.[card.fetchKey] ?? card.fallback ?? 0;
//       return { ...card, value };
//     }
//     return card;
//   });

//   return { cards, loading, err };
// }
