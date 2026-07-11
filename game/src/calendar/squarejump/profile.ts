export type JumpScore = {
  name: string;
  score: number;
  ts: number;
};

const USER_KEY = "escape.squarejump.user";
const LOCAL_KEY = "escape.squarejump.scores";
const MAX_ENTRIES = 10;

const API_BASE =
  (typeof window !== "undefined" && (window as unknown as { __DASHBOARD_URL__?: string }).__DASHBOARD_URL__) ||
  "http://localhost:3333";

const REMOTE_TIMEOUT_MS = 2500;

export function getUsername(): string | null {
  try {
    const v = localStorage.getItem(USER_KEY);
    if (!v) return null;
    const trimmed = v.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export function setUsername(name: string): void {
  try {
    localStorage.setItem(USER_KEY, name);
  } catch {
    /* ignore storage errors */
  }
}

function readLocal(): JumpScore[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (e): e is JumpScore =>
          e &&
          typeof e.name === "string" &&
          typeof e.score === "number" &&
          typeof e.ts === "number",
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function writeLocal(list: JumpScore[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function mergeScores(...lists: JumpScore[][]): JumpScore[] {
  const seen = new Set<string>();
  const out: JumpScore[] = [];
  for (const list of lists) {
    for (const s of list) {
      const key = `${s.name}::${s.score}::${s.ts}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs = REMOTE_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function getScoresRemote(): Promise<JumpScore[] | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/squarejump-scores`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.scores)) return null;
    return data.scores
      .filter(
        (e: unknown): e is JumpScore =>
          !!e &&
          typeof (e as JumpScore).name === "string" &&
          typeof (e as JumpScore).score === "number" &&
          typeof (e as JumpScore).ts === "number",
      )
      .sort((a: JumpScore, b: JumpScore) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
  } catch {
    return null;
  }
}

export async function postScoreRemote(score: JumpScore): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/squarejump-scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(score),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadScores(): Promise<JumpScore[]> {
  const local = readLocal();
  const remote = await getScoresRemote();
  if (!remote) return local;
  return mergeScores(remote, local);
}

export async function recordScore(name: string, score: number): Promise<JumpScore[]> {
  const entry: JumpScore = { name, score, ts: Date.now() };
  const localNext = mergeScores(readLocal(), [entry]);
  writeLocal(localNext);
  const remote = await postScoreRemote(entry);
  if (remote) {
    const remoteList = await getScoresRemote();
    if (remoteList) return mergeScores(remoteList, localNext);
  }
  return localNext;
}

export function bestForUser(scores: JumpScore[], name: string): number {
  let best = 0;
  for (const s of scores) {
    if (s.name === name && s.score > best) best = s.score;
  }
  return best;
}
