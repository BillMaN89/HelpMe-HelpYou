import http from '../shared/lib/http';
import { API } from '../shared/constants/api';

// Get all notes for a request
export async function getNotes(requestType, requestId) {
  const { data } = await http.get(API.NOTES.LIST(requestType, requestId));
  return data;
}

// Add a new note
export async function addNote(requestType, requestId, content) {
  const { data } = await http.post(API.NOTES.ADD(requestType, requestId), { content });
  return data;
}

// Edit a note
export async function editNote(noteId, content) {
  const { data } = await http.patch(API.NOTES.EDIT(noteId), { content });
  return data;
}

// Delete a note
export async function deleteNote(noteId) {
  const { data } = await http.delete(API.NOTES.DELETE(noteId));
  return data;
}
