import { useState, useEffect } from 'react'
import { getAllNotes, createNote, updateNote, deleteNote, getNotesStats } from '../services/noteService.js'

/**
 * Custom hook for managing notes
 * Fetches notes from API and provides CRUD operations
 */
export function useNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes()
    fetchStats()
  }, [])

  async function fetchNotes(searchQuery = '') {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllNotes(searchQuery)
      setNotes(data.notes || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch notes:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const data = await getNotesStats()
      setStats(data.stats || null)
    } catch (err) {
      console.error('Failed to fetch notes stats:', err)
    }
  }

  async function addNote(noteData) {
    try {
      setError(null)
      const data = await createNote(noteData)
      setNotes(prev => [data.note, ...prev])
      fetchStats() // Update stats
      return { success: true, note: data.note }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function editNote(id, noteData) {
    try {
      setError(null)
      const data = await updateNote(id, noteData)
      setNotes(prev => prev.map(note => note.id === id ? data.note : note))
      return { success: true, note: data.note }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function removeNote(id) {
    try {
      setError(null)
      await deleteNote(id)
      setNotes(prev => prev.filter(note => note.id !== id))
      fetchStats() // Update stats
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function searchNotes(query) {
    await fetchNotes(query)
  }

  return {
    notes,
    loading,
    error,
    stats,
    fetchNotes,
    searchNotes,
    addNote,
    editNote,
    removeNote,
  }
}
