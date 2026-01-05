import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import * as noteService from '../services/noteService';

// Query key factory
const noteKeys = {
  all: ['notes'],
  list: (requestType, requestId) => ['notes', requestType, requestId],
};

// Get notes for a request
export function useNotes(requestType, requestId) {
  return useQuery({
    queryKey: noteKeys.list(requestType, requestId),
    queryFn: () => noteService.getNotes(requestType, requestId),
    enabled: !!requestType && !!requestId,
    staleTime: 30 * 1000,
  });
}

// Add a note
export function useAddNote(requestType, requestId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content) => noteService.addNote(requestType, requestId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(requestType, requestId) });
      toast.success('Η σημείωση προστέθηκε');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Σφάλμα κατά την προσθήκη σημείωσης');
    },
  });
}

// Edit a note
export function useEditNote(requestType, requestId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, content }) => noteService.editNote(noteId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(requestType, requestId) });
      toast.success('Η σημείωση ενημερώθηκε');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Σφάλμα κατά την επεξεργασία σημείωσης');
    },
  });
}

// Delete a note
export function useDeleteNote(requestType, requestId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId) => noteService.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(requestType, requestId) });
      toast.success('Η σημείωση διαγράφηκε');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Σφάλμα κατά τη διαγραφή σημείωσης');
    },
  });
}
