export type Tab = 'overview' | 'trainings' | 'profile';
export type Theme = 'light' | 'dark';

export type IconKey =
  | 'dumbbell'
  | 'bike'
  | 'footprints'
  | 'mountain'
  | 'waves'
  | 'snowflake'
  | 'person'
  | 'swords'
  | 'music'
  | 'volleyball'
  | 'trophy'
  | 'anchor';

export type Exercise = {
  name: string;
  sets: string;
  muscle: string;
  rest: string;
};

export type WorkoutProfile = 'outdoor' | 'strength' | 'cardio' | 'flex' | 'sport' | 'water';

export type Workout = {
  id: string;
  title: string;
  desc: string;
  dur: string;
  level: string;
  kcal: number;
  grad: [string, string];
  iconKey: IconKey;
  profile: WorkoutProfile;
  speedKmh: number;
  kcalPerMin: number;
  waterMlPerHour: number;
  pace?: boolean;
  exercises: Exercise[];
};

export type ActiveSession = {
  workout: Workout;
  startedAt: number;
  pausedMs: number;
  pauseStart: number | null;
  currentExercise: number;
};

export type SessionResult = {
  workout: Workout;
  elapsedMs: number;
  distanceM: number;
};

export type SavedRoute = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  iconKey: IconKey;
  grad: [string, string];
  distanceKm: number;
  durationMs: number;
  finishedAt: number;
};

export type Tokens = {
  theme: Theme;
  bg: string;
  bgGlow1: string;
  bgGlow2: string;
  card: string;
  cardBorder: string;
  iconBg: string;
  nav: string;
  navBorder: string;
  text: string;
  textSoft: string;
  chevron: string;
  divider: string;
  shadow: string;
  shadowHero: string;
  shadowNav: string;
  chipBg: string;
  sparkDot: string;
};
