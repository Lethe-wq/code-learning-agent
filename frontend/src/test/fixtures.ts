import type { LearningProfile, Lesson, LessonInteraction } from '../api/types';

export const profileFixture: LearningProfile = {
  recent_topics: ['Decorators', 'SQL joins'],
  weak_points: ['Closures', 'Index selection'],
  favorite_topics: ['Python', 'Algorithms'],
  recommended_topics: ['Python generators', 'Binary search invariants'],
  preferred_explanation_style: 'structured examples'
};

export const lessonFixture: Lesson = {
  id: 'lesson_123',
  title: 'Python decorators',
  category: 'python',
  difficulty: 'intermediate',
  user_prompt: 'Explain Python decorators clearly.',
  is_favorite: false,
  review_status: 'none',
  created_at: '2026-06-23T10:00:00.000Z',
  updated_at: '2026-06-23T10:00:00.000Z',
  content: {
    one_liner: 'A decorator wraps a function to extend behavior without changing the original body.',
    core_explanation:
      'Decorators work because Python functions are values. A decorator accepts a function and returns a replacement function.',
    code_examples: [
      {
        title: 'Timing a function',
        language: 'python',
        code: 'def timer(fn):\n    def wrapper(*args, **kwargs):\n        return fn(*args, **kwargs)\n    return wrapper',
        explanation: 'The wrapper keeps the call shape while adding behavior around the original function.'
      }
    ],
    prerequisites: ['Functions as values', 'Closures'],
    common_use_cases: ['Logging', 'Authorization checks'],
    misconceptions: ['Decorators do not run the wrapped function at definition time.'],
    comparisons: [
      {
        target_concept: 'Closures',
        similarities: ['Both can capture surrounding state.'],
        differences: ['Decorators transform callables; closures preserve lexical state.'],
        when_to_use: 'Use decorators when a callable needs reusable behavior added at definition time.'
      }
    ],
    summary: ['Decorators receive a function.', 'They return a callable replacement.'],
    suggested_questions: ['How do decorators with arguments work?']
  }
};

export const actionInteractionFixture: LessonInteraction = {
  id: 'interaction_1',
  lesson_id: 'lesson_123',
  type: 'example',
  user_input: 'example',
  created_at: '2026-06-23T10:05:00.000Z',
  response: {
    action: 'example',
    title: 'A practical decorator example',
    content: 'Use a decorator when the same wrapper behavior applies to many functions.',
    code_example: lessonFixture.content.code_examples[0],
    bullets: ['Keep wrappers small.', 'Preserve function metadata when production code needs it.']
  }
};
