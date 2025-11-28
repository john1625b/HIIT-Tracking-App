
import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Star, Check, Dumbbell, Clock, AlertTriangle } from 'lucide-react';
import { Exercise } from '../types';

interface ExerciseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  currentExerciseId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string, duration: number) => void;
  onEdit: (id: string, newBaseName: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const ExerciseDrawer: React.FC<ExerciseDrawerProps> = ({
  isOpen,
  onClose,
  exercises,
  currentExerciseId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form States
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [editName, setEditName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newDuration) {
      onAdd(newName, Number(newDuration));
      setNewName('');
      setNewDuration('');
      setIsAdding(false);
    }
  };

  const startEditing = (ex: Exercise) => {
    setEditName(ex.baseName);
    setEditingId(ex.id);
  };

  const handleEditSubmit = (id: string) => {
    if (editName.trim()) {
      onEdit(id, editName);
      setEditingId(null);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Sort: Default first, then alphabetical
  const sortedExercises = [...exercises].sort((a, b) => {
    if (a.isDefault === b.isDefault) return 0;
    return a.isDefault ? -1 : 1;
  });

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="text-neon-blue" /> Exercises
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedExercises.map(ex => (
              <div 
                key={ex.id}
                className={`group relative p-3 rounded-xl border transition-all ${
                  ex.id === currentExerciseId 
                    ? 'bg-slate-800/80 border-neon-blue/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800'
                }`}
              >
                {/* Selection Click Area */}
                <div className="cursor-pointer mb-2" onClick={() => onSelect(ex.id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      {editingId === ex.id ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-neon-blue w-32"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleEditSubmit(ex.id)}
                            className="bg-green-500/20 text-green-400 p-1 rounded hover:bg-green-500/30"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <h3 className={`font-bold ${ex.id === currentExerciseId ? 'text-white' : 'text-slate-300'}`}>
                          {ex.name}
                        </h3>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">{ex.duration} min session</p>
                    </div>
                    {ex.isDefault && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                  </div>
                </div>

                {/* Actions Toolbar - Visible on Hover or if active */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEditing(ex)}
                    className="p-1.5 text-slate-400 hover:text-neon-blue hover:bg-neon-blue/10 rounded transition-colors"
                    title="Edit Name"
                  >
                    <Edit2 size={14} />
                  </button>
                  
                  {!ex.isDefault && (
                    <>
                      <button 
                        onClick={() => onSetDefault(ex.id)}
                        className="p-1.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10 rounded transition-colors"
                        title="Set as Default"
                      >
                        <Star size={14} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(ex.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Exercise"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  {ex.isDefault && (
                      <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider ml-auto">Default</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Section */}
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            {isAdding ? (
              <form onSubmit={handleAddSubmit} className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-700 animate-in slide-in-from-bottom-5">
                <div>
                  <label className="text-xs text-slate-500 font-medium ml-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hill Climb"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-neon-blue outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium ml-1">Duration (min)</label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 20"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-neon-blue outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-slate-800 text-slate-300 text-xs font-bold py-2 rounded-lg hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-neon-blue text-slate-950 text-xs font-bold py-2 rounded-lg hover:bg-cyan-400"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-dashed border-slate-600 hover:border-slate-500"
              >
                <Plus size={18} /> Add New Exercise
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xs rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="bg-red-500/10 p-4 rounded-full mb-3 ring-1 ring-red-500/20">
                <AlertTriangle className="text-red-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Exercise?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                This will permanently remove this exercise and <strong className="text-red-400">all its workout history</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-800 text-white font-medium py-3 rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExerciseDrawer;
