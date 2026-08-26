import type { Category, ReadingScale, ThemePreference, ReviewStatus, UiLanguage } from './api/types';

export type { UiLanguage };

export interface UiCopy {
  nav: { history: string; notes: string; settings: string };
  dashboard: {
    eyebrow: string;
    title: string;
    summary: string;
    promptLabel: string;
    promptPlaceholder: string;
    starting: string;
    start: string;
    structured: string;
    anyTopic: string;
    categories: Record<Category, string>;
    recentLessons: string;
    keepThread: string;
    recent: string;
    openLesson: string;
    noRecentTopics: string;
    newLessons: string;
    weakPoints: string;
    noWeakPoints: string;
    recommended: string;
    noRecommendations: string;
  };
  lesson: {
    preparing: string;
    unavailable: string;
    notFound: string;
    startNew: string;
    askWithin: string;
    contextStays: string;
    askHint: string;
    askPlaceholder: string;
    asking: string;
    ask: string;
    saved: string;
    notSaved: string;
    noReview: string;
    needsReview: string;
    reviewed: string;
    requested: string;
    titleRegion: string;
    quickActions: string;
    status: string;
    followupAnswer: string;
    relatedConcepts: string;
    oneSentence: string;
    coreExplanation: string;
    codeExample: string;
    prerequisites: string;
    useCases: string;
    misconceptions: string;
    compareWith: string;
    reviewPoints: string;
    suggestedQuestions: string;
    markForReview: string;
    markReviewed: string;
    clearReview: string;
    updating: string;
    working: string;
    retention: string;
    notesTitle: string;
    savedCount: string;
    noteLabel: string;
    notePlaceholder: string;
    noteSaved: string;
    notesStay: string;
    saveNote: string;
    saving: string;
  };
  history: {
    eyebrow: string;
    title: string;
    summary: string;
    searchLabel: string;
    searchPlaceholder: string;
    allCategories: string;
    allReviewStates: string;
    needsReview: string;
    noReview: string;
    favoritesOnly: string;
    noMatch: string;
    clearFilters: string;
    historyEmpty: string;
    historyEmptyBody: string;
    startLesson: string;
    reviewed: string;
    unmarked: string;
  };
  notes: {
    eyebrow: string;
    title: string;
    summary: string;
    searchLabel: string;
    searchPlaceholder: string;
    noMatch: string;
    noNotes: string;
    emptyBody: string;
    findLesson: string;
    untitled: string;
    updated: string;
    edit: string;
    editLabel: string;
    save: string;
    delete: string;
    saving: string;
  };
  settings: {
    eyebrow: string;
    title: string;
    intro: string;
    workspace: string;
    apiBase: string;
    apiHelper: string;
    learningDefaults: string;
    defaultCategory: string;
    defaultDifficulty: string;
    languagePreference: string;
    reading: string;
    interfaceLanguage: string;
    theme: string;
    readingScale: string;
    system: string;
    light: string;
    dark: string;
    compact: string;
    default: string;
    comfortable: string;
    save: string;
    saved: string;
  };
  misc: { retention: string; returnDashboard: string; pageNotFound: string; routeMissing: string; retry: string; languageFilters: string; learningOverview: string; loadingContent: string; historyFilters: string; filterCategory: string; filterReview: string; historyResults: string; loadingHistory: string; savedNotes: string; similarities: string; differences: string };
  actions: Record<'rephrase' | 'example' | 'compare' | 'save' | 'review' | 'ask', string>;
  categories: Record<Category, string>;
  difficulty: Record<'beginner' | 'intermediate' | 'advanced', string>;
  review: Record<ReviewStatus, string>;
  scale: Record<ReadingScale, string>;
  theme: Record<ThemePreference, string>;
}

const english: UiCopy = {
  nav: { history: 'History', notes: 'Notes', settings: 'Settings' },
  dashboard: {
    eyebrow: 'Code knowledge workbench', title: 'Build a clearer mental model.',
    summary: 'Turn a programming question into a focused lesson you can read, revisit, and remember.',
    promptLabel: 'What do you want to understand?', promptPlaceholder: 'Explain Python decorators clearly and compare them with closures.',
    starting: 'Starting...', start: 'Start lesson', structured: 'Structured explanation', anyTopic: 'Any topic',
    categories: { python: 'Python', cpp: 'C++', sql: 'SQL', algorithm: 'Algorithms', general: 'General' },
    recentLessons: 'Recent lessons', keepThread: 'Keep your thread', recent: 'recent', openLesson: 'Open lesson',
    noRecentTopics: 'No recent topics yet.', newLessons: 'New lessons will appear here after you start learning.',
    weakPoints: 'Weak points', noWeakPoints: 'Complete a few lessons to see topics that need review.',
    recommended: 'Recommended next', noRecommendations: 'Recommendations appear as your profile grows.'
  },
  lesson: {
    preparing: 'Preparing lesson...', unavailable: 'Lesson unavailable', notFound: 'Lesson not found', startNew: 'Start a new lesson',
    askWithin: 'Ask within this lesson', contextStays: 'Context stays with this Lesson', askHint: 'Use the search box above to ask a contextual follow-up.', askPlaceholder: 'Ask a follow-up about this concept', asking: 'Asking...', ask: 'Ask',
    saved: 'Saved', notSaved: 'Not saved', noReview: 'No review mark', needsReview: 'Needs review', reviewed: 'Reviewed', titleRegion: 'Lesson title and actions', quickActions: 'Lesson quick actions', status: 'Lesson status',
    requested: 'Requested', followupAnswer: 'Follow-up answer', relatedConcepts: 'Related concepts', oneSentence: 'One-sentence understanding',
    coreExplanation: 'Core explanation', codeExample: 'Code example', prerequisites: 'Prerequisites', useCases: 'Common use cases',
    misconceptions: 'Common misconceptions', compareWith: 'Compare with', reviewPoints: 'Review points', suggestedQuestions: 'Suggested questions',
    markForReview: 'Mark for review', markReviewed: 'Mark reviewed', clearReview: 'Clear review', updating: 'Updating...', working: 'Working...',
    retention: 'Retention', notesTitle: 'Notes for this lesson', savedCount: 'saved', noteLabel: 'Capture the idea you want to remember',
    notePlaceholder: 'Write a short note about this concept', noteSaved: 'Note saved locally.', notesStay: 'Notes stay attached to this lesson.', saveNote: 'Save note', saving: 'Saving...'
  },
  history: {
    eyebrow: 'Your learning trail', title: 'Learning history', summary: 'Return to a concept when it is useful, not only when it is new.', searchLabel: 'Search lessons',
    searchPlaceholder: 'Search title or prompt', allCategories: 'All categories', allReviewStates: 'All review states', needsReview: 'Needs review', noReview: 'No review mark',
    favoritesOnly: 'Favorites only', noMatch: 'No lessons match these filters.', clearFilters: 'Clear a filter to see more of your learning trail.',
    historyEmpty: 'Your history starts with one clear question.', historyEmptyBody: 'Start a lesson from the home page and it will appear here.', startLesson: 'Start a lesson',
    reviewed: 'Reviewed', unmarked: 'Unmarked'
  },
  notes: {
    eyebrow: 'Retention layer', title: 'Learning notes', summary: 'Keep the small observations that make a concept easier to recall.', searchLabel: 'Search notes',
    searchPlaceholder: 'Search your notes', noMatch: 'No notes match this search.', noNotes: 'No notes yet.',
    emptyBody: 'Open a Lesson and capture the idea you want to remember at the end of the reading flow.', findLesson: 'Find a lesson', untitled: 'Untitled lesson',
    updated: 'Updated', edit: 'Edit', editLabel: 'Edit note', save: 'Save note', delete: 'Delete', saving: 'Saving...'
  },
  settings: {
    eyebrow: 'Local workspace', title: 'Settings', intro: 'These preferences stay in this browser. DeepSeek keys stay in backend environment files.', workspace: 'Workspace',
    apiBase: 'API base URL', apiHelper: 'Use the server root, for example http://localhost:8000.', learningDefaults: 'Learning defaults', defaultCategory: 'Default category',
    defaultDifficulty: 'Default difficulty', languagePreference: 'Language preference', reading: 'Reading', interfaceLanguage: 'Interface language', theme: 'Theme',
    readingScale: 'Reading scale', system: 'System', light: 'Light', dark: 'Dark', compact: 'Compact', default: 'Default', comfortable: 'Comfortable', save: 'Save settings', saved: 'Settings saved for this browser.'
  },
  misc: { retention: 'Retention', returnDashboard: 'Return to dashboard', pageNotFound: 'Page not found', routeMissing: 'This route is not part of the Code Mentor MVP.', retry: 'Retry', languageFilters: 'Language filters', learningOverview: 'Learning overview', loadingContent: 'Loading content', historyFilters: 'History filters', filterCategory: 'Filter by category', filterReview: 'Filter by review status', historyResults: 'Lesson history results', loadingHistory: 'Loading history', savedNotes: 'Saved notes', similarities: 'Similarities', differences: 'Differences' },
  actions: { rephrase: 'Rephrase', example: 'Give example', compare: 'Compare', save: 'Save', review: 'Review', ask: 'Ask AI' },
  categories: { python: 'Python', cpp: 'C++', sql: 'SQL', algorithm: 'Algorithms', general: 'General' },
  difficulty: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
  review: { none: 'No review mark', need_review: 'Needs review', reviewed: 'Reviewed' },
  scale: { compact: 'Compact', default: 'Default', comfortable: 'Comfortable' }, theme: { system: 'System', light: 'Light', dark: 'Dark' }
};

const chinese: UiCopy = {
  nav: { history: '学习记录', notes: '笔记', settings: '设置' },
  dashboard: {
    eyebrow: '代码知识工作台', title: '建立更清晰的心智模型。',
    summary: '把一个编程问题变成可以阅读、复习和记住的专注 Lesson。',
    promptLabel: '你想理解什么？', promptPlaceholder: '例如：请清楚解释 Python 装饰器，并对比它和闭包。',
    starting: '正在开始...', start: '开始 Lesson', structured: '结构化讲解', anyTopic: '不限主题',
    categories: { python: 'Python', cpp: 'C++', sql: 'SQL', algorithm: '算法', general: '通用' },
    recentLessons: '最近学习', keepThread: '继续你的学习线索', recent: '条最近记录', openLesson: '打开 Lesson',
    noRecentTopics: '还没有最近主题。', newLessons: '开始学习后，新的 Lesson 会显示在这里。',
    weakPoints: '薄弱点', noWeakPoints: '完成几次 Lesson 后，这里会显示需要复习的主题。',
    recommended: '下一步建议', noRecommendations: '随着学习记录增长，这里会生成推荐。'
  },
  lesson: {
    preparing: '正在准备 Lesson...', unavailable: 'Lesson 不可用', notFound: '找不到这个 Lesson', startNew: '开始新的 Lesson',
    askWithin: '在当前 Lesson 中追问', contextStays: '问题会保留当前 Lesson 上下文', askHint: '使用上方输入框，可以针对当前上下文继续提问。', askPlaceholder: '针对这个概念继续提问', asking: '正在提问...', ask: '提问',
    saved: '已收藏', notSaved: '未收藏', noReview: '未标记复习', needsReview: '需要复习', reviewed: '已复习', titleRegion: 'Lesson 标题和操作', quickActions: 'Lesson 快捷操作', status: 'Lesson 状态',
    requested: '请求内容', followupAnswer: '追问回答', relatedConcepts: '相关概念', oneSentence: '一句话理解',
    coreExplanation: '核心解释', codeExample: '代码示例', prerequisites: '前置知识', useCases: '常见使用场景',
    misconceptions: '常见误解', compareWith: '概念对比', reviewPoints: '复习要点', suggestedQuestions: '推荐问题',
    markForReview: '标记为需要复习', markReviewed: '标记为已复习', clearReview: '清除复习标记', updating: '正在更新...', working: '处理中...',
    retention: '知识留存', notesTitle: '本 Lesson 的笔记', savedCount: '条已保存', noteLabel: '记录你想记住的想法',
    notePlaceholder: '写下一条关于这个概念的短笔记', noteSaved: '笔记已保存在本地。', notesStay: '笔记会关联到当前 Lesson。', saveNote: '保存笔记', saving: '正在保存...'
  },
  history: {
    eyebrow: '你的学习轨迹', title: '学习记录', summary: '在概念有用的时候回来复习，而不只是学习新内容。', searchLabel: '搜索 Lesson',
    searchPlaceholder: '搜索标题或学习问题', allCategories: '全部分类', allReviewStates: '全部复习状态', needsReview: '需要复习', noReview: '未标记复习',
    favoritesOnly: '只看收藏', noMatch: '没有符合筛选条件的 Lesson。', clearFilters: '清除筛选后可以查看更多学习记录。',
    historyEmpty: '你的学习记录从一个清晰的问题开始。', historyEmptyBody: '从首页开始一个 Lesson，它就会显示在这里。', startLesson: '开始 Lesson',
    reviewed: '已复习', unmarked: '未标记'
  },
  notes: {
    eyebrow: '知识留存层', title: '学习笔记', summary: '保留那些让概念更容易回想起来的小观察。', searchLabel: '搜索笔记',
    searchPlaceholder: '搜索你的笔记', noMatch: '没有符合搜索条件的笔记。', noNotes: '还没有笔记。',
    emptyBody: '打开一个 Lesson，在阅读结束时记录你想记住的想法。', findLesson: '查找 Lesson', untitled: '未命名 Lesson',
    updated: '更新于', edit: '编辑', editLabel: '编辑笔记', save: '保存笔记', delete: '删除', saving: '正在保存...'
  },
  settings: {
    eyebrow: '本地工作区', title: '设置', intro: '这些偏好保存在当前浏览器中。DeepSeek 密钥仍保存在后端环境文件中。', workspace: '工作区',
    apiBase: 'API 根地址', apiHelper: '填写服务根地址，例如 http://localhost:8000。', learningDefaults: '学习默认值', defaultCategory: '默认分类',
    defaultDifficulty: '默认难度', languagePreference: 'Lesson 输出语言', reading: '阅读', interfaceLanguage: '界面语言', theme: '主题',
    readingScale: '阅读字号', system: '跟随系统', light: '浅色', dark: '深色', compact: '紧凑', default: '默认', comfortable: '舒适', save: '保存设置', saved: '设置已保存在当前浏览器。'
  },
  misc: { retention: '知识留存', returnDashboard: '返回首页', pageNotFound: '页面不存在', routeMissing: '这个路径不属于 Code Mentor MVP。', retry: '重试', languageFilters: '语言筛选', learningOverview: '学习概览', loadingContent: '正在加载内容', historyFilters: '记录筛选', filterCategory: '按分类筛选', filterReview: '按复习状态筛选', historyResults: '学习记录结果', loadingHistory: '正在加载记录', savedNotes: '已保存笔记', similarities: '相似点', differences: '差异' },
  actions: { rephrase: '换一种说法', example: '举个例子', compare: '进行对比', save: '收藏', review: '复习', ask: '向 AI 提问' },
  categories: { python: 'Python', cpp: 'C++', sql: 'SQL', algorithm: '算法', general: '通用' },
  difficulty: { beginner: '入门', intermediate: '中级', advanced: '高级' },
  review: { none: '未标记复习', need_review: '需要复习', reviewed: '已复习' },
  scale: { compact: '紧凑', default: '默认', comfortable: '舒适' }, theme: { system: '跟随系统', light: '浅色', dark: '深色' }
};

export const uiCopy: Record<UiLanguage, UiCopy> = { English: english, Chinese: chinese };
