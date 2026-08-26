import type { Category, Difficulty, ReadingScale, ThemePreference, UiLanguage } from '../api/types';

export type LanguagePreference = 'Chinese' | 'English' | 'Follow prompt';

export interface AppSettings {
  apiBaseUrl: string;
  defaultCategory: Category;
  defaultDifficulty: Difficulty;
  languagePreference: LanguagePreference;
  theme: ThemePreference;
  readingScale: ReadingScale;
  uiLanguage: UiLanguage;
}

const storageKey = 'code-mentor-settings';
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const defaultApiBaseUrl = 'http://localhost:8000';

function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '').replace(/\/api$/i, '') || defaultApiBaseUrl;
}

export const defaultSettings: AppSettings = {
  apiBaseUrl: configuredBaseUrl ? normalizeApiBaseUrl(configuredBaseUrl) : defaultApiBaseUrl,
  defaultCategory: 'general',
  defaultDifficulty: 'intermediate',
  languagePreference: 'Chinese',
  theme: 'system',
  readingScale: 'default',
  uiLanguage: 'English'
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

function isTheme(value: unknown): value is ThemePreference {
  return ['system', 'light', 'dark'].includes(String(value));
}

function isReadingScale(value: unknown): value is ReadingScale {
  return ['compact', 'default', 'comfortable'].includes(String(value));
}

export function loadAppSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultSettings;

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      apiBaseUrl: parsed.apiBaseUrl ? normalizeApiBaseUrl(parsed.apiBaseUrl) : defaultSettings.apiBaseUrl,
      defaultCategory: isCategory(parsed.defaultCategory) ? parsed.defaultCategory : defaultSettings.defaultCategory,
      defaultDifficulty: isDifficulty(parsed.defaultDifficulty) ? parsed.defaultDifficulty : defaultSettings.defaultDifficulty,
      languagePreference: isLanguagePreference(parsed.languagePreference)
        ? parsed.languagePreference
        : defaultSettings.languagePreference,
      theme: isTheme(parsed.theme) ? parsed.theme : defaultSettings.theme,
      readingScale: isReadingScale(parsed.readingScale) ? parsed.readingScale : defaultSettings.readingScale,
      uiLanguage: parsed.uiLanguage === 'Chinese' ? 'Chinese' : defaultSettings.uiLanguage
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
       apiBaseUrl: normalizeApiBaseUrl(settings.apiBaseUrl)
    })
  );
  window.dispatchEvent(new Event('code-mentor-settings-change'));
}

export function applyAppSettings(settings: AppSettings) {
  document.documentElement.dataset.theme = settings.theme;
  document.documentElement.dataset.readingScale = settings.readingScale;
}

export function getApiBaseUrl() {
  return loadAppSettings().apiBaseUrl;
}
