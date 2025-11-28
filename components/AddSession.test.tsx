import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddSession from './AddSession';
import { Workout, Exercise } from '../types';

// Fix for missing Jest type definitions in the current environment
declare const describe: any;
declare const test: any;
declare const expect: any;
declare const jest: any;

// Mock data
const mockWorkout: Workout = {
  id: 'test-id-123',
  exerciseId: 'ex-1',
  date: '2023-10-01',
  calories: 500,
  durationMinutes: 45, // Duration exists in type but is ignored in UI
  intensity: 11.1
};

const mockExercises: Exercise[] = [
  { id: 'ex-1', name: 'Test Bike (45m)', baseName: 'Test Bike', duration: 45, isDefault: true },
  { id: 'ex-2', name: 'Other (20m)', baseName: 'Other', duration: 20, isDefault: false }
];

describe('AddSession Component', () => {
  test('renders in edit mode with populated values', () => {
    render(
      <AddSession 
        workoutToEdit={mockWorkout} 
        exercises={mockExercises}
        defaultExerciseId="ex-1"
        onSave={() => {}} 
        onCancel={() => {}} 
        onDelete={() => {}} 
      />
    );
    
    // Check if input has correct value
    const calInput = screen.getByDisplayValue('500');
    expect(calInput).toBeInTheDocument();
    
    // Ensure Duration is NOT rendered
    const durationInput = screen.queryByPlaceholderText('30');
    expect(durationInput).not.toBeInTheDocument();
  });

  test('calls onDelete when delete button is clicked', () => {
    const handleDelete = jest.fn();
    
    render(
      <AddSession 
        workoutToEdit={mockWorkout} 
        exercises={mockExercises}
        defaultExerciseId="ex-1"
        onSave={() => {}} 
        onCancel={() => {}} 
        onDelete={handleDelete} 
      />
    );

    // Find delete button (by aria-label or icon title)
    const deleteBtn = screen.getByTitle('Delete Workout');
    expect(deleteBtn).toBeInTheDocument();

    // Click it
    fireEvent.click(deleteBtn);

    // Assert
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith('test-id-123');
  });

  test('closes modal when backdrop is clicked', () => {
    const handleCancel = jest.fn();
    const { container } = render(
      <AddSession 
        workoutToEdit={null} 
        exercises={mockExercises}
        defaultExerciseId="ex-1"
        onSave={() => {}} 
        onCancel={handleCancel} 
      />
    );
    
    // The first div is the backdrop
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});