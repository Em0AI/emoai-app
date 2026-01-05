
import type { H3Event } from 'h3';

// Interfaces
export interface EmotionLogEntry {
  timestamp: string;
  user_input: string;
  emotion: string;
  valence: number;
  trend: string | null;
  agent_used: string;
  ai_reply: string;
}

export interface UserPrefs {
  tone: string;
  reply_length: string;
  positivity: string;
  empathy_level: string;
}

export interface AgentScore {
  [key: string]: number;
}

// Global Runtime State (In-Memory)
// Note: This resets on server restart. For persistence, use a database.
// Keeping it simple to match original Python implementation.

export const FIXED_SESSION_ID = "default_session"; // Matching Python's FIXED_SESSION_ID

class StateManager {
  // Session Data
  sessionConversations: Record<string, any[]> = {};
  sessionEmotionHistory: Record<string, [string, string, number][]> = {}; // [text, emo, val]
  emotionMemory: { text: string; emo: string; val: number }[] = [];
  
  // User Preferences
  userPrefs: UserPrefs = {
    tone: "neutral and gentle",
    reply_length: "medium",
    positivity: "balanced",
    empathy_level: "high"
  };

  // Agent State
  agentScores: AgentScore = {
    "empathetic": 20.0,
    "counselor": 20.0,
    "funny": 20.0
  };
  
  agentFeedbackMemory: Record<string, string[]> = {
    "empathetic": [],
    "counselor": [],
    "funny": []
  };

  constructor() {
    this.sessionConversations[FIXED_SESSION_ID] = [];
    this.sessionEmotionHistory[FIXED_SESSION_ID] = [];
  }

  // Getters and Setters
  getConversation(sessionId: string = FIXED_SESSION_ID) {
    if (!this.sessionConversations[sessionId]) {
      this.sessionConversations[sessionId] = [];
    }
    return this.sessionConversations[sessionId];
  }

  getEmotionHistory(sessionId: string = FIXED_SESSION_ID) {
    if (!this.sessionEmotionHistory[sessionId]) {
      this.sessionEmotionHistory[sessionId] = [];
    }
    return this.sessionEmotionHistory[sessionId];
  }

  // Global Tone & Temp Logic
  getGlobalToneAndTemp() {
    if (this.emotionMemory.length === 0) return ["balanced", 0.7];
    
    // Calculate average valence of last 5 turns
    const recent = this.emotionMemory.slice(-5);
    const avgVal = recent.reduce((sum, item) => sum + item.val, 0) / recent.length;
    
    let temp = 0.7;
    let hint = "balanced";

    if (avgVal > 0.5) {
      temp = 0.9;
      hint = "cheerful and expressive";
    } else if (avgVal < -0.5) {
      temp = 0.5;
      hint = "calm and supportive";
    }

    return [hint, temp] as const;
  }

  getAverageEmotion() {
    if (this.emotionMemory.length === 0) return 0.0;
    const total = this.emotionMemory.reduce((sum, item) => sum + item.val, 0);
    return total / this.emotionMemory.length;
  }
}

// Singleton Instance
export const globalState = new StateManager();
