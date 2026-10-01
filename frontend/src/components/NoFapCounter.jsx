import { useState, useEffect } from 'react';
import * as nofapService from '../services/nofapService';

export default function NoFapCounter() {
  const [counter, setCounter] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [counterData, statsData] = await Promise.all([
        nofapService.getCounter(),
        nofapService.getStats(),
      ]);
      setCounter(counterData.counter);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Failed to fetch NoFap data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    try {
      const result = await nofapService.startCounter();
      setCounter(result.counter);
      await fetchData();
      alert('Counter started! You got this! 💪');
    } catch (error) {
      console.error('Failed to start counter:', error);
      alert('Failed to start counter: ' + error.message);
    }
  }

  async function handleRelapse() {
    if (!confirm('Report relapse? This will reset your streak. Be honest with yourself!')) {
      return;
    }

    try {
      const result = await nofapService.reportRelapse();
      setCounter(result.counter);
      await fetchData();
      setShowConfirm(false);
      alert('Relapse reported. Start fresh! You got this! 💪');
    } catch (error) {
      console.error('Failed to report relapse:', error);
      alert('Failed to report relapse: ' + error.message);
    }
  }

  async function handlePause() {
    try {
      const result = await nofapService.pauseCounter();
      setCounter(result.counter);
      await fetchData();
    } catch (error) {
      console.error('Failed to pause counter:', error);
    }
  }

  async function handleResume() {
    try {
      const result = await nofapService.resumeCounter();
      setCounter(result.counter);
      await fetchData();
      alert('Counter resumed! Keep going! 💪');
    } catch (error) {
      console.error('Failed to resume counter:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#22C55E] border-t-transparent"></div>
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          NoFap Challenge
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Track your clean days and build a better version of yourself
        </p>
        <button
          onClick={handleStart}
          className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5">
          Start Counter 💪
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Confirm Relapse Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0a0a0a]">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-500/10">
                <svg className="h-6 w-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Report Relapse?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This will reset your current streak to 0. Be honest with yourself!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
                Cancel
              </button>
              <button
                onClick={handleRelapse}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-red-600">
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Main Counter Card */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-white/10 dark:from-purple-500/5 dark:to-pink-500/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">NoFap Challenge</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {counter.isActive ? 'Active' : 'Paused'}
                </p>
              </div>
            </div>
            {counter.isActive ? (
              <button
                onClick={handlePause}
                className="rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-gray-600">
                Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="rounded-lg bg-[#22C55E] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#16A34A]">
                Resume
              </button>
            )}
          </div>

          {/* Current Streak */}
          <div className="mb-6 text-center">
            <div className="mb-2 text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {counter.currentStreak}
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Days Clean 🔥
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Since {new Date(counter.startDate).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              Report Relapse
            </button>
            <button
              onClick={handleStart}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5">
              Restart Counter
            </button>
          </div>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h4 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Statistics</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.longestStreak}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Longest Streak</p>
              </div>
              
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {stats.totalDays}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Days</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.successRate}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
              </div>
              
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.totalRelapses}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Relapses</p>
              </div>
            </div>

            {stats.lastRelapseDate && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-500/20 dark:bg-yellow-500/5">
                <p className="text-xs text-yellow-800 dark:text-yellow-400">
                  Last relapse: {new Date(stats.lastRelapseDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Motivation Card */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-500/20 dark:bg-blue-500/5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                Keep Going! 💪
              </h5>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Every day clean is a victory. Stay strong, focus on your goals, and remember why you started!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
