import type {
  ApiErrorShape,
  ApiList,
  Category,
  Difficulty,
  LearningProfile,
  Lesson,
  LessonAction,
  LessonInteraction,
  Note,
  ReviewStatus
} from './types';
import { getApiBaseUrl } from '../state/settings';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  });

  if (response.status === 204) return undefined as T;
  const payload = (await response.json()) as T | ApiErrorShape;
  if (!response.ok) {
    const apiError = payload as ApiErrorShape;
    throw new ApiError(apiError.error?.message ?? 'Request failed', apiError.error?.code ?? 'REQUEST_FAILED', response.status);
  }

  return payload as T;
}

export const apiClient = {
  createLesson(input: { prompt: string; category: Category; difficulty: Difficulty }) {
    return request<Lesson>('/lessons', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  listRecentLessons(limit = 20) {
    return request<ApiList<Lesson>>(`/lessons?limit=${limit}`);
  },

  listLessons(options: {
    limit?: number;
    offset?: number;
    query?: string;
    category?: Category;
    reviewStatus?: ReviewStatus;
    favorite?: boolean;
  } = {}) {
    const params = new URLSearchParams();
    params.set('limit', String(options.limit ?? 20));
    if (options.offset) params.set('offset', String(options.offset));
    if (options.query?.trim()) params.set('q', options.query.trim());
    if (options.category) params.set('category', options.category);
    if (options.reviewStatus) params.set('review_status', options.reviewStatus);
    if (options.favorite !== undefined) params.set('is_favorite', String(options.favorite));
    return request<ApiList<Lesson>>(`/lessons?${params.toString()}`);
  },

  getLesson(id: string) {
    return request<Lesson>(`/lessons/${encodeURIComponent(id)}`);
  },

  updateLesson(id: string, input: { is_favorite?: boolean; review_status?: ReviewStatus }) {
    return request<Lesson>(`/lessons/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
  },

  runLessonAction(id: string, action: LessonAction) {
    return request<LessonInteraction>(`/lessons/${encodeURIComponent(id)}/actions`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },

  askFollowup(id: string, question: string) {
    return request<LessonInteraction>(`/lessons/${encodeURIComponent(id)}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  },

  createNote(input: { lesson_id: string; content: string }) {
    return request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  listNotes(lessonId?: string, limit = 100, query?: string) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (lessonId) params.set('lesson_id', lessonId);
    if (query?.trim()) params.set('q', query.trim());
    return request<ApiList<Note>>(`/notes?${params.toString()}`);
  },

  updateNote(id: string, content: string) {
    return request<Note>(`/notes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  },

  deleteNote(id: string) {
    return request<void>(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  getProfile() {
    return request<LearningProfile>('/profile');
  }
};

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
