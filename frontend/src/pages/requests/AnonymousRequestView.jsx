import { Link, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useAnonymousRequestById,
  useAssignAnonymousRequest,
  useUpdateAnonymousRequestStatus,
  useUpdateAnonymousRequestNotes,
  useDeleteAnonymousRequest,
} from '../../hooks/useAnonymousRequests';
import { useAuth } from '../../components/auth/AuthContext';
import { getServiceTypeLabel } from '../../shared/constants/serviceTypes';
import { getStatusLabel, REQUEST_STATUS } from '../../shared/constants/requestStatus';
import { formatDate } from '../../shared/utils/dates';
import Button from '../../components/Button';
import StatusPill from '../../shared/components/StatusPill';
import http from '../../shared/lib/http';
import { API } from '../../shared/constants/api';

// Fetch users with roles for grouped dropdown
function useUsersWithRoles() {
  return useQuery({
    queryKey: ['users', 'withRoles', 'forAssignment'],
    queryFn: async () => {
      const { data } = await http.get(API.USERS.LIST, { params: { pageSize: 200 } });
      return data.users || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Group definitions for the dropdown
const USER_GROUPS = [
  { key: 'therapist', label: 'Ψυχολόγοι', filterFn: (u) => u.roles?.includes('therapist') },
  { key: 'social_worker', label: 'Κοινωνικοί Λειτουργοί', filterFn: (u) => u.roles?.includes('social_worker') },
  { key: 'secretary', label: 'Γραμματεία', filterFn: (u) => u.roles?.includes('secretary') },
  { key: 'admin', label: 'Διοίκηση', filterFn: (u) => u.roles?.includes('admin') },
  { key: 'volunteer', label: 'Εθελοντές', filterFn: (u) => u.user_type === 'volunteer' },
  { key: 'board', label: 'Διοικητικό Συμβούλιο', filterFn: (u) => u.details?.department === 'board_of_directors' },
];

const STATUS_OPTIONS = [
  { value: REQUEST_STATUS.ASSIGNED, label: 'Ανατεθειμένο' },
  { value: REQUEST_STATUS.IN_PROGRESS, label: 'Σε εξέλιξη' },
  { value: REQUEST_STATUS.COMPLETED, label: 'Ολοκληρωμένο' },
  { value: REQUEST_STATUS.CANCELED, label: 'Ακυρωμένο' },
];

export default function AnonymousRequestView() {
  const { id } = useParams();
  const { hasRole, can } = useAuth();
  const isAdmin = hasRole?.('admin');
  const canManage = can?.('manage_anonymous_requests');

  const { data: req, isLoading, error } = useAnonymousRequestById(id);
  const { data: users = [], isLoading: usersLoading } = useUsersWithRoles();

  const assignReq = useAssignAnonymousRequest();

  // Group users by role/type
  const groupedUsers = useMemo(() => {
    const groups = [];
    const assignedEmails = new Set(); // Track already assigned users to avoid duplicates

    for (const group of USER_GROUPS) {
      const usersInGroup = users.filter(u => {
        if (assignedEmails.has(u.email)) return false;
        return group.filterFn(u);
      });

      if (usersInGroup.length > 0) {
        // Mark these users as assigned to this group
        usersInGroup.forEach(u => assignedEmails.add(u.email));
        groups.push({
          ...group,
          users: usersInGroup,
        });
      }
    }

    return groups;
  }, [users]);
  const updateStatus = useUpdateAnonymousRequestStatus();
  const updateNotes = useUpdateAnonymousRequestNotes();
  const deleteReq = useDeleteAnonymousRequest();

  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [notesInitialized, setNotesInitialized] = useState(false);

  // Initialize notes when request loads
  if (req && !notesInitialized) {
    setNotes(req.notes_from_employee || '');
    setNotesInitialized(true);
  }

  const handleAssign = () => {
    const target = selectedAssignee || req?.assigned_employee_email;
    if (!target) return;
    if (!window.confirm(`Ανάθεση αιτήματος στον/στην ${target};`)) return;
    assignReq.mutate({ id: req.request_id, assigned_employee_email: target });
  };

  const handleStatusChange = () => {
    const newStatus = selectedStatus || req?.status;
    if (!newStatus || newStatus === req?.status) return;
    updateStatus.mutate({ id: req.request_id, status: newStatus });
  };

  const handleNotesUpdate = () => {
    updateNotes.mutate({ id: req.request_id, notes_from_employee: notes });
  };

  const handleDelete = () => {
    if (!window.confirm(`Διαγραφή αιτήματος #${req.request_id}; Η ενέργεια δεν μπορεί να αναιρεθεί.`)) return;
    deleteReq.mutate({ id: req.request_id });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ανώνυμο Αίτημα #{id}</h1>
        <Link to="/app/anonymous-requests" className="text-sm text-indigo-700 hover:underline">
          ← Πίσω στη λίστα
        </Link>
      </div>

      {isLoading && (
        <div className="p-6 rounded-xl border bg-white">Φόρτωση...</div>
      )}
      {error && (
        <div className="p-6 rounded-xl border bg-white text-red-600">
          {error?.message || 'Σφάλμα φόρτωσης'}
        </div>
      )}

      {!isLoading && !error && req && (
        <>
          {/* Request Info */}
          <div className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-medium mb-3">Στοιχεία Αιτήματος</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ID" value={req.request_id} />
              <Field label="Ημ/νία δημιουργίας" value={formatDate(req.created_at)} />
              <Field label="Τελευταία ενημέρωση" value={formatDate(req.updated_at)} />
              <Field label="Υπηρεσία" value={getServiceTypeLabel(req.service_type)} />
              <div>
                <div className="text-sm text-slate-500">Κατάσταση</div>
                <StatusPill status={req.status} />
              </div>
              <Field
                label="Δημιουργήθηκε από"
                value={
                  req.created_by_first_name || req.created_by_last_name
                    ? `${req.created_by_last_name || ''} ${req.created_by_first_name || ''}`.trim()
                    : req.created_by_email
                }
              />
            </div>

            <div className="mt-4">
              <Area label="Περιγραφή / Σκοπός κλήσης" value={req.description} />
            </div>
          </div>

          {/* Requester Info */}
          <div className="rounded-xl border bg-white p-4">
            <h2 className="text-lg font-medium mb-3">Στοιχεία Καλούντος</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ονοματεπώνυμο" value={req.full_name} />
              <Field label="Κινητό" value={req.mobile} />
              <Field label="Email" value={req.email || '-'} />
            </div>
          </div>

          {/* Actions - only visible to users who can manage anonymous requests */}
          {canManage && (
            <div className="rounded-xl border bg-white p-4 space-y-4">
              <h2 className="text-lg font-medium">Ενέργειες</h2>

              {/* Assignment */}
              <div>
                <label className="block text-sm text-slate-500 mb-1">Ανάθεση σε</label>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-md border px-2 py-1 text-sm min-w-[20rem]"
                    value={selectedAssignee || req.assigned_employee_email || ''}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    disabled={assignReq.isPending || usersLoading}
                  >
                    <option value="">— Επιλέξτε υπάλληλο —</option>
                    {groupedUsers.map(group => (
                      <optgroup key={group.key} label={group.label}>
                        {group.users.map(emp => (
                          <option key={emp.email} value={emp.email}>
                            {emp.last_name} {emp.first_name} — {emp.email}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleAssign}
                    loading={assignReq.isPending}
                    disabled={!selectedAssignee && !req.assigned_employee_email}
                  >
                    Ανάθεση
                  </Button>
                </div>
                {req.assigned_employee_email && (
                  <div className="text-sm text-slate-600 mt-1">
                    Τρέχων: {req.assigned_employee_last_name} {req.assigned_employee_first_name} ({req.assigned_employee_email})
                  </div>
                )}
              </div>

              {/* Status Change */}
              <div>
                <label className="block text-sm text-slate-500 mb-1">Αλλαγή κατάστασης</label>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-md border px-2 py-1 text-sm min-w-[14rem]"
                    value={selectedStatus || req.status || ''}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={updateStatus.isPending}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleStatusChange}
                    loading={updateStatus.isPending}
                    disabled={!selectedStatus || selectedStatus === req.status}
                  >
                    Ενημέρωση
                  </Button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-slate-500 mb-1">Σημειώσεις υπαλλήλου</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-opacity-50 min-h-[6rem]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={updateNotes.isPending}
                  placeholder="Προσθέστε σημειώσεις για το αίτημα..."
                />
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={handleNotesUpdate}
                    loading={updateNotes.isPending}
                    disabled={notes === (req.notes_from_employee || '')}
                  >
                    Αποθήκευση σημειώσεων
                  </Button>
                </div>
              </div>

              {/* Delete */}
              {isAdmin && (
                <div className="pt-4 border-t">
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={deleteReq.isPending}
                  >
                    Διαγραφή αιτήματος
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
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
