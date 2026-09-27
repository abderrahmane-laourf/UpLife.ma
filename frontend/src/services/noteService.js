const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get all notes (with optional search)
 */
export async function getAllNotes(search = '') {
  const url = new URL(`${API_URL}/api/notes`);
  if (search) {
    url.searchParams.append('search', search);
  }

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notes');
  }

  return response.json();
}

/**
 * Get note by ID
 */
export async function getNoteById(id) {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch note');
  }

  return response.json();
}

/**
 * Create a new note
 */
export async function createNote(noteData) {
  const response = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create note');
  }

  return response.json();
}

/**
 * Update note
 */
export async function updateNote(id, noteData) {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update note');
  }

  return response.json();
}

/**
 * Delete note
 */
export async function deleteNote(id) {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete note');
  }

  return response.json();
}

/**
 * Get notes statistics
 */
export async function getNotesStats() {
  const response = await fetch(`${API_URL}/api/notes/stats`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch statistics');
  }

  return response.json();
}
