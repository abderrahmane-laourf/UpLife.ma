import { useState, useEffect } from 'react';
import * as goalService from '../services/goalService';
import * as categoryService from '../services/categoryService';

export default function GoalSettings() {
  const [goal, setGoal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [deadline, setDeadline] = useState('');

  // Partial Goals State
  const [partialGoals, setPartialGoals] = useState([]);
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [editingPartial, setEditingPartial] = useState(null);
  const [partialTitle, setPartialTitle] = useState('');
  const [partialDescription, setPartialDescription] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch categories
      const catData = await categoryService.getAllCategories();
      setCategories(catData.categories || []);

      // Fetch active goal
      const goalData = await goalService.getActiveGoal();
      if (goalData.goal) {
        setGoal(goalData.goal);
        setTitle(goalData.goal.title);
        setDescription(goalData.goal.description || '');
        setCategoryId(String(goalData.goal.categoryId));
        setDeadline(goalData.goal.deadline ? new Date(goalData.goal.deadline).toISOString().split('T')[0] : '');
        
        // Fetch partial goals
        await fetchPartialGoals(goalData.goal.id);
      } else {
        // No active goal, enter edit mode
        setEditing(true);
        if (catData.categories && catData.categories.length > 0) {
          setCategoryId(String(catData.categories[0].id));
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPartialGoals(goalId) {
    try {
      const data = await goalService.getPartialGoals(goalId);
      setPartialGoals(data.partialGoals || []);
    } catch (error) {
      console.error('Failed to fetch partial goals:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;

    try {
      setSaving(true);
      
      const data = {
        title: title.trim(),
        description: description.trim(),
        categoryId: parseInt(categoryId),
        deadline: deadline || null,
      };

      if (goal && editing) {
        // Update existing goal
        const result = await goalService.updateGoal(goal.id, data);
        setGoal(result.goal);
      } else {
        // Create new goal
        const result = await goalService.createOrUpdateGoal(data);
        setGoal(result.goal);
      }

      setEditing(false);
      alert('Goal saved successfully! 🎯');
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (!goal || !confirm('Mark this goal as completed? 🎉')) return;

    try {
      await goalService.completeGoal(goal.id);
      alert('Congratulations! Goal completed! 🎉');
      await fetchData(); // Refresh
    } catch (error) {
      console.error('Failed to complete goal:', error);
      alert('Failed to complete goal: ' + error.message);
    }
  }

  async function handleDelete() {
    if (!goal || !confirm('Delete this goal?')) return;

    try {
      await goalService.deleteGoal(goal.id);
      setGoal(null);
      setTitle('');
      setDescription('');
      setDeadline('');
      setEditing(true);
      alert('Goal deleted');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal: ' + error.message);
    }
  }

  function handleEdit() {
    setEditing(true);
  }

  function handleCancel() {
    if (goal) {
      // Revert to saved goal
      setTitle(goal.title);
      setDescription(goal.description || '');
      setCategoryId(String(goal.categoryId));
      setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
      setEditing(false);
    } else {
      // Clear form
      setTitle('');
      setDescription('');
      setDeadline('');
      setEditing(false);
    }
  }

  // ========== Partial Goals Functions ==========

  function openPartialModal(partial = null) {
    if (partial) {
      setEditingPartial(partial);
      setPartialTitle(partial.title);
      setPartialDescription(partial.description || '');
    } else {
      setEditingPartial(null);
      setPartialTitle('');
      setPartialDescription('');
    }
    setShowPartialModal(true);
  }

  function closePartialModal() {
    setShowPartialModal(false);
    setEditingPartial(null);
    setPartialTitle('');
    setPartialDescription('');
  }

  async function handlePartialSubmit(e) {
    e.preventDefault();
    if (!partialTitle.trim() || !goal) return;

    try {
      setSaving(true);
      
      const data = {
        title: partialTitle.trim(),
        description: partialDescription.trim(),
      };

      if (editingPartial) {
        // Update existing partial goal
        await goalService.updatePartialGoal(goal.id, editingPartial.id, data);
      } else {
        // Create new partial goal
        await goalService.createPartialGoal(goal.id, data);
      }

      await fetchPartialGoals(goal.id);
      closePartialModal();
      alert(editingPartial ? 'Step updated! 📝' : 'Step added! ✨');
    } catch (error) {
      console.error('Failed to save partial goal:', error);
      alert('Failed to save step: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePartial(partialId) {
    if (!goal) return;

    try {
      const result = await goalService.togglePartialGoalCompletion(goal.id, partialId);
      
      // Refresh partial goals
      await fetchPartialGoals(goal.id);
      
      // If main goal was auto-completed
      if (result.mainGoalCompleted) {
        alert('🎉 Congratulations! All steps completed! Main goal achieved!');
        await fetchData(); // Refresh everything
      }
    } catch (error) {
      console.error('Failed to toggle partial goal:', error);
      alert('Failed to toggle step: ' + error.message);
    }
  }

  async function handleDeletePartial(partialId) {
    if (!goal || !confirm('Delete this step?')) return;

    try {
      await goalService.deletePartialGoal(goal.id, partialId);
      await fetchPartialGoals(goal.id);
      alert('Step deleted');
    } catch (error) {
      console.error('Failed to delete partial goal:', error);
      alert('Failed to delete step: ' + error.message);
    }
  }

  // Calculate progress
  const completedCount = partialGoals.filter(p => p.isCompleted).length;
  const totalCount = partialGoals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#22C55E] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Partial Goal Modal */}
      {showPartialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0a0a0a]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingPartial ? 'Edit Step' : 'Add Step'}
              </h3>
              <button
                onClick={closePartialModal}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePartialSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Step Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={partialTitle}
                  onChange={(e) => setPartialTitle(e.target.value)}
                  placeholder="e.g. Join a gym"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description (Optional)</label>
                <textarea
                  value={partialDescription}
                  onChange={(e) => setPartialDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePartialModal}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A] disabled:opacity-50">
                  {saving ? 'Saving...' : editingPartial ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Main Goal Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">My Global Goal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Set your main wellness objective</p>
              </div>
            </div>
            {goal && !editing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleComplete}
                  className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-600">
                  ✓ Complete
                </button>
                <button
                  onClick={handleEdit}
                  className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-600">
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-600">
                  Delete
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Goal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lose 5 kg before summer"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your goal..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                  {!categoryId && <option value="">-- Select Category --</option>}
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Target Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4 dark:border-white/5">
                {goal && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A] disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          ) : goal ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: `${goal.categoryColor}22`, color: goal.categoryColor }}>
                    {goal.category}
                  </span>
                </div>
                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                )}
              </div>

              {goal.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Target: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No active goal. Click above to set one.</p>
            </div>
          )}
        </div>

        {/* Partial Goals Section */}
        {goal && !editing && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Steps to Achieve</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Break your goal into smaller milestones</p>
                </div>
              </div>
              <button
                onClick={() => openPartialModal()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Step
              </button>
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Progress: {completedCount}/{totalCount} completed
                  </span>
                  <span className="font-bold text-[#22C55E]">{progressPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Steps List */}
            {partialGoals.length > 0 ? (
              <div className="space-y-2">
                {partialGoals.map((partial, index) => (
                  <div
                    key={partial.id}
                    className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleTogglePartial(partial.id)}
                      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 border-gray-300 transition hover:border-[#22C55E] dark:border-gray-600">
                      {partial.isCompleted && (
                        <svg className="h-4 w-4 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${partial.isCompleted ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                        {index + 1}. {partial.title}
                      </p>
                      {partial.description && (
                        <p className={`mt-0.5 text-xs ${partial.isCompleted ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                          {partial.description}
                        </p>
                      )}
                      {partial.isCompleted && partial.completedAt && (
                        <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-600">
                          ✓ Completed {new Date(partial.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => openPartialModal(partial)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-500/10 hover:text-blue-500">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePartial(partial.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-500">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-white/10 dark:bg-white/[0.01]">
                <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">No steps yet</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">Break your goal into smaller, actionable steps</p>
                <button
                  onClick={() => openPartialModal()}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-600 mx-auto">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Step
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
