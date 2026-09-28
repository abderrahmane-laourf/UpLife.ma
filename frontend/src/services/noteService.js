import { apiRequest } from './authService';

/**
 * Get all notes (with optional search)
 */
export async function getAllNotes(search = '') {
  const url = search ? `/api/notes?search=${encodeURIComponent(search)}` : '/api/notes';
  return apiRequest(url, {
    method: 'GET',
  });
}

/**
 * Get note by ID
 */
export async function getNoteById(id) {
  return apiRequest(`/api/notes/${id}`, {
    method: 'GET',
  });
}

/**
 * Create a new note
 */
export async function createNote(noteData) {
  return apiRequest('/api/notes', {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
}

/**
 * Update note
 */
export async function updateNote(id, noteData) {
  return apiRequest(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  });
}

/**
 * Delete note
 */
export async function deleteNote(id) {
  return apiRequest(`/api/notes/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get notes statistics
 */
export async function getNotesStats() {
  return apiRequest('/api/notes/stats', {
    method: 'GET',
  });
}
