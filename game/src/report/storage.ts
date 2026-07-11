

const KEYS = {
  briefingSeen: 'escape-briefing-seen',
  startTime: 'escape-start-time',
  completionTime: 'escape-completion-time',
  completed: 'escape-completed',
  quizState: 'escape-quiz-state',
} as const;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore (privacy mode, quota, etc.)
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function hasSeenBriefing(): boolean {
  return safeGet(KEYS.briefingSeen) === '1';
}

export function markBriefingSeen(): void {
  safeSet(KEYS.briefingSeen, '1');
  if (!safeGet(KEYS.startTime)) {
    safeSet(KEYS.startTime, String(Date.now()));
  }
}

export function getStartTime(): number | null {
  const v = safeGet(KEYS.startTime);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function setStartTime(t: number): void {
  safeSet(KEYS.startTime, String(t));
}

export function getCompletionTime(): number | null {
  const v = safeGet(KEYS.completionTime);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function isCompleted(): boolean {
  return safeGet(KEYS.completed) === '1';
}

export function markCompleted(): void {
  safeSet(KEYS.completed, '1');
  safeSet(KEYS.completionTime, String(Date.now()));
  safeRemove(KEYS.quizState);
}

export type QuizAnswers = Record<string, string>;

export function loadQuizState(): QuizAnswers {
  const raw = safeGet(KEYS.quizState);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: QuizAnswers = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string') out[k] = v;
      }
      return out;
    }
  } catch {
    // fall through
  }
  return {};
}

export function saveQuizState(answers: QuizAnswers): void {
  safeSet(KEYS.quizState, JSON.stringify(answers));
}

export function clearQuizState(): void {
  safeRemove(KEYS.quizState);
}

export function checkEvidence(key: string): boolean {
  return safeGet(`escape-evidence-${key}`) === '1';
}

export function formatPlaytime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} Sek`;
  if (min < 60) return `${min} Min ${sec} Sek`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} Std ${m} Min`;
}
