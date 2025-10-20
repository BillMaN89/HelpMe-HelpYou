import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import http from '../../shared/lib/http';
import { API } from '../../shared/constants/api';
import { roleLabel, userTypeLabel } from '../../shared/constants/labels';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UsersPage() {
  const auth = useAuth();
  const canList = useMemo(() => (
    auth.can('manage_users') || auth.can('view_user') || auth.can('update_user') || auth.can('view_patient_info')
  ), [auth]);
  const canManageUsers = auth.can('manage_users');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!canList) { setLoading(false); return; }
    setLoading(true);
    http.get(API.USERS.LIST)
      .then(res => setUsers(res.data?.users ?? []))
      .catch(err => setError(err?.response?.data?.message || 'Αποτυχία φόρτωσης χρηστών'))
      .finally(() => setLoading(false));
  }, [canList]);

  async function handleDelete(email) {
    const ok = window.confirm('Η ενέργεια αυτή είναι οριστική. Είστε σίγουροι;');
    if (!ok) return;
    try {
      await http.delete(API.USERS.DELETE(email));
      setUsers(prev => prev.filter(u => u.email !== email));
      toast.success('Ο χρήστης διαγράφηκε');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Αποτυχία διαγραφής χρήστη';
      toast.error(msg);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Χρήστες</h1>

      {!canList && (
        <div className="p-6 rounded-xl border bg-white text-slate-700">
          Δεν έχετε δικαίωμα προβολής χρηστών.
        </div>
      )}

      {canList && (
        <div className="p-0 overflow-hidden rounded-xl border bg-white">
          <div className="px-4 py-3 border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Λίστα χρηστών</span>
              {canManageUsers && (
                <Link to="/app/users/new">
                  <Button size="sm">Νέος χρήστης</Button>
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-slate-600">Φόρτωση…</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-2 text-left">Ονοματεπώνυμο</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Τύπος</th>
                    <th className="px-4 py-2 text-left">Ρόλοι</th>
                    <th className="px-4 py-2 text-left">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-slate-500" colSpan={5}>Δεν βρέθηκαν χρήστες</td>
                    </tr>
                  )}
                  {users.map(u => (
                    <tr key={u.email} className="border-t">
                      <td className="px-4 py-2">{u.last_name} {u.first_name}</td>
                      <td className="px-4 py-2 text-slate-700">{u.email}</td>
                      <td className="px-4 py-2"><span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-slate-700">{userTypeLabel(u.user_type)}</span></td>
                      <td className="px-4 py-2 text-slate-700">{Array.isArray(u.roles) && u.roles.length ? u.roles.map(roleLabel).join(', ') : '-'}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/app/users/${encodeURIComponent(u.email)}`}
                            className="inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline"
                            title="Προβολή προφίλ"
                          >
                            <Eye className="h-6 w-6 text-indigo-600" />
                          </Link>
                          {canManageUsers && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(u.email)}
                              title="Διαγραφή χρήστη"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
