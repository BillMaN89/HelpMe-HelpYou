import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useRequestById } from '../../hooks/userRequests';
import { getServiceTypeLabel } from '../../shared/constants/serviceTypes';
import { getStatusLabel } from '../../shared/constants/requestStatus';
import http from '../../shared/lib/http';
import { API } from '../../shared/constants/api';
import { roleLabel, userTypeLabel, departmentLabel, employeeTypeLabel } from '../../shared/constants/labels';
import { useAssignRequest } from '../../hooks/userRequests';
import Button from '../../components/Button';

function formatDate(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('el-GR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
}

export default function RequestView() {
  const { id } = useParams();
  const { data: req, isLoading, error } = useRequestById(id);
  const { can } = useAuth();
  const canViewUserProfiles = can('manage_users') || can('view_user') || can('update_user') || can('view_patient_info');
  const canAssign = can('assign_requests');

  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const assignReq = useAssignRequest();

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!req?.user_email || !canViewUserProfiles) return;
      setUserLoading(true); setUserError(null);
      try {
        const res = await http.get(API.USERS.BY_EMAIL(req.user_email));
        if (mounted) setProfile(res.data);
      } catch (err) {
        if (mounted) setUserError(err?.response?.data?.message || 'Αποτυχία φόρτωσης στοιχείων χρήστη');
      } finally {
        if (mounted) setUserLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [req?.user_email, canViewUserProfiles]);

  // Load eligible assignees depending on request service type
  useEffect(() => {
    let mounted = true;
    async function loadEligible() {
      if (!req?.service_type || !canAssign) return;
      try {
        const res = await http.get(API.USERS.LIST);
        const users = res.data?.users || [];
        const roleNeeded = req.service_type === 'social' ? 'social_worker' : (req.service_type === 'psychological' ? 'therapist' : null);
        let filtered = users;
        if (roleNeeded) {
          filtered = users.filter(u => Array.isArray(u.roles) && u.roles.includes(roleNeeded));
        }
        if (mounted) setEligible(filtered);
      } catch {
        if (mounted) setEligible([]);
      }
    }
    loadEligible();
    return () => { mounted = false; };
  }, [req?.service_type, canAssign]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Αίτημα #{id}</h1>
        <Link to="/app/requests" className="text-sm text-indigo-700 hover:underline">← Πίσω στη λίστα</Link>
      </div>

      {isLoading && (
        <div className="p-6 rounded-xl border bg-white">Φόρτωση…</div>
      )}
      {error && (
        <div className="p-6 rounded-xl border bg-white text-red-600">{error?.message || 'Σφάλμα φόρτωσης'}</div>
      )}

      {!isLoading && !error && req && (
        <div className="rounded-xl border bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ID" value={req.request_id} />
            <Field label="Ημ/νία δημιουργίας" value={formatDate(req.created_at)} />
            <Field label="Τελευταία ενημέρωση" value={formatDate(req.updated_at)} />
            <Field label="Υπηρεσία" value={getServiceTypeLabel(req.service_type)} />
            <Field label="Κατάσταση" value={getStatusLabel(req.status)} />
            <Field label="Αιτών" value={req.user_email} />
            <div>
              <div className="text-sm text-slate-500">Ανατεθειμένο σε</div>
              {!canAssign ? (
                <div className="text-m text-slate-800">{req.assigned_employee_email || '-'}</div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-md border px-2 py-1 text-sm min-w-[16rem]"
                    value={selectedAssignee || req.assigned_employee_email || ''}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    disabled={assignReq.isPending}
                  >
                    <option value="">— Επιλέξτε υπάλληλο —</option>
                    {eligible.map(u => (
                      <option key={u.email} value={u.email}>
                        {u.last_name} {u.first_name} — {u.email}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => {
                      const target = selectedAssignee || req.assigned_employee_email;
                      if (!target) return;
                      if (!window.confirm(`Ανάθεση αιτήματος στον/στην ${target};`)) return;
                      assignReq.mutate({ id: req.request_id, assigned_employee_email: target });
                    }}
                    loading={assignReq.isPending}
                  >
                    Ανάθεση
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Area label="Περιγραφή" value={req.description} />
            <Area label="Σημειώσεις υπαλλήλου" value={req.notes_from_employee} />
          </div>
        </div>
      )}

      {canViewUserProfiles && (
        <div className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-medium mb-3">Πληροφορίες Αιτούντα</h2>
          {userLoading && <div className="text-slate-600">Φόρτωση στοιχείων…</div>}
          {userError && <div className="text-red-600">{userError}</div>}
          {!userLoading && !userError && profile && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ονοματεπώνυμο" value={`${profile.last_name ?? ''} ${profile.first_name ?? ''}`.trim() || '-'} />
              <Field label="Email" value={profile.email} />
              <Field label="Τύπος χρήστη" value={userTypeLabel(profile.user_type)} />
              <Field label="Ρόλοι" value={(profile.roles || []).map(roleLabel).join(', ') || '-'} />
              {profile.user_type === 'employee' && (
                <>
                  <Field label="Τμήμα" value={departmentLabel(profile.details?.department)} />
                  <Field label="Θέση" value={employeeTypeLabel(profile.details?.employee_type)} />
                </>
              )}
              {profile.user_type === 'volunteer' && (
                <Field label="Επάγγελμα" value={profile.details?.occupation} />
              )}
              {profile.user_type === 'patient' && (
                <>
                  <Field label="Πάθηση" value={profile.details?.disease_type} />
                  <Field label="Ποσοστό αναπηρίας" value={profile.details?.handicap != null ? `${profile.details.handicap}%` : '-'} />
                </>
              )}
              <Area label="Διεύθυνση" value={composeAddress(profile.address)} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-m text-slate-800">{value ?? '-'}</div>
    </div>
  );
}

function Area({ label, value }) {
  return (
    <div className="flex flex-col">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="rounded-md border bg-slate-50 p-3 text-m text-slate-800 whitespace-pre-wrap break-words min-h-[4rem]">
        {value || '-'}
      </div>
    </div>
  );
}

function composeAddress(addr) {
  if (!addr) return '-';
  const line1 = [addr.address, addr.address_no].filter(Boolean).join(' ');
  const line2 = [addr.postal_code, addr.city].filter(Boolean).join(' ');
  return [line1, line2].filter(Boolean).join('\n');
}
