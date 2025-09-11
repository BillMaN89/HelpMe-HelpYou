import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    fetchMyRequests, 
    fetchAllRequests, 
    fetchAssignedToMe, 
    createRequest, 
    assignRequest, 
    updateRequestStatus,
    deleteRequest,
} from '../services/requestService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getStatusLabel } from '../shared/constants/requestStatus';

function getErrMsg(err) {
  return err?.response?.data?.message || err?.message || 'Κάτι πήγε στραβά';
}

/** QUERIES **/

export function useMyRequests(options = {}) {
    return useQuery({
        queryKey: ['requests', 'mine'],
        queryFn: fetchMyRequests,
        staleTime: 30 * 1000, // 30 seconds
        onError: (err) => toast.error(getErrMsg(err)),
        ...options,
    });
}

export function useAllRequests({ enabled = true } = {}) {
    return useQuery({
        queryKey: ['requests', 'all'],
        queryFn: fetchAllRequests,
        staleTime: 30 * 1000,
        enabled, // only run if user has permission
        onError: (err) => toast.error(getErrMsg(err)),
    });
}

export function useAssignedToMe({ enabled = true } = {}) {
    return useQuery({
        queryKey: ['requests', 'assignedToMe'],
        queryFn: fetchAssignedToMe,
        staleTime: 30 * 1000,
        enabled, // only run if user has permission
        onError: (err) => toast.error(getErrMsg(err)),
    });
}

/** MUTATIONS **/

export function useCreateRequest() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createRequest, // ({service_type, description})
    onSuccess: () => {
        //list update
      qc.invalidateQueries({ queryKey: ['requests', 'mine'] });
      qc.invalidateQueries({ queryKey: ['requests', 'all'] });
      toast.success('Το αίτημα δημιουργήθηκε επιτυχώς');
      navigate('/app/myRequests');
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
    },
  });
}

export function useAssignRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assigned_employee_email }) =>
      assignRequest(id, { assigned_employee_email }),
    onSuccess: () => {
      // update all & assigned lists
      qc.invalidateQueries({ queryKey: ['requests', 'all'] });
      qc.invalidateQueries({ queryKey: ['requests', 'assignedToMe'] });
      qc.invalidateQueries({ queryKey: ['requests', 'mine'] });

      toast.success('Το αίτημα ανατέθηκε με επιτυχία');
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
    },
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateRequestStatus(id, { status }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['requests', 'assignedToMe'] });
      qc.invalidateQueries({ queryKey: ['requests', 'all'] });
      qc.invalidateQueries({ queryKey: ['requests', 'mine'] });
      const label = getStatusLabel(variables?.status);
      toast.success(`Η κατάσταση ενημερώθηκε: ${label}`);
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
      console.log(err)
    },
  });
}

export function useDeleteRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => deleteRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests', 'assignedToMe'] });
      qc.invalidateQueries({ queryKey: ['requests', 'all'] });
      qc.invalidateQueries({ queryKey: ['requests', 'mine'] });
      toast.success('Το αίτημα διαγράφηκε');
    },
    onError: (err) => {
      toast.error(getErrMsg(err));
    },
  });
}
