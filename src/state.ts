export type AppMode = 'Hobbie' | 'Estudo';

interface AppState {
  mode: AppMode;
  userEmail: string | null;
  userId: string | null;
}

const state: AppState = {
  mode: 'Hobbie',
  userEmail: null,
  userId: null
};

// Observers
type StateListener = (state: AppState) => void;
const listeners: Set<StateListener> = new Set();

export function getState(): AppState {
  return { ...state };
}

export function setMode(mode: AppMode) {
  state.mode = mode;
  notifyListeners();
}

export function setUser(user: any) {
  if (user) {
    state.userEmail = user.email;
    state.userId = user.uid;
  } else {
    state.userEmail = null;
    state.userId = null;
  }
  notifyListeners();
}

export function subscribe(listener: StateListener) {
  listeners.add(listener);
  listener(state); // trigger immediately
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(listener => listener(state));
}

// Hobbie Mode storage helpers (session storage only)
const HOBBIE_STORAGE_KEY = 'roleta_criativa_hobbie_analytics';

export function saveHobbieAnalytics(data: any) {
  const existing = getHobbieAnalytics();
  existing.push({
    ...data,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  });
  window.sessionStorage.setItem(HOBBIE_STORAGE_KEY, JSON.stringify(existing));
}

export function getHobbieAnalytics() {
  const data = window.sessionStorage.getItem(HOBBIE_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Clear session storage on close is automatic
