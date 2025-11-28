
export interface Exercise {
  id: string;
  name: string; // The display name (e.g., "HIIT (20 min)")
  baseName: string; // The editable part (e.g. "HIIT")
  duration: number; // The fixed duration
  isDefault: boolean;
}

export interface Workout {
  id: string;
  exerciseId: string; // Link to specific exercise type
  date: string; // ISO string
  calories: number;
  durationMinutes: number; // Kept for legacy/data integrity, though UI might hide it
  intensity: number; // calculated as calories / duration
  notes?: string;
}

export interface CoachResponse {
  message: string;
  targetCalories: number;
  vibeCheck: 'fire' | 'chill' | 'warning';
}

export interface Stats {
  totalWorkouts: number;
  bestCalories: number;
  currentStreak: number;
  averageIntensity: number;
}
