import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import http from '../../shared/lib/http';
import { API } from '../../shared/constants/api';
import { roleLabel, userTypeLabel, USER_TYPE_OPTIONS } from '../../shared/constants/labels';
import { useAuth } from '../../components/auth/AuthContext';
import UserInfoCard from '../../components/profile/UserInfoCard';
import AddressCard from '../../components/profile/AddressCard';
import ExtraInfoCard from '../../components/profile/ExtraInfoCard';
import { toast } from 'react-toastify';

function formatDateEl(iso) {
  if (!iso) return '-';
  // Fast path for YYYY-MM-DD
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(iso);
  if (m) {
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  }
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    return dt.toLocaleDateString('el-GR');
  } catch {
    return iso;
  }
}

export default function UserProfileView() {
  const { email } = useParams();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  async function reloadUser() {
    setLoading(true);
    setError(null);
    try {
      const res = await http.get(API.USERS.BY_EMAIL(email));
      setUser(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Αποτυχία φόρτωσης προφίλ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reloadUser(); }, [email]);

  // ---------- Editing permissions & helpers ----------
  const canManage = auth.can('manage_users');
  const canUpdate = auth.can('update_user');

  const EDITABLE_USERS = [
    'first_name','last_name','dob','birth_place','phone_no','mobile','occupation'
  ];
  const EDITABLE_ADDRESS = ['address','address_no','postal_code','city'];

  const editable = useMemo(() => {
    if (!user) return { users: [], address: [], extra: [] };
    const users = (canManage || canUpdate) ? EDITABLE_USERS : [];
    const address = (canManage || canUpdate) ? EDITABLE_ADDRESS : [];
    let extra = [];
    if (canManage) {
      if (user.user_type === 'patient') extra = ['disease_type','handicap','emergency_contact'];
      else if (user.user_type === 'volunteer') extra = ['occupation','has_vehicle'];
      else if (user.user_type === 'employee') extra = ['department','employee_type','has_vehicle'];
    }
    return { users, address, extra };
  }, [user, canManage, canUpdate]);

  async function submitUsers(fields) {
    const payload = { target_email: email, user_fields: fields };
    const { data } = await http.patch(API.USERS.ME, payload);
    setUser(data?.user ?? data);
    toast.success('Τα βασικά στοιχεία αποθηκεύτηκαν');
    return data;
  }

  async function submitAddress(fields) {
    if (fields.postal_code != null) {
      const num = Number(String(fields.postal_code).trim());
      if (!Number.isNaN(num)) fields.postal_code = num;
    }
    const payload = { target_email: email, address_fields: fields };
    const { data } = await http.patch(API.USERS.ME, payload);
    setUser(data?.user ?? data);
    toast.success('Τα στοιχεία επικοινωνίας αποθηκεύτηκαν');
    return data;
  }

  async function submitExtra(fields) {
    const payload = { target_email: email, details_fields: fields };
    const { data } = await http.patch(API.USERS.ME, payload);
    setUser(data?.user ?? data);
    toast.success('Οι επιπλέον πληροφορίες αποθηκεύτηκαν');
    return data;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Προφίλ Χρήστη</h1>
        <Link to="/app/users" className="text-sm text-indigo-700 hover:underline">← Πίσω στη λίστα</Link>
      </div>

      {loading && <div className="p-6 rounded-xl border bg-white">Φόρτωση…</div>}
      {error && <div className="p-6 rounded-xl border bg-white text-red-600">{error}</div>}

      {!loading && !error && user && (
        <>
          <HeaderSummary
            email={user.email}
            userType={user.user_type}
            roles={user.roles}
            canManage={canManage}
            onReload={reloadUser}
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <UserInfoCard
              data={{
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                dob: user.dob,
                phone_no: user.phone_no,
                mobile: user.mobile,
                occupation: user.occupation,
              }}
              editable={editable.users}
              onSubmit={submitUsers}
            />

            <AddressCard
              data={user.address ?? { address: '', address_no: '', postal_code: '', city: '' }}
              editable={editable.address}
              onSubmit={submitAddress}
            />

            <ExtraInfoCard
              data={user.details || {}}
              userType={user.user_type}
              editable={editable.extra}
              onSubmit={submitExtra}
            />
          </div>
        </>
      )}
    </section>
  );
}

function HeaderSummary({ email, userType, roles, canManage, onReload }) {
  const [allRoles, setAllRoles] = useState([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [selected, setSelected] = useState(roles || []);
  const [selType, setSelType] = useState(userType);

  useEffect(() => { setSelected(roles || []); }, [roles]);
  useEffect(() => { setSelType(userType); }, [userType]);

  useEffect(() => {
    if (!canManage) return;
    let mounted = true;
    http.get(API.USERS.ROLES_ALL)
      .then(res => { if (mounted) setAllRoles(res.data?.roles || []); })
      .catch(() => { if (mounted) setAllRoles([]); });
    return () => { mounted = false; };
  }, [canManage]);

  async function saveRoles(email) {
    setSavingRoles(true);
    try {
      await http.patch(API.USERS.ROLES_SET(email), { roles: selected });
      toast.success('Οι ρόλοι ενημερώθηκαν');
      await onReload?.();
    } finally {
      setSavingRoles(false);
    }
  }

  async function saveType(email) {
    if (!selType || selType === userType) return;
    setSavingType(true);
    try {
      await http.patch(API.USERS.ME, { target_email: email, user_fields: { user_type: selType } });
      toast.success('Ο τύπος χρήστη ενημερώθηκε');
      await onReload?.();
    } finally {
      setSavingType(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-slate-700 flex items-center gap-3">
        <span className="text-slate-500">Τύπος:</span>
        {!canManage ? (
          <span>{userTypeLabel(userType)}</span>
        ) : (
          <>
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value={selType || ''}
              onChange={(e) => setSelType(e.target.value)}
            >
              {(USER_TYPE_OPTIONS || []).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
              disabled={savingType || selType === userType}
              onClick={() => saveType(email)}
            >
              Αποθήκευση τύπου
            </button>
          </>
        )}
      </div>
      <div className="text-sm text-slate-700 mt-2">
        <span className="text-slate-500">Ρόλοι:</span>{' '}
        {!canManage ? (
          Array.isArray(roles) && roles.length ? roles.map(roleLabel).join(', ') : '-'
        ) : (
          <div className="mt-2 flex flex-wrap gap-3">
            {allRoles.map(r => (
              <label key={r} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selected.includes(r)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelected(prev => checked ? [...new Set([...prev, r])] : prev.filter(x => x !== r));
                  }}
                />
                <span>{roleLabel(r)}</span>
              </label>
            ))}
            <button
              className="ml-auto rounded-md border px-2 py-1 text-sm disabled:opacity-50"
              disabled={savingRoles}
              onClick={() => saveRoles(email)}
            >
              Αποθήκευση ρόλων
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
