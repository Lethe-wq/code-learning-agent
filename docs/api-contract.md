# Code Mentor API Contract

This contract is the source of truth between the frontend and backend for the MVP.

## Base

- Base URL in development: `http://localhost:8000`
- API prefix: `/api`
- Response format: JSON
- Authentication: none for MVP

## Shared Types

```ts
type Category = "python" | "cpp" | "sql" | "algorithm" | "general";
type Difficulty = "beginner" | "intermediate" | "advanced";
type ReviewStatus = "none" | "need_review" | "reviewed";
type LessonAction = "rephrase" | "example" | "compare" | "review";
type InteractionType = "ask" | LessonAction;
```

## Lesson Content

`Lesson.content` is structured data, not Markdown.

```ts
interface CodeExample {
  title: string;
  language: string;
  code: string;
  explanation: string;
}

interface ConceptComparison {
  target_concept: string;
  similarities: string[];
  differences: string[];
  when_to_use: string;
}

interface LessonContent {
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

interface Lesson {
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
```

## Interactions

```ts
interface AskResponse {
  short_answer: string;
  detailed_explanation: string;
  code_example?: CodeExample | null;
  related_concepts: string[];
  suggested_followups: string[];
}

interface ActionResponse {
  action: LessonAction;
  title: string;
  content: string;
  code_example?: CodeExample | null;
  bullets: string[];
}

interface LessonInteraction {
  id: string;
  lesson_id: string;
  type: InteractionType;
  user_input: string;
  response: AskResponse | ActionResponse;
  created_at: string;
}
```

## Notes and Profile

```ts
interface Note {
  id: string;
  lesson_id: string;
  lesson_title?: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface LearningProfile {
  recent_topics: string[];
  weak_points: string[];
  favorite_topics: string[];
  recommended_topics: string[];
  preferred_explanation_style: string;
}
```

## Endpoints

### Create Lesson

`POST /api/lessons`

Request:

```json
{
  "prompt": "讲清楚 Python 装饰器，并对比闭包",
  "category": "python",
  "difficulty": "intermediate"
}
```

Response: `Lesson`

### List Lessons

`GET /api/lessons?limit=20`

Optional query parameters:

- `offset`: number of records to skip
- `q`: search title or original prompt
- `category`: category filter
- `review_status`: review state filter
- `is_favorite`: favorite filter

Response:

```json
{
  "items": []
}
```

### Get Lesson

`GET /api/lessons/{id}`

Response: `Lesson`

### Update Lesson

`PATCH /api/lessons/{id}`

Request:

```json
{
  "is_favorite": true,
  "review_status": "need_review"
}
```

Response: `Lesson`

### Lesson Action

`POST /api/lessons/{id}/actions`

Request:

```json
{
  "action": "example"
}
```

Response: `LessonInteraction`

### Ask Follow-up

`POST /api/lessons/{id}/ask`

Request:

```json
{
  "question": "为什么装饰器和闭包关系这么密切？"
}
```

Response: `LessonInteraction`

### Create Note

`POST /api/notes`

Request:

```json
{
  "lesson_id": "lesson_123",
  "content": "装饰器的核心是函数重新绑定。"
}
```

Response: `Note`

### List Notes

`GET /api/notes?lesson_id=lesson_123&limit=100&q=closure`

`lesson_id` is optional. Without it, the endpoint returns notes across the local workspace.

Response:

```json
{
  "items": []
}
```

### Update Note

`PATCH /api/notes/{id}`

Request:

```json
{
  "content": "Updated note"
}
```

Response: `Note`

### Delete Note

`DELETE /api/notes/{id}`

Response: `204 No Content`

### Profile

`GET /api/profile`

Response: `LearningProfile`

## Error Shape

All expected API errors should use this shape:

```json
{
  "error": {
    "code": "LESSON_NOT_FOUND",
    "message": "Lesson not found"
  }
}
```

Common codes:

- `LESSON_NOT_FOUND`
- `VALIDATION_ERROR`
- `LLM_GENERATION_FAILED`
- `NOTE_NOT_FOUND`

