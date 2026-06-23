import type { Category, Difficulty } from '../api/types';

export type LanguagePreference = 'Chinese' | 'English' | 'Follow prompt';

export interface AppSettings {
  apiBaseUrl: string;
  defaultCategory: Category;
  defaultDifficulty: Difficulty;
  languagePreference: LanguagePreference;
}

const storageKey = 'code-mentor-settings';
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const defaultSettings: AppSettings = {
  apiBaseUrl: configuredBaseUrl?.replace(/\/$/, '') ?? 'http://localhost:8000',
  defaultCategory: 'general',
  defaultDifficulty: 'intermediate',
  languagePreference: 'Chinese'
};

function isCategory(value: unknown): value is Category {
  return ['python', 'cpp', 'sql', 'algorithm', 'general'].includes(String(value));
}

function isDifficulty(value: unknown): value is Difficulty {
  return ['beginner', 'intermediate', 'advanced'].includes(String(value));
}

function isLanguagePreference(value: unknown): value is LanguagePreference {
  return ['Chinese', 'English', 'Follow prompt'].includes(String(value));
}

export function loadAppSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultSettings;

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      apiBaseUrl: parsed.apiBaseUrl?.trim().replace(/\/$/, '') || defaultSettings.apiBaseUrl,
      defaultCategory: isCategory(parsed.defaultCategory) ? parsed.defaultCategory : defaultSettings.defaultCategory,
      defaultDifficulty: isDifficulty(parsed.defaultDifficulty) ? parsed.defaultDifficulty : defaultSettings.defaultDifficulty,
      languagePreference: isLanguagePreference(parsed.languagePreference)
        ? parsed.languagePreference
        : defaultSettings.languagePreference
    };
  } catch {
    return defaultSettings;
  }
}

export function saveAppSettings(settings: AppSettings) {
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({
      ...settings,
      apiBaseUrl: settings.apiBaseUrl.trim().replace(/\/$/, '') || defaultSettings.apiBaseUrl
    })
  );
}

export function getApiBaseUrl() {
  return loadAppSettings().apiBaseUrl;
}
