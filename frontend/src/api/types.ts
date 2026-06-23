export type Category = 'python' | 'cpp' | 'sql' | 'algorithm' | 'general';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ReviewStatus = 'none' | 'need_review' | 'reviewed';
export type LessonAction = 'rephrase' | 'example' | 'compare' | 'review';
export type InteractionType = 'ask' | LessonAction;

export interface CodeExample {
  title: string;
  language: string;
  code: string;
  explanation: string;
}

export interface ConceptComparison {
  target_concept: string;
  similarities: string[];
  differences: string[];
  when_to_use: string;
}

export interface LessonContent {
  one_liner: string;
  core_explanation: string;
  code_examples: CodeExample[];
  prerequisites: string[];
  common_use_cases: string[];
  misconceptions: string[];
  comparisons: ConceptComparison[];
  summary: string[];
  suggested_questions: string[];
}

export interface Lesson {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  user_prompt: string;
  content: LessonContent;
  is_favorite: boolean;
  review_status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface AskResponse {
  short_answer: string;
  detailed_explanation: string;
  code_example?: CodeExample | null;
  related_concepts: string[];
  suggested_followups: string[];
}

export interface ActionResponse {
  action: LessonAction;
  title: string;
  content: string;
  code_example?: CodeExample | null;
  bullets: string[];
}

export interface LessonInteraction {
  id: string;
  lesson_id: string;
  type: InteractionType;
  user_input: string;
  response: AskResponse | ActionResponse;
  created_at: string;
}

export interface Note {
  id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface LearningProfile {
  recent_topics: string[];
  weak_points: string[];
  favorite_topics: string[];
  recommended_topics: string[];
  preferred_explanation_style: string;
}

export interface ApiList<T> {
  items: T[];
}

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
  };
}
