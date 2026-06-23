import { FormEvent, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { apiClient, errorMessage } from './api/client';
import type {
  ActionResponse,
  AskResponse,
  Category,
  CodeExample,
  LearningProfile,
  Lesson,
  LessonAction,
  LessonInteraction
} from './api/types';
import { LatexText } from './components/LatexText';
import { loadAppSettings, saveAppSettings, type AppSettings } from './state/settings';

const languageChips: Array<{ label: string; category: Category }> = [
  { label: 'Python', category: 'python' },
  { label: 'C++', category: 'cpp' },
  { label: 'SQL', category: 'sql' },
  { label: 'Algorithms', category: 'algorithm' }
];

const actionButtons: Array<{ label: string; kind: 'action' | 'save' | 'ask'; action?: LessonAction }> = [
  { label: 'Rephrase', kind: 'action', action: 'rephrase' },
  { label: 'Give example', kind: 'action', action: 'example' },
  { label: 'Compare', kind: 'action', action: 'compare' },
  { label: 'Save', kind: 'save' },
  { label: 'Review', kind: 'action', action: 'review' },
  { label: 'Ask AI', kind: 'ask' }
];

const visibleLoadingDelayMs = 140;

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">CM</span>
          <span>Code Mentor</span>
        </Link>
        <nav aria-label="Primary navigation">
          <NavLink to="/history">History</NavLink>
          <NavLink to="/notes">Notes</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      {children}
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const settings = loadAppSettings();
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<Category>(settings.defaultCategory);
  const [difficulty] = useState(settings.defaultDifficulty);
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([apiClient.getProfile(), apiClient.listRecentLessons(6)])
      .then(([profileResponse, lessonsResponse]) => {
        if (!active) return;
        setProfile(profileResponse);
        setRecentLessons(lessonsResponse.items);
      })
      .catch((caught) => {
        if (active) setError(errorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submitLesson(event: FormEvent) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    setCreating(true);
    setError(null);
    try {
      const lesson = await apiClient.createLesson({
        prompt: trimmedPrompt,
        category,
        difficulty
      });
      navigate(`/lesson/${lesson.id}`);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell>
      <main className="dashboard">
        <section className="hero-panel" aria-labelledby="dashboard-title">
          <p className="eyebrow">Reading-first code explanations</p>
          <h1 id="dashboard-title">What programming idea should we untangle?</h1>
          <form className="prompt-form" onSubmit={submitLesson}>
            <label htmlFor="learning-prompt">What do you want to understand?</label>
            <div className="prompt-box">
              <textarea
                id="learning-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Explain Python decorators clearly and compare them with closures."
                rows={4}
              />
              <button type="submit" disabled={creating || !prompt.trim()}>
                {creating ? 'Starting...' : 'Start lesson'}
              </button>
            </div>
          </form>
          <div className="chip-row" aria-label="Language filters">
            {languageChips.map((chip) => (
              <button
                className={category === chip.category ? 'chip active' : 'chip'}
                key={chip.category}
                onClick={() => setCategory(category === chip.category ? 'general' : chip.category)}
                type="button"
              >
                {chip.label}
              </button>
            ))}
          </div>
          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="dashboard-grid" aria-label="Learning overview">
          <GlassPanel title="Recent lessons" loading={loading}>
            {recentLessons.length ? (
              <>
                <PillList items={profile?.recent_topics ?? []} empty="No recent topics yet." />
                <div className="lesson-list">
                  {recentLessons.map((lesson) => (
                    <Link className="lesson-link" key={lesson.id} to={`/lesson/${lesson.id}`}>
                      <span>{lesson.title}</span>
                      <small>{lesson.category} / {lesson.difficulty}</small>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <p className="muted">New lessons will appear here after you start learning.</p>
            )}
          </GlassPanel>
          <GlassPanel title="Weak points" loading={loading}>
            <PillList items={profile?.weak_points ?? []} empty="No weak points yet." />
          </GlassPanel>
          <GlassPanel title="Recommended next" loading={loading}>
            <PillList items={profile?.recommended_topics ?? []} empty="Recommendations appear as your profile grows." />
          </GlassPanel>
        </section>
      </main>
    </AppShell>
  );
}

function GlassPanel({ title, loading, children }: { title: string; loading?: boolean; children: React.ReactNode }) {
  return (
    <article className="glass-panel">
      <h2>{title}</h2>
      {loading ? <p className="muted">Loading...</p> : children}
    </article>
  );
}

function PillList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="muted">{empty}</p>;
  return (
    <div className="pill-list">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function LessonPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [interaction, setInteraction] = useState<LessonInteraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);
    setInteraction(null);
    apiClient
      .getLesson(id)
      .then((response) => {
        if (active) setLesson(response);
      })
      .catch((caught) => {
        if (active) setError(errorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function runAction(action: LessonAction) {
    if (!lesson) return;
    setActiveAction(action);
    setActionError(null);
    try {
      const [response] = await Promise.all([apiClient.runLessonAction(lesson.id, action), delay(visibleLoadingDelayMs)]);
      setInteraction(response);
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setActiveAction(null);
    }
  }

  async function saveLesson() {
    if (!lesson) return;
    setActiveAction('save');
    setActionError(null);
    try {
      const [response] = await Promise.all([
        apiClient.updateLesson(lesson.id, { is_favorite: !lesson.is_favorite }),
        delay(visibleLoadingDelayMs)
      ]);
      setLesson(response);
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setActiveAction(null);
    }
  }

  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!lesson || !question.trim()) return;
    setActiveAction('ask');
    setActionError(null);
    try {
      const [response] = await Promise.all([apiClient.askFollowup(lesson.id, question.trim()), delay(visibleLoadingDelayMs)]);
      setInteraction(response);
      setQuestion('');
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setActiveAction(null);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <main className="lesson-page narrow">
          <p className="loading-text">Preparing lesson...</p>
        </main>
      </AppShell>
    );
  }

  if (error || !lesson) {
    return (
      <AppShell>
        <main className="lesson-page narrow">
          <div className="state-panel error-state">
            <h1>Lesson unavailable</h1>
            <p>{error ?? 'Lesson not found'}</p>
            <Link to="/">Start a new lesson</Link>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="lesson-page">
        <form className="lesson-search" onSubmit={submitQuestion}>
          <label htmlFor="lesson-question">Ask within this lesson</label>
          <input
            id="lesson-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a follow-up about this concept"
          />
          <button disabled={!question.trim() || activeAction === 'ask'} type="submit">
            {activeAction === 'ask' ? 'Asking...' : 'Ask'}
          </button>
        </form>

        <article className="lesson-article">
          <header className="lesson-title-band" aria-label="Lesson title and actions" role="region">
            <div>
              <p className="eyebrow">{lesson.category} / {lesson.difficulty}</p>
              <h1>{lesson.title}</h1>
              <p className="prompt-echo">{lesson.user_prompt}</p>
            </div>
            <div className="action-cluster" aria-label="Lesson quick actions">
              {actionButtons.map((button) => (
                <button
                  key={button.label}
                  type="button"
                  onClick={() => {
                    if (button.kind === 'action' && button.action) void runAction(button.action);
                    if (button.kind === 'save') void saveLesson();
                    if (button.kind === 'ask') setAskOpen((open) => !open);
                  }}
                  disabled={activeAction !== null}
                  aria-label={button.label}
                >
                  {activeAction === (button.action ?? button.kind) ? 'Working...' : button.label}
                </button>
              ))}
            </div>
          </header>

          {askOpen && (
            <section className="inline-ask">
              <p>Use the search box above to ask a contextual follow-up.</p>
            </section>
          )}

          {actionError && <p className="error-text">{actionError}</p>}
          {interaction && <InteractionResult interaction={interaction} />}

          <LessonContent lesson={lesson} />
        </article>
      </main>
    </AppShell>
  );
}

function InteractionResult({ interaction }: { interaction: LessonInteraction }) {
  const response = interaction.response;
  const isAction = 'title' in response;

  return (
    <section className="interaction-result" aria-live="polite">
      <h2>{isAction ? response.title : response.short_answer}</h2>
      <p><LatexText text={isAction ? response.content : response.detailed_explanation} /></p>
      {response.code_example && <CodeExampleBlock example={response.code_example} />}
      <ul>
        {(isAction ? response.bullets : response.suggested_followups).map((item) => (
          <li key={item}><LatexText text={item} /></li>
        ))}
      </ul>
    </section>
  );
}

function LessonContent({ lesson }: { lesson: Lesson }) {
  const content = lesson.content;
  return (
    <div className="content-stack">
      <ContentBlock title="One-sentence understanding">
        <p className="one-liner"><LatexText text={content.one_liner} /></p>
      </ContentBlock>
      <ContentBlock title="Core explanation">
        <p><LatexText text={content.core_explanation} /></p>
      </ContentBlock>
      <ContentBlock title="Code example">
        {content.code_examples.map((example) => (
          <CodeExampleBlock example={example} key={`${example.title}-${example.language}`} />
        ))}
      </ContentBlock>
      <ContentBlock title="Prerequisites">
        <Bullets items={content.prerequisites} />
      </ContentBlock>
      <ContentBlock title="Common use cases">
        <Bullets items={content.common_use_cases} />
      </ContentBlock>
      <ContentBlock title="Common misconceptions">
        <Bullets items={content.misconceptions} />
      </ContentBlock>
      <ContentBlock title="Compare with">
        {content.comparisons.map((comparison) => (
          <div className="comparison" key={comparison.target_concept}>
            <h3>{comparison.target_concept}</h3>
            <p><LatexText text={comparison.when_to_use} /></p>
            <dl>
              <dt>Similarities</dt>
              <dd><LatexText text={comparison.similarities.join(' ')} /></dd>
              <dt>Differences</dt>
              <dd><LatexText text={comparison.differences.join(' ')} /></dd>
            </dl>
          </div>
        ))}
      </ContentBlock>
      <ContentBlock title="Review points">
        <Bullets items={content.summary} />
      </ContentBlock>
      <ContentBlock title="Suggested questions">
        <Bullets items={content.suggested_questions} />
      </ContentBlock>
    </div>
  );
}

function ContentBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="content-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function CodeExampleBlock({ example }: { example: CodeExample }) {
  return (
    <figure className="code-example">
      <figcaption>
        <span>{example.title}</span>
        <small>{example.language}</small>
      </figcaption>
      <pre>
        <code>{example.code}</code>
      </pre>
      <p>{example.explanation}</p>
    </figure>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="warm-list">
      {items.map((item) => (
        <li key={item}><LatexText text={item} /></li>
      ))}
    </ul>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [saved, setSaved] = useState(false);

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function submitSettings(event: FormEvent) {
    event.preventDefault();
    saveAppSettings(settings);
    setSettings(loadAppSettings());
    setSaved(true);
  }

  return (
    <AppShell>
      <main className="settings-page">
        <section className="settings-panel">
          <p className="eyebrow">Local workspace</p>
          <h1>Settings</h1>
          <p className="muted">These preferences stay in this browser. DeepSeek keys stay in backend environment files.</p>
          <form className="settings-form" onSubmit={submitSettings}>
            <label htmlFor="api-base-url">API base URL</label>
            <input
              id="api-base-url"
              value={settings.apiBaseUrl}
              onChange={(event) => updateSetting('apiBaseUrl', event.target.value)}
            />

            <label htmlFor="default-category">Default category</label>
            <select
              id="default-category"
              value={settings.defaultCategory}
              onChange={(event) => updateSetting('defaultCategory', event.target.value as Category)}
            >
              <option value="general">General</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="sql">SQL</option>
              <option value="algorithm">Algorithms</option>
            </select>

            <label htmlFor="default-difficulty">Default difficulty</label>
            <select
              id="default-difficulty"
              value={settings.defaultDifficulty}
              onChange={(event) => updateSetting('defaultDifficulty', event.target.value as AppSettings['defaultDifficulty'])}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <label htmlFor="language-preference">Language preference</label>
            <select
              id="language-preference"
              value={settings.languagePreference}
              onChange={(event) => updateSetting('languagePreference', event.target.value as AppSettings['languagePreference'])}
            >
              <option value="Chinese">Chinese</option>
              <option value="English">English</option>
              <option value="Follow prompt">Follow prompt</option>
            </select>

            <button type="submit">Save settings</button>
          </form>
          {saved && <p className="save-text">Settings saved for this browser.</p>}
        </section>
      </main>
    </AppShell>
  );
}

function SimpleCollectionPage({ kind }: { kind: 'history' | 'notes' }) {
  const title = kind === 'history' ? 'Learning history' : 'Learning notes';
  const description =
    kind === 'history'
      ? 'Recent lessons and review moments will collect here as the backend grows.'
      : 'Saved notes will collect here without interrupting lesson reading.';

  return (
    <AppShell>
      <main className="simple-page">
        <section className="state-panel">
          <p className="eyebrow">MVP support space</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <Link to="/">Return to dashboard</Link>
        </section>
      </main>
    </AppShell>
  );
}

function NotFoundPage() {
  return (
    <AppShell>
      <main className="simple-page">
        <section className="state-panel">
          <h1>Page not found</h1>
          <p>This route is not part of the Code Mentor MVP.</p>
          <Link to="/">Return to dashboard</Link>
        </section>
      </main>
    </AppShell>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/lesson/:id" element={<LessonPage />} />
      <Route path="/history" element={<SimpleCollectionPage kind="history" />} />
      <Route path="/notes" element={<SimpleCollectionPage kind="notes" />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
