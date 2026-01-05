import { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { useNotes, useAddNote, useEditNote, useDeleteNote } from '../../hooks/useNotes';
import { useAuth } from '../auth/AuthContext';
import { formatDate } from '../../shared/utils/dates';
import Button from '../Button';

export default function NotesLog({ requestType, requestId }) {
  const { user, hasRole, can } = useAuth();
  const isAdmin = hasRole?.('admin');
  const canAddNotes = can?.('edit_req_status') || can?.('manage_anonymous_requests');

  const { data, isLoading, error } = useNotes(requestType, requestId);
  const notes = data?.notes || [];

  const addNoteMutation = useAddNote(requestType, requestId);
  const editNoteMutation = useEditNote(requestType, requestId);
  const deleteNoteMutation = useDeleteNote(requestType, requestId);

  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNoteMutation.mutate(newNote.trim(), {
      onSuccess: () => setNewNote(''),
    });
  };

  const startEditing = (note) => {
    setEditingNoteId(note.note_id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const saveEdit = (noteId) => {
    if (!editingContent.trim()) return;
    editNoteMutation.mutate(
      { noteId, content: editingContent.trim() },
      { onSuccess: () => cancelEditing() }
    );
  };

  const handleDelete = (noteId) => {
    if (!window.confirm('Διαγραφή σημείωσης; Η ενέργεια δεν μπορεί να αναιρεθεί.')) return;
    deleteNoteMutation.mutate(noteId);
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="text-lg font-medium mb-3">Σημειώσεις</h2>

      {isLoading && (
        <div className="text-slate-500 text-sm">Φόρτωση σημειώσεων...</div>
      )}

      {error && (
        <div className="text-red-600 text-sm">
          {error?.response?.data?.message || 'Σφάλμα φόρτωσης σημειώσεων'}
        </div>
      )}

      {!isLoading && !error && notes.length === 0 && (
        <div className="text-slate-500 text-sm mb-4">
          Δεν υπάρχουν σημειώσεις ακόμα.
        </div>
      )}

      {/* Notes List */}
      {!isLoading && !error && notes.length > 0 && (
        <div className="space-y-3 mb-4">
          {notes.map((note) => {
            const isAuthor = user?.email === note.author_email;
            const isEditing = editingNoteId === note.note_id;
            const authorName = note.author_last_name && note.author_first_name
              ? `${note.author_last_name} ${note.author_first_name}`
              : note.author_email;

            return (
              <div
                key={note.note_id}
                className="rounded-lg border bg-slate-50 p-3"
              >
                {/* Note Header */}
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{authorName}</span>
                    <span className="text-slate-400">•</span>
                    <span>{formatDate(note.created_at)}</span>
                    {note.updated_at && (
                      <span className="text-xs text-slate-400 italic">(επεξ/σία)</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && (isAuthor || isAdmin) && canAddNotes && (
                    <div className="flex items-center gap-1">
                      {isAuthor && (
                        <button
                          onClick={() => startEditing(note)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Επεξεργασία"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(note.note_id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Διαγραφή"
                          disabled={deleteNoteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Note Content */}
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-indigo-200 text-sm min-h-[4rem]"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      disabled={editNoteMutation.isPending}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(note.note_id)}
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                        disabled={editNoteMutation.isPending || !editingContent.trim()}
                      >
                        <Check className="h-4 w-4" />
                        Αποθήκευση
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-1 px-2 py-1 text-sm border rounded hover:bg-slate-100"
                        disabled={editNoteMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                        Ακύρωση
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                    {note.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Note Form - only for users who can add notes */}
      {canAddNotes && (
        <div className="border-t pt-4">
          <label className="block text-sm text-slate-500 mb-1">
            Προσθήκη σημείωσης
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-indigo-200 text-sm min-h-[4rem]"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Γράψτε μια σημείωση..."
            disabled={addNoteMutation.isPending}
          />
          <div className="mt-2">
            <Button
              size="sm"
              onClick={handleAddNote}
              loading={addNoteMutation.isPending}
              disabled={!newNote.trim()}
            >
              Αποθήκευση
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
