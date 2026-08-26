import { createContext, FormEvent, useContext, useEffect, useRef, useState } from 'react';
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
  LessonInteraction,
  Note
} from './api/types';
import { LatexText } from './components/LatexText';
import { uiCopy, type UiLanguage } from './i18n';
import { applyAppSettings, loadAppSettings, saveAppSettings, type AppSettings } from './state/settings';

const languageChips: Array<{ label: string; category: Category }> = [
  { label: 'Python', category: 'python' },
  { label: 'C++', category: 'cpp' },
  { label: 'SQL', category: 'sql' },
  { label: 'Algorithms', category: 'algorithm' }
];

const actionButtons: Array<{ label: keyof typeof uiCopy.English.actions; kind: 'action' | 'save' | 'ask'; action?: LessonAction }> = [
  { label: 'rephrase', kind: 'action', action: 'rephrase' },
  { label: 'example', kind: 'action', action: 'example' },
  { label: 'compare', kind: 'action', action: 'compare' },
  { label: 'save', kind: 'save' },
  { label: 'review', kind: 'action', action: 'review' },
  { label: 'ask', kind: 'ask' }
];

const visibleLoadingDelayMs = 140;

const LocaleContext = createContext<UiLanguage>('English');

function useCopy() {
  return uiCopy[useContext(LocaleContext)];
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      element.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add('is-visible');
        observer.unobserve(element);
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>(() => loadAppSettings().uiLanguage);

  useEffect(() => {
    const settings = loadAppSettings();
    applyAppSettings(settings);
    document.documentElement.lang = settings.uiLanguage === 'Chinese' ? 'zh-CN' : 'en';
    const handleSettingsChange = () => {
      const nextSettings = loadAppSettings();
      setUiLanguage(nextSettings.uiLanguage);
      applyAppSettings(nextSettings);
      document.documentElement.lang = nextSettings.uiLanguage === 'Chinese' ? 'zh-CN' : 'en';
    };
    window.addEventListener('code-mentor-settings-change', handleSettingsChange);
    return () => window.removeEventListener('code-mentor-settings-change', handleSettingsChange);
  }, []);

  return <LocaleContext.Provider value={uiLanguage}>{children}</LocaleContext.Provider>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const uiLanguage = useContext(LocaleContext);
  const copy = uiCopy[uiLanguage];

  return (
    <div className="app-shell">
        <header className="topbar">
          <Link className="brand" to="/">
            <span className="brand-mark">CM</span>
            <span>Code Mentor</span>
          </Link>
          <nav aria-label={uiLanguage === 'Chinese' ? '主导航' : 'Primary navigation'}>
            <NavLink to="/history">{copy.nav.history}</NavLink>
            <NavLink to="/notes">{copy.nav.notes}</NavLink>
            <NavLink to="/settings">{copy.nav.settings}</NavLink>
          </nav>
        </header>
        {children}
    </div>
  );
}

function DashboardPage() {
  const copy = useCopy();
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
      <main className="dashboard page-transition">
        <Reveal>
        <section className="home-hero" aria-labelledby="dashboard-title">
          <div className="home-copy">
            <p className="eyebrow">{copy.dashboard.eyebrow}</p>
            <h1 id="dashboard-title">{copy.dashboard.title}</h1>
            <p className="home-summary">{copy.dashboard.summary}</p>
          </div>
          <div className="hero-panel">
            <form className="prompt-form" onSubmit={submitLesson}>
              <label htmlFor="learning-prompt">{copy.dashboard.promptLabel}</label>
              <div className="prompt-box">
                <textarea
                  id="learning-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={copy.dashboard.promptPlaceholder}
                  rows={4}
                />
                <button type="submit" disabled={creating || !prompt.trim()}>
                  {creating ? copy.dashboard.starting : copy.dashboard.start}
                </button>
              </div>
            </form>
            <div className="composer-footer">
              <span>{copy.dashboard.structured}</span>
              <span>{category === 'general' ? copy.dashboard.anyTopic : copy.categories[category]}</span>
            </div>
            <div className="chip-row" aria-label={copy.misc.languageFilters}>
              {languageChips.map((chip) => (
                <button
                  className={category === chip.category ? 'chip active' : 'chip'}
                  key={chip.category}
                  onClick={() => setCategory(category === chip.category ? 'general' : chip.category)}
                  type="button"
                >
                  {copy.categories[chip.category]}
                </button>
              ))}
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>
        </section>
        </Reveal>

        <Reveal>
        <section className="dashboard-grid" aria-label={copy.misc.learningOverview}>
          <GlassPanel title={copy.dashboard.recentLessons} loading={loading}>
            {recentLessons.length ? (
              <>
                <div className="panel-intro">
                  <span>{copy.dashboard.keepThread}</span>
                  <span>{recentLessons.length} {copy.dashboard.recent}</span>
                </div>
                <PillList items={profile?.recent_topics ?? []} empty={copy.dashboard.noRecentTopics} />
                <div className="lesson-list">
                  {recentLessons.map((lesson) => (
                    <Link className="lesson-link" key={lesson.id} to={`/lesson/${lesson.id}`}>
                      <span>{lesson.title}</span>
                      <small>{copy.categories[lesson.category]} / {copy.difficulty[lesson.difficulty]} <span aria-hidden="true">·</span> {copy.dashboard.openLesson}</small>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
                <p className="muted">{copy.dashboard.newLessons}</p>
            )}
          </GlassPanel>
          <GlassPanel title={copy.dashboard.weakPoints} loading={loading}>
            <PillList items={profile?.weak_points ?? []} empty={copy.dashboard.noWeakPoints} />
          </GlassPanel>
          <GlassPanel title={copy.dashboard.recommended} loading={loading}>
            <PillList items={profile?.recommended_topics ?? []} empty={copy.dashboard.noRecommendations} />
          </GlassPanel>
        </section>
        </Reveal>
      </main>
    </AppShell>
  );
}

function GlassPanel({ title, loading, children }: { title: string; loading?: boolean; children: React.ReactNode }) {
  return (
    <article className="glass-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span className="panel-mark" aria-hidden="true" />
      </div>
      {loading ? <PanelSkeleton /> : children}
    </article>
  );
}

function PanelSkeleton() {
  return (
    <div className="panel-skeleton" aria-label={useCopy().misc.loadingContent}>
      <span />
      <span />
      <span />
    </div>
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
  const copy = useCopy();
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [interaction, setInteraction] = useState<LessonInteraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);
    setInteraction(null);
    Promise.all([apiClient.getLesson(id), apiClient.listNotes(id).catch(() => ({ items: [] }))])
      .then(([lessonResponse, notesResponse]) => {
        if (!active) return;
        setLesson(lessonResponse);
        setNotes(notesResponse.items ?? []);
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

  async function updateReviewStatus() {
    if (!lesson) return;
    const nextStatus = lesson.review_status === 'none'
      ? 'need_review'
      : lesson.review_status === 'need_review'
        ? 'reviewed'
        : 'none';
    setActiveAction('review-status');
    setActionError(null);
    try {
      const [response] = await Promise.all([
        apiClient.updateLesson(lesson.id, { review_status: nextStatus }),
        delay(visibleLoadingDelayMs)
      ]);
      setLesson(response);
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setActiveAction(null);
    }
  }

  async function saveNote(event: FormEvent) {
    event.preventDefault();
    if (!lesson || !noteDraft.trim()) return;
    setNoteSaving(true);
    setNoteError(null);
    setNoteSaved(false);
    try {
      const note = await apiClient.createNote({ lesson_id: lesson.id, content: noteDraft.trim() });
      setNotes((current) => [note, ...current]);
      setNoteDraft('');
      setNoteSaved(true);
    } catch (caught) {
      setNoteError(errorMessage(caught));
    } finally {
      setNoteSaving(false);
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
        <main className="lesson-page narrow page-transition">
          <div className="lesson-skeleton" aria-label={copy.lesson.preparing}>
            <p className="loading-text">{copy.lesson.preparing}</p>
            <span />
            <span />
            <span />
          </div>
        </main>
      </AppShell>
    );
  }

  if (error || !lesson) {
    return (
      <AppShell>
        <main className="lesson-page narrow page-transition">
            <div className="state-panel error-state">
            <h1>{copy.lesson.unavailable}</h1>
            <p>{error ?? copy.lesson.notFound}</p>
            <Link to="/">{copy.lesson.startNew}</Link>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="lesson-page page-transition">
        <form className="lesson-search" onSubmit={submitQuestion}>
          <div className="search-label-row">
            <label htmlFor="lesson-question">{copy.lesson.askWithin}</label>
            <span>{copy.lesson.contextStays}</span>
          </div>
          <input
            id="lesson-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={copy.lesson.askPlaceholder}
          />
          <button disabled={!question.trim() || activeAction === 'ask'} type="submit">
            {activeAction === 'ask' ? copy.lesson.asking : copy.lesson.ask}
          </button>
        </form>

        <article className="lesson-article">
          <header className="lesson-title-band" aria-label={copy.lesson.titleRegion} role="region">
            <div>
              <p className="eyebrow">{copy.categories[lesson.category]} / {copy.difficulty[lesson.difficulty]}</p>
              <h1>{lesson.title}</h1>
              <p className="prompt-echo">{lesson.user_prompt}</p>
              <div className="lesson-statuses" aria-label={copy.lesson.status}>
                <span className={lesson.is_favorite ? 'status-badge active' : 'status-badge'}>
                  {lesson.is_favorite ? copy.lesson.saved : copy.lesson.notSaved}
                </span>
                <span className={`status-badge review-${lesson.review_status}`}>
                  {copy.review[lesson.review_status]}
                </span>
              </div>
            </div>
            <div className="action-cluster" aria-label={copy.lesson.quickActions}>
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
                  aria-label={copy.actions[button.label]}
                >
                  {activeAction === (button.action ?? button.kind)
                    ? copy.lesson.working
                    : copy.actions[button.label]}
                </button>
              ))}
              <button
                className="review-action"
                type="button"
                onClick={() => void updateReviewStatus()}
                disabled={activeAction !== null}
              >
                {activeAction === 'review-status'
                  ? copy.lesson.updating
                  : lesson.review_status === 'none'
                    ? copy.lesson.markForReview
                    : lesson.review_status === 'need_review'
                      ? copy.lesson.markReviewed
                      : copy.lesson.clearReview}
              </button>
            </div>
          </header>

          {askOpen && (
            <section className="inline-ask">
              <p>{copy.lesson.askHint}</p>
            </section>
          )}

          {actionError && <p className="error-text">{actionError}</p>}
          {interaction && <InteractionResult interaction={interaction} />}

          <LessonContent lesson={lesson} />

          <Reveal>
          <section className="notes-section" aria-labelledby="lesson-notes-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.lesson.retention}</p>
                <h2 id="lesson-notes-title">{copy.lesson.notesTitle}</h2>
              </div>
              <span>{notes.length} {copy.lesson.savedCount}</span>
            </div>
            <form className="note-form" onSubmit={saveNote}>
              <label htmlFor="lesson-note">{copy.lesson.noteLabel}</label>
              <textarea
                id="lesson-note"
                value={noteDraft}
                onChange={(event) => {
                  setNoteDraft(event.target.value);
                  setNoteSaved(false);
                }}
                placeholder={copy.lesson.notePlaceholder}
                rows={3}
              />
              <div className="note-form-footer">
                <span>{noteError ?? (noteSaved ? copy.lesson.noteSaved : copy.lesson.notesStay)}</span>
                <button type="submit" disabled={noteSaving || !noteDraft.trim()}>
                  {noteSaving ? copy.lesson.saving : copy.lesson.saveNote}
                </button>
              </div>
            </form>
            {notes.length > 0 && (
              <div className="note-list">
                {notes.map((note) => (
                  <article className="note-item" key={note.id}>
                    <p>{note.content}</p>
                    <time dateTime={note.updated_at}>{copy.notes.updated} {new Date(note.updated_at).toLocaleDateString()}</time>
                  </article>
                ))}
              </div>
            )}
          </section>
          </Reveal>
        </article>
      </main>
    </AppShell>
  );
}

function InteractionResult({ interaction }: { interaction: LessonInteraction }) {
  const copy = useCopy();
  const response = interaction.response;
  const isAction = 'title' in response;

  return (
    <Reveal>
    <section className="interaction-result" aria-live="polite">
      <div className="interaction-label">{isAction ? `${copy.lesson.requested}: ${response.action}` : copy.lesson.followupAnswer}</div>
      <h2>{isAction ? response.title : response.short_answer}</h2>
      <p><LatexText text={isAction ? response.content : response.detailed_explanation} /></p>
      {response.code_example && <CodeExampleBlock example={response.code_example} />}
      <ul>
        {(isAction ? response.bullets : response.suggested_followups).map((item) => (
          <li key={item}><LatexText text={item} /></li>
        ))}
      </ul>
      {!isAction && response.related_concepts.length > 0 && (
        <div className="related-concepts">
          <span>{copy.lesson.relatedConcepts}</span>
          {response.related_concepts.map((concept) => <strong key={concept}>{concept}</strong>)}
        </div>
      )}
    </section>
    </Reveal>
  );
}

function LessonContent({ lesson }: { lesson: Lesson }) {
  const copy = useCopy();
  const content = lesson.content;
  return (
    <div className="content-stack">
      <ContentBlock title={copy.lesson.oneSentence}>
        <p className="one-liner"><LatexText text={content.one_liner} /></p>
      </ContentBlock>
      <ContentBlock title={copy.lesson.coreExplanation}>
        <p><LatexText text={content.core_explanation} /></p>
      </ContentBlock>
      <ContentBlock title={copy.lesson.codeExample}>
        {content.code_examples.map((example) => (
          <CodeExampleBlock example={example} key={`${example.title}-${example.language}`} />
        ))}
      </ContentBlock>
      <ContentBlock title={copy.lesson.prerequisites}>
        <Bullets items={content.prerequisites} />
      </ContentBlock>
      <ContentBlock title={copy.lesson.useCases}>
        <Bullets items={content.common_use_cases} />
      </ContentBlock>
      <ContentBlock title={copy.lesson.misconceptions}>
        <Bullets items={content.misconceptions} />
      </ContentBlock>
      <ContentBlock title={copy.lesson.compareWith}>
        {content.comparisons.map((comparison) => (
          <div className="comparison" key={comparison.target_concept}>
            <h3>{comparison.target_concept}</h3>
            <p><LatexText text={comparison.when_to_use} /></p>
            <dl>
              <dt>{copy.misc.similarities}</dt>
              <dd><LatexText text={comparison.similarities.join(' ')} /></dd>
              <dt>{copy.misc.differences}</dt>
              <dd><LatexText text={comparison.differences.join(' ')} /></dd>
            </dl>
          </div>
        ))}
      </ContentBlock>
      <ContentBlock title={copy.lesson.reviewPoints}>
        <Bullets items={content.summary} />
      </ContentBlock>
      <ContentBlock title={copy.lesson.suggestedQuestions}>
        <Bullets items={content.suggested_questions} />
      </ContentBlock>
    </div>
  );
}

function ContentBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
    <section className="content-block">
      <h2>{title}</h2>
      {children}
    </section>
    </Reveal>
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
  const copy = useCopy();
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());
  const [saved, setSaved] = useState(false);

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function submitSettings(event: FormEvent) {
    event.preventDefault();
    saveAppSettings(settings);
    applyAppSettings(settings);
    setSettings(loadAppSettings());
    setSaved(true);
  }

  return (
    <AppShell>
      <main className="settings-page page-transition">
        <section className="settings-panel">
          <p className="eyebrow">{copy.settings.eyebrow}</p>
          <h1>{copy.settings.title}</h1>
          <p className="settings-intro">{copy.settings.intro}</p>
          <form className="settings-form" onSubmit={submitSettings}>
            <fieldset>
              <legend>{copy.settings.workspace}</legend>
              <label htmlFor="api-base-url">{copy.settings.apiBase}</label>
              <input
                id="api-base-url"
                value={settings.apiBaseUrl}
                onChange={(event) => updateSetting('apiBaseUrl', event.target.value)}
              />
              <small>{copy.settings.apiHelper}</small>
            </fieldset>

            <fieldset>
              <legend>{copy.settings.learningDefaults}</legend>
              <label htmlFor="default-category">{copy.settings.defaultCategory}</label>
              <select
                id="default-category"
                value={settings.defaultCategory}
                onChange={(event) => updateSetting('defaultCategory', event.target.value as Category)}
              >
                <option value="general">{copy.categories.general}</option>
                <option value="python">{copy.categories.python}</option>
                <option value="cpp">{copy.categories.cpp}</option>
                <option value="sql">{copy.categories.sql}</option>
                <option value="algorithm">{copy.categories.algorithm}</option>
              </select>

              <label htmlFor="default-difficulty">{copy.settings.defaultDifficulty}</label>
              <select
                id="default-difficulty"
                value={settings.defaultDifficulty}
                onChange={(event) => updateSetting('defaultDifficulty', event.target.value as AppSettings['defaultDifficulty'])}
              >
                <option value="beginner">{copy.difficulty.beginner}</option>
                <option value="intermediate">{copy.difficulty.intermediate}</option>
                <option value="advanced">{copy.difficulty.advanced}</option>
              </select>

              <label htmlFor="language-preference">{copy.settings.languagePreference}</label>
              <select
                id="language-preference"
                value={settings.languagePreference}
                onChange={(event) => updateSetting('languagePreference', event.target.value as AppSettings['languagePreference'])}
              >
                <option value="Chinese">中文</option>
                <option value="English">English</option>
                <option value="Follow prompt">Follow prompt / 跟随问题</option>
              </select>
            </fieldset>

            <fieldset>
              <legend>{copy.settings.reading}</legend>
              <label htmlFor="interface-language">{copy.settings.interfaceLanguage}</label>
              <select
                id="interface-language"
                value={settings.uiLanguage}
                onChange={(event) => updateSetting('uiLanguage', event.target.value as AppSettings['uiLanguage'])}
              >
                <option value="English">English</option>
                <option value="Chinese">中文</option>
              </select>

              <label htmlFor="theme-preference">{copy.settings.theme}</label>
              <select
                id="theme-preference"
                value={settings.theme}
                onChange={(event) => updateSetting('theme', event.target.value as AppSettings['theme'])}
              >
                <option value="system">{copy.theme.system}</option>
                <option value="light">{copy.theme.light}</option>
                <option value="dark">{copy.theme.dark}</option>
              </select>

              <label htmlFor="reading-scale">{copy.settings.readingScale}</label>
              <select
                id="reading-scale"
                value={settings.readingScale}
                onChange={(event) => updateSetting('readingScale', event.target.value as AppSettings['readingScale'])}
              >
                <option value="compact">{copy.scale.compact}</option>
                <option value="default">{copy.scale.default}</option>
                <option value="comfortable">{copy.scale.comfortable}</option>
              </select>
            </fieldset>

            <button type="submit">{copy.settings.save}</button>
          </form>
          {saved && <p className="save-text">{copy.settings.saved}</p>}
        </section>
      </main>
    </AppShell>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function HistoryPage() {
  const copy = useCopy();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [reviewStatus, setReviewStatus] = useState<Lesson['review_status'] | ''>('');
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.listLessons({
        limit: 100,
        query,
        category: category || undefined,
        reviewStatus: reviewStatus || undefined,
        favorite: favorite || undefined
      });
      setLessons(response.items);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadHistory(), 180);
    return () => window.clearTimeout(timer);
  }, [query, category, reviewStatus, favorite]);

  return (
    <AppShell>
      <main className="collection-page page-transition">
        <section className="page-heading">
          <p className="eyebrow">{copy.history.eyebrow}</p>
          <h1>{copy.history.title}</h1>
          <p>{copy.history.summary}</p>
        </section>
        <section className="collection-toolbar" aria-label={copy.misc.historyFilters}>
          <label htmlFor="history-search">{copy.history.searchLabel}</label>
          <input id="history-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.history.searchPlaceholder} />
          <select aria-label={copy.misc.filterCategory} value={category} onChange={(event) => setCategory(event.target.value as Category | '')}>
            <option value="">{copy.history.allCategories}</option>
            <option value="python">{copy.categories.python}</option>
            <option value="cpp">{copy.categories.cpp}</option>
            <option value="sql">{copy.categories.sql}</option>
            <option value="algorithm">{copy.categories.algorithm}</option>
            <option value="general">{copy.categories.general}</option>
          </select>
          <select aria-label={copy.misc.filterReview} value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value as Lesson['review_status'] | '')}>
            <option value="">{copy.history.allReviewStates}</option>
            <option value="need_review">{copy.history.needsReview}</option>
            <option value="reviewed">{copy.history.reviewed}</option>
            <option value="none">{copy.history.noReview}</option>
          </select>
          <label className="checkbox-filter">
            <input type="checkbox" checked={favorite} onChange={(event) => setFavorite(event.target.checked)} />
            {copy.history.favoritesOnly}
          </label>
        </section>
        {loading && <CollectionSkeleton />}
        {error && <div className="inline-error"><p>{error}</p><button type="button" onClick={() => void loadHistory()}>{copy.misc.retry}</button></div>}
        {!loading && !error && lessons.length === 0 && (
          <section className="state-panel empty-state">
            <h2>{query || category || reviewStatus || favorite ? copy.history.noMatch : copy.history.historyEmpty}</h2>
            <p>{query || category || reviewStatus || favorite ? copy.history.clearFilters : copy.history.historyEmptyBody}</p>
            <Link to="/">{copy.history.startLesson}</Link>
          </section>
        )}
        {!loading && !error && lessons.length > 0 && (
          <section className="lesson-history-list" aria-label={copy.misc.historyResults}>
            {lessons.map((lesson) => (
              <Link className="history-row" key={lesson.id} to={`/lesson/${lesson.id}`}>
                <span className="history-main"><strong>{lesson.title}</strong><small>{lesson.user_prompt}</small></span>
                <span className="history-meta"><span>{copy.categories[lesson.category]}</span><span>{copy.difficulty[lesson.difficulty]}</span><span>{lesson.review_status === 'need_review' ? copy.history.needsReview : lesson.review_status === 'reviewed' ? copy.history.reviewed : copy.history.unmarked}</span><time dateTime={lesson.updated_at}>{formatDate(lesson.updated_at)}</time></span>
              </Link>
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}

function CollectionSkeleton() {
  return <div className="collection-skeleton" aria-label={useCopy().misc.loadingHistory}><span /><span /><span /></div>;
}

function NotesPage() {
  const copy = useCopy();
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    setLoading(true);
    setError(null);
    try {
      setNotes((await apiClient.listNotes(undefined, 100, query)).items);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadNotes(), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function saveEditedNote(id: string) {
    if (!draft.trim()) return;
    setBusyId(id);
    setError(null);
    try {
      const updated = await apiClient.updateNote(id, draft.trim());
      setNotes((current) => current.map((note) => note.id === id ? updated : note));
      setEditingId(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyId(null);
    }
  }

  async function removeNote(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await apiClient.deleteNote(id);
      setNotes((current) => current.filter((note) => note.id !== id));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell>
      <main className="collection-page page-transition">
        <section className="page-heading">
          <p className="eyebrow">{copy.notes.eyebrow}</p>
          <h1>{copy.notes.title}</h1>
          <p>{copy.notes.summary}</p>
        </section>
        <label className="collection-search" htmlFor="notes-search">{copy.notes.searchLabel}<input id="notes-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.notes.searchPlaceholder} /></label>
        {loading && <CollectionSkeleton />}
        {error && <div className="inline-error"><p>{error}</p><button type="button" onClick={() => void loadNotes()}>{copy.misc.retry}</button></div>}
        {!loading && !error && notes.length === 0 && (
          <section className="state-panel empty-state">
            <h2>{query ? copy.notes.noMatch : copy.notes.noNotes}</h2>
            <p>{copy.notes.emptyBody}</p>
            <Link to="/">{copy.notes.findLesson}</Link>
          </section>
        )}
        {!loading && !error && notes.length > 0 && (
          <section className="notes-list-page" aria-label={copy.misc.savedNotes}>
            {notes.map((note) => (
              <article className="note-page-item" key={note.id}>
                <div className="note-page-meta"><Link to={`/lesson/${note.lesson_id}`}>{note.lesson_title ?? copy.notes.untitled}</Link><time dateTime={note.updated_at}>{copy.notes.updated} {formatDate(note.updated_at)}</time></div>
                {editingId === note.id ? (
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} aria-label={copy.notes.editLabel} />
                ) : <p>{note.content}</p>}
                <div className="note-page-actions">
                  {editingId === note.id ? <button type="button" onClick={() => void saveEditedNote(note.id)} disabled={busyId === note.id}>{busyId === note.id ? copy.notes.saving : copy.notes.save}</button> : <button type="button" onClick={() => { setEditingId(note.id); setDraft(note.content); }}>{copy.notes.edit}</button>}
                  <button type="button" onClick={() => void removeNote(note.id)} disabled={busyId === note.id}>{copy.notes.delete}</button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}

function NotFoundPage() {
  const copy = useCopy();
  return (
    <AppShell>
      <main className="simple-page page-transition">
        <section className="state-panel">
          <h1>{copy.misc.pageNotFound}</h1>
          <p>{copy.misc.routeMissing}</p>
          <Link to="/">{copy.misc.returnDashboard}</Link>
        </section>
      </main>
    </AppShell>
  );
}

export function AppRoutes() {
  return (
    <LocaleProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </LocaleProvider>
  );
}

export default AppRoutes;
