import { GoogleGenAI, Type } from "@google/genai";
import { Workout, CoachResponse } from '../types';

// Safe initialization: Only create client if key exists to prevent crash on load
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGeminiCoaching = async (history: Workout[]): Promise<CoachResponse> => {
  // Safety check if called without key
  if (!ai) {
    console.warn("Gemini API Key is missing. Skipping AI request.");
    // Return a safe fallback or throw. Since UI hides this, throwing is fine to stop execution.
    throw new Error("Gemini API Key is not configured.");
  }

  if (history.length === 0) {
    return {
      message: "Welcome to VeloVibe! Let's crush that first ride. Aim for a solid baseline today.",
      targetCalories: 300,
      vibeCheck: 'chill'
    };
  }

  // Sort by date ascending for the model
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recentHistory = sortedHistory.slice(-5).map(w => ({
    date: w.date,
    calories: w.calories
    // intentionally stripping duration so AI focuses only on calories
  }));

  const prompt = `
    You are an elite, high-energy HIIT spin instructor. Your goal is to encourage "Progressive Overload" (improving performance over time) based purely on CALORIE OUTPUT (assuming constant duration).
    
    Here is the athlete's recent history:
    ${JSON.stringify(recentHistory, null, 2)}
    
    Analyze the trend. Are they improving? Stalling? 
    1. specific comment on their last performance compared to the trend.
    2. Set a REALISTIC but CHALLENGING calorie target for the NEXT workout to ensure progressive overload.
    3. Keep it short (max 2 sentences) and hype-man style.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "Hype message and analysis."
            },
            targetCalories: {
              type: Type.NUMBER,
              description: "The numeric calorie goal for the next session."
            },
            vibeCheck: {
              type: Type.STRING,
              enum: ['fire', 'chill', 'warning'],
              description: "The mood of the progress. Fire = improving, Chill = stable, Warning = declining."
            }
          },
          required: ["message", "targetCalories", "vibeCheck"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as CoachResponse;

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if AI fails
    const lastCal = history[0].calories;
    return {
      message: "Keep pushing! Beat your last score to maintain the gains.",
      targetCalories: Math.ceil(lastCal * 1.02), // +2%
      vibeCheck: 'chill'
    };
  }
};