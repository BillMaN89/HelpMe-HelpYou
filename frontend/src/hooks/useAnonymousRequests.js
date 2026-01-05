import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAnonymousRequests,
  fetchAnonymousRequestById,
  createAnonymousRequest,
  assignAnonymousRequest,
  updateAnonymousRequestStatus,
  updateAnonymousRequestNotes,
  deleteAnonymousRequest,
  fetchEmployees,
} from '../services/anonymousRequestService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getStatusLabel } from '../shared/constants/requestStatus';

function getErrMsg(err) {
  return err?.response?.data?.message || err?.message || 'Κάτι πήγε στραβά';
}

/** QUERIES **/

export function useAnonymousRequests({ enabled = true, page = 1, pageSize = 20, status = 'all' } = {}) {
  return useQuery({
    queryKey: ['anonymousRequests', { page, pageSize, status }],
    queryFn: () => fetchAnonymousRequests({ page, pageSize, status }),
    staleTime: 30 * 1000,
    enabled,
    onError: (err) => toast.error(getErrMsg(err)),
  });
}

export function useAnonymousRequestById(id, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['anonymousRequests', 'byId', id],
    queryFn: () => fetchAnonymousRequestById(id),
    staleTime: 30 * 1000,
    enabled: enabled && !!id,
    onError: (err) => toast.error(getErrMsg(err)),
  });
}

export function useEmployees({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
    onError: (err) => toast.error(getErrMsg(err)),
  });
}

/** MUTATIONS **/

export function useCreateAnonymousRequest() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createAnonymousRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['anonymousRequests'] });
      toast.success('Το ανώνυμο αίτημα δημιουργήθηκε επιτυχώς');
      navigate('/app/anonymous-requests');
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
    },
  });
}

export function useAssignAnonymousRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assigned_employee_email }) =>
      assignAnonymousRequest(id, { assigned_employee_email }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['anonymousRequests'] });
      toast.success('Το αίτημα ανατέθηκε με επιτυχία');
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
    },
  });
}

export function useUpdateAnonymousRequestStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateAnonymousRequestStatus(id, { status }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['anonymousRequests'] });
      const label = getStatusLabel(variables?.status);
      toast.success(`Η κατάσταση ενημερώθηκε: ${label}`);
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
    },
  });
}

export function useUpdateAnonymousRequestNotes() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes_from_employee }) =>
      updateAnonymousRequestNotes(id, { notes_from_employee }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['anonymousRequests'] });
      toast.success('Οι σημειώσεις ενημερώθηκαν');
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
    },
  });
}

export function useDeleteAnonymousRequest() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id }) => deleteAnonymousRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['anonymousRequests'] });
      toast.success('Το αίτημα διαγράφηκε');
      navigate('/app/anonymous-requests');
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
    },
  });
}
