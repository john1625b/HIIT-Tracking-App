import React, { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, Flame, ChevronUp, ChevronDown, BarChart2, Edit2, Zap, Menu } from 'lucide-react';
import { Workout, CoachResponse, Exercise } from './types';
import StatCard from './components/StatCard';
import TrendChart from './components/TrendChart';
import AddSession from './components/AddSession';
import ExerciseDrawer from './components/ExerciseDrawer';
import { getGeminiCoaching } from './services/geminiService';

const STORAGE_KEY = 'velovibe_workouts';
const EXERCISE_STORAGE_KEY = 'velovibe_exercises';

const App: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState<string>('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [coachResponse, setCoachResponse] = useState<CoachResponse | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);

  // Check for API Key availability
  const hasApiKey = !!process.env.API_KEY;

  // Initialize Data & Migrations
  useEffect(() => {
    // Load Exercises
    const savedExercises = localStorage.getItem(EXERCISE_STORAGE_KEY);
    let loadedExercises: Exercise[] = [];
    
    if (savedExercises) {
      try {
        loadedExercises = JSON.parse(savedExercises);
      } catch (e) { console.error("Error parsing exercises", e); }
    }

    // Default migration if no exercises exist
    if (loadedExercises.length === 0) {
      const defaultEx: Exercise = {
        id: 'default-ex-1',
        name: 'HIIT Bike (20 min)',
        baseName: 'HIIT Bike',
        duration: 20,
        isDefault: true
      };
      loadedExercises = [defaultEx];
      localStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify(loadedExercises));
    }
    setExercises(loadedExercises);

    // Set initial selection to default
    const defaultEx = loadedExercises.find(e => e.isDefault) || loadedExercises[0];
    setCurrentExerciseId(defaultEx.id);

    // Load Workouts
    const savedWorkouts = localStorage.getItem(STORAGE_KEY);
    if (savedWorkouts) {
      try {
        const parsedWorkouts: Workout[] = JSON.parse(savedWorkouts);
        
        // Migration: Assign orphan workouts to the default exercise
        const migratedWorkouts = parsedWorkouts.map(w => ({
          ...w,
          exerciseId: w.exerciseId || defaultEx.id
        }));
        
        setWorkouts(migratedWorkouts);
        // Save immediately if changes occurred
        if (JSON.stringify(migratedWorkouts) !== savedWorkouts) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedWorkouts));
        }

      } catch (e) {
        console.error("Failed to parse workouts", e);
      }
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify(exercises));
    }
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  // Derived filtered workouts for the current view
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => w.exerciseId === currentExerciseId);
  }, [workouts, currentExerciseId]);

  const currentExercise = exercises.find(e => e.id === currentExerciseId);

  // AI Coaching Trigger
  useEffect(() => {
    const fetchCoach = async () => {
      // SKIP if no API key is present
      if (!hasApiKey) return;

      // Only fetch if we have some history for this specific exercise
      if (filteredWorkouts.length > 0) {
        setLoadingCoach(true);
        try {
          const response = await getGeminiCoaching(filteredWorkouts);
          setCoachResponse(response);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingCoach(false);
        }
      } else {
        setCoachResponse(null);
      }
    };
    
    fetchCoach();
  }, [filteredWorkouts.length, currentExerciseId, hasApiKey]); // Re-run when exercise changes or data updates

  // --- Handlers ---

  const handleSaveWorkout = (data: { date: string, calories: number, duration: number, id?: string, exerciseId: string }) => {
    if (data.id) {
      // Update existing
      setWorkouts(prev => prev.map(w => {
        if (w.id === data.id) {
          return {
            ...w,
            date: data.date,
            calories: data.calories,
            durationMinutes: data.duration, // Kept for data integrity
            exerciseId: data.exerciseId
          };
        }
        return w;
      }));
    } else {
      // Add new
      const newWorkout: Workout = {
        id: crypto.randomUUID(),
        date: data.date,
        calories: data.calories,
        durationMinutes: data.duration,
        exerciseId: data.exerciseId,
        intensity: data.calories
      };
      setWorkouts(prev => [newWorkout, ...prev]);
    }
    closeModal();
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
    closeModal();
  };

  // --- Exercise Management Handlers ---

  const handleAddExercise = (name: string, duration: number) => {
    const newEx: Exercise = {
      id: crypto.randomUUID(),
      baseName: name,
      duration: duration,
      name: `${name} (${duration}m)`,
      isDefault: false
    };
    setExercises(prev => [...prev, newEx]);
    // Auto switch to new exercise? Optional. Let's do it for better UX.
    setCurrentExerciseId(newEx.id);
  };

  const handleEditExercise = (id: string, newBaseName: string) => {
    setExercises(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          baseName: newBaseName,
          name: `${newBaseName} (${e.duration}m)`
        };
      }
      return e;
    }));
  };

  const handleDeleteExercise = (id: string) => {
    if (exercises.length <= 1) {
      alert("You must have at least one exercise.");
      return;
    }
    
    // Check if deleting current
    if (currentExerciseId === id) {
      const fallback = exercises.find(e => e.id !== id);
      if (fallback) setCurrentExerciseId(fallback.id);
    }

    // Remove exercise
    setExercises(prev => prev.filter(e => e.id !== id));
    
    // Remove associated workouts
    setWorkouts(prev => prev.filter(w => w.exerciseId !== id));
  };

  const handleSetDefaultExercise = (id: string) => {
    setExercises(prev => prev.map(e => ({
      ...e,
      isDefault: e.id === id
    })));
  };


  // --- Modal Logic ---

  const openAddModal = () => {
    setEditingWorkout(null);
    setShowAddModal(true);
  };

  const openEditModal = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingWorkout(null);
  };

  // Derived Stats
  const stats = useMemo(() => {
    if (filteredWorkouts.length === 0) return null;

    // Workouts are stored desc (newest first) but verify sorting
    const sorted = [...filteredWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const current = sorted[0];
    const previous = sorted.length > 1 ? sorted[1] : null;
    const best = Math.max(...filteredWorkouts.map(w => w.calories));
    
    const delta = previous ? current.calories - previous.calories : 0;
    const deltaPercent = previous ? ((delta / previous.calories) * 100).toFixed(1) : '0';

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = filteredWorkouts.filter(w => new Date(w.date) > oneWeekAgo).length;

    return {
      current,
      delta,
      deltaPercent,
      best,
      weeklyCount
    };
  }, [filteredWorkouts]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-neon-purple selection:text-white">
      
      {/* Exercise Drawer */}
      <ExerciseDrawer 
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        exercises={exercises}
        currentExerciseId={currentExerciseId}
        onSelect={(id) => {
          setCurrentExerciseId(id);
          setShowDrawer(false);
        }}
        onAdd={handleAddExercise}
        onEdit={handleEditExercise}
        onDelete={handleDeleteExercise}
        onSetDefault={handleSetDefaultExercise}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDrawer(true)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Menu size={24} />
          </button>
          
          <div onClick={() => setShowDrawer(true)} className="cursor-pointer group">
            <h1 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5 group-hover:text-neon-blue transition-colors">
              Current Focus
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white leading-none">
                {currentExercise?.name || 'Loading...'}
              </span>
              <ChevronDown size={14} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        <button 
          onClick={openAddModal}
          className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full transition-all border border-slate-700 hover:border-neon-blue group"
        >
          <Plus size={24} className="group-hover:text-neon-blue transition-colors" />
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-6 pb-20 space-y-8">
        
        {/* Empty State */}
        {filteredWorkouts.length === 0 && (
          <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-slate-800 mb-6">
              <TrendingUp size={32} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Start Your Progression</h2>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">
              No history yet for <span className="text-neon-blue">{currentExercise?.name}</span>.
            </p>
            <button 
              onClick={openAddModal}
              className="bg-neon-blue text-slate-950 font-bold px-8 py-3 rounded-xl hover:bg-cyan-300 transition-colors"
            >
              Log First Session
            </button>
          </div>
        )}

        {/* Dashboard */}
        {filteredWorkouts.length > 0 && stats && (
          <>
            {/* AI Insight Banner - Only rendered if API Key exists */}
            {hasApiKey && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 border border-purple-500/30 p-1">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-500/20 p-2 rounded-lg shrink-0">
                      <Flame className="text-neon-purple" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-neon-purple font-bold text-sm uppercase tracking-wide mb-1">Coach Insight</h3>
                      {loadingCoach ? (
                        <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                      ) : (
                        <>
                          <p className="text-lg font-medium leading-tight text-white mb-2">
                            "{coachResponse?.message}"
                          </p>
                          {coachResponse?.targetCalories && (
                             <div className="inline-flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                               <span>Next Target:</span>
                               <span className="text-neon-green font-bold">{coachResponse.targetCalories} kcal</span>
                             </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metric: The Delta */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-slate-400 text-sm font-medium uppercase">Last Session</p>
                  <p className="text-6xl font-black text-white tracking-tight mt-1">{stats.current.calories}</p>
                  <p className="text-sm text-slate-500 mt-1">kcal burned</p>
                </div>
                
                <div className="flex flex-col items-end relative z-10">
                   <div className={`flex items-center gap-1 text-2xl font-bold ${stats.delta >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {stats.delta >= 0 ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                      {Math.abs(stats.delta)}
                   </div>
                   <span className={`text-sm font-medium px-3 py-1 mt-1 rounded-full ${stats.delta >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                     {stats.delta >= 0 ? '+' : ''}{stats.deltaPercent}%
                   </span>
                </div>

                {/* Background decorative glow */}
                <div className={`absolute -right-6 -bottom-6 w-48 h-48 rounded-full blur-3xl opacity-10 ${stats.delta >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                label="All Time Best" 
                value={stats.best} 
                icon={<TrendingUp size={18} />}
                highlight={stats.current.calories >= stats.best}
              />
               <StatCard 
                label="Weekly Sessions" 
                value={stats.weeklyCount}
                icon={<BarChart2 size={18} />}
              />
            </div>

            {/* Trend Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-white">Progression Trend</h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Last 20 sessions</span>
              </div>
              <TrendChart data={filteredWorkouts} />
            </div>

            {/* History List */}
            <div className="pt-4">
              <h3 className="font-bold text-lg text-white mb-4">History</h3>
              <div className="space-y-3">
                {filteredWorkouts.map((workout) => (
                  <div 
                    key={workout.id} 
                    onClick={() => openEditModal(workout)}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-800 p-2 rounded-full text-slate-500 group-hover:text-neon-blue transition-colors">
                        <Edit2 size={16} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{new Date(workout.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-bold text-neon-blue">{workout.calories}</span>
                      <span className="text-xs text-slate-500">kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddSession 
          workoutToEdit={editingWorkout}
          exercises={exercises}
          defaultExerciseId={currentExerciseId}
          onSave={handleSaveWorkout}
          onDelete={handleDeleteWorkout}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};

export default App;