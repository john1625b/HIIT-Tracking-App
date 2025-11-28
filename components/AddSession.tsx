
import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, Flame, Dumbbell } from 'lucide-react';
import { Workout, Exercise } from '../types';

interface AddSessionProps {
  workoutToEdit?: Workout | null;
  exercises: Exercise[];
  defaultExerciseId: string;
  onSave: (data: { date: string; calories: number; duration: number; id?: string; exerciseId: string }) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

const AddSession: React.FC<AddSessionProps> = ({ 
  workoutToEdit, 
  exercises,
  defaultExerciseId,
  onSave, 
  onDelete, 
  onCancel 
}) => {
  // We manage the "Date" part (YYYY-MM-DD) for the input UI
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calories, setCalories] = useState<string>('');
  const [exerciseId, setExerciseId] = useState<string>(defaultExerciseId);

  useEffect(() => {
    if (workoutToEdit) {
      // Extract YYYY-MM-DD from the existing ISO string for the input
      // We do this via Date object to handle timezone offsets correctly for display
      const d = new Date(workoutToEdit.date);
      const localDateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
      setDateStr(localDateStr);
      
      setCalories(workoutToEdit.calories.toString());
      if (workoutToEdit.exerciseId) {
        setExerciseId(workoutToEdit.exerciseId);
      }
    } else {
      setDateStr(new Date().toLocaleDateString('en-CA'));
      setCalories('');
      setExerciseId(defaultExerciseId);
    }
  }, [workoutToEdit, defaultExerciseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calories && dateStr && exerciseId) {
      
      let finalIsoString: string;

      // PARSING LOGIC: Combine the chosen Date (YYYY-MM-DD) with the appropriate Time
      const [year, month, day] = dateStr.split('-').map(Number);
      
      if (workoutToEdit) {
        // EDIT MODE: Preserve the ORIGINAL time of the workout
        const originalDate = new Date(workoutToEdit.date);
        
        // Create new date object with: New Date Selection + Original Time
        const preservedDate = new Date(
          year, 
          month - 1, 
          day, 
          originalDate.getHours(), 
          originalDate.getMinutes(), 
          originalDate.getSeconds(),
          originalDate.getMilliseconds()
        );
        finalIsoString = preservedDate.toISOString();
      } else {
        // NEW MODE: Use CURRENT time
        const now = new Date();
        const newDate = new Date(
          year, 
          month - 1, 
          day, 
          now.getHours(), 
          now.getMinutes(), 
          now.getSeconds(),
          now.getMilliseconds()
        );
        finalIsoString = newDate.toISOString();
      }

      // Find selected exercise to get duration
      const selectedEx = exercises.find(e => e.id === exerciseId);
      const duration = selectedEx ? selectedEx.duration : 1;

      onSave({
        id: workoutToEdit?.id,
        date: finalIsoString,
        calories: Number(calories),
        duration: duration,
        exerciseId: exerciseId
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDelete && workoutToEdit) {
      onDelete(workoutToEdit.id);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    onCancel();
  };

  const isEditing = !!workoutToEdit;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Session' : 'Log Session'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Exercise Selector */}
          <div>
             <label className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <Dumbbell size={16} /> Exercise Type
            </label>
            <div className="relative">
              <select
                value={exerciseId}
                onChange={(e) => setExerciseId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:ring-2 focus:ring-neon-blue focus:outline-none appearance-none transition-all"
              >
                {exercises.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
              {/* Custom arrow if needed, but standard select is fine for MVP */}
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <Calendar size={16} /> Date
            </label>
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:ring-2 focus:ring-neon-blue focus:outline-none transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <Flame size={16} /> Calories
            </label>
            <input
              type="number"
              inputMode="numeric"
              required
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="450"
              autoFocus={!isEditing}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:ring-2 focus:ring-neon-blue focus:outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-4 pt-4">
            {isEditing && onDelete && (
               <button 
               type="button"
               onClick={handleDelete}
               className="bg-red-500/10 text-red-400 hover:bg-red-500/20 p-3 rounded-xl transition-colors border border-red-500/20"
               title="Delete Workout"
             >
               <Trash2 size={20} />
             </button>
            )}
            
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-800 text-white font-medium py-3 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!calories}
              className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(217,70,239,0.3)]"
            >
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSession;
