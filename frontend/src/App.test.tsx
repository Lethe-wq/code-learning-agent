import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { AppRoutes } from './App';
import { actionInteractionFixture, lessonFixture, profileFixture } from './test/fixtures';
import { installFetchMock, mockJsonResponse } from './test/fetchMock';

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('dashboard', () => {
  test('creates a lesson from the central prompt and navigates to the lesson route', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/profile')) return mockJsonResponse(profileFixture);
      if (url.endsWith('/api/lessons?limit=6')) return mockJsonResponse({ items: [lessonFixture] });
      if (url.endsWith('/api/lessons') && init?.method === 'POST') return mockJsonResponse(lessonFixture);
      if (url.endsWith('/api/lessons/lesson_123')) return mockJsonResponse(lessonFixture);
      return mockJsonResponse({ error: { code: 'UNKNOWN', message: 'Unknown request' } }, { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await screen.findByText('Decorators');
    await userEvent.type(
      screen.getByLabelText('What do you want to understand?'),
      'Explain Python decorators clearly'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Start lesson' }));

    expect(await screen.findByRole('heading', { name: 'Python decorators' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/lessons',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Explain Python decorators clearly',
          category: 'general',
          difficulty: 'intermediate'
        })
      })
    );
  });

  test('uses saved local settings for API base URL and lesson defaults', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/profile')) return mockJsonResponse(profileFixture);
      if (url.endsWith('/api/lessons?limit=6')) return mockJsonResponse({ items: [] });
      if (url === 'http://127.0.0.1:9000/api/lessons' && init?.method === 'POST') return mockJsonResponse(lessonFixture);
      if (url === 'http://127.0.0.1:9000/api/lessons/lesson_123') return mockJsonResponse(lessonFixture);
      return mockJsonResponse({ error: { code: 'UNKNOWN', message: 'Unknown request' } }, { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await userEvent.clear(screen.getByLabelText('API base URL'));
    await userEvent.type(screen.getByLabelText('API base URL'), 'http://127.0.0.1:9000');
    await userEvent.selectOptions(screen.getByLabelText('Default category'), 'python');
    await userEvent.selectOptions(screen.getByLabelText('Default difficulty'), 'beginner');
    await userEvent.selectOptions(screen.getByLabelText('Language preference'), 'Chinese');
    await userEvent.click(screen.getByRole('button', { name: 'Save settings' }));
    await userEvent.click(screen.getByRole('link', { name: /Code Mentor/ }));

    await userEvent.type(screen.getByLabelText('What do you want to understand?'), 'Explain limits');
    await userEvent.click(screen.getByRole('button', { name: 'Start lesson' }));

    expect(await screen.findByRole('heading', { name: 'Python decorators' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:9000/api/lessons',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Explain limits',
          category: 'python',
          difficulty: 'beginner'
        })
      })
    );
  });
});

describe('lesson page', () => {
  test('renders structured lesson content and title-side actions', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValue(mockJsonResponse(lessonFixture));

    render(
      <MemoryRouter initialEntries={['/lesson/lesson_123']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Preparing lesson...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Python decorators' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'One-sentence understanding' })).toBeInTheDocument();
    expect(screen.getByText('Functions as values')).toBeInTheDocument();
    expect(screen.getByText('How do decorators with arguments work?')).toBeInTheDocument();

    const titleRegion = screen.getByRole('region', { name: 'Lesson title and actions' });
    expect(within(titleRegion).getByRole('button', { name: 'Rephrase' })).toBeInTheDocument();
    expect(within(titleRegion).getByRole('button', { name: 'Give example' })).toBeInTheDocument();
    expect(within(titleRegion).getByRole('button', { name: 'Compare' })).toBeInTheDocument();
    expect(within(titleRegion).getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(within(titleRegion).getByRole('button', { name: 'Review' })).toBeInTheDocument();
    expect(within(titleRegion).getByRole('button', { name: 'Ask AI' })).toBeInTheDocument();
  });

  test('renders LaTeX markers in lesson text without parsing code examples', async () => {
    const latexLesson = {
      ...lessonFixture,
      content: {
        ...lessonFixture.content,
        one_liner: 'A derivative can be written as $f^\\prime(x)=2x$.',
        core_explanation: 'The closed form is $$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$.',
        code_examples: [
          {
            ...lessonFixture.content.code_examples[0],
            code: 'print("$f(x)=x^2$ stays plain inside code")'
          }
        ]
      }
    };
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValue(mockJsonResponse(latexLesson));

    render(
      <MemoryRouter initialEntries={['/lesson/lesson_123']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Python decorators' });
    expect(document.querySelector('.math-inline')).toHaveTextContent('f^\\prime(x)=2x');
    expect(document.querySelector('.math-display')).toHaveTextContent('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}');

    const codeBlock = screen.getByText('print("$f(x)=x^2$ stays plain inside code")');
    expect(codeBlock.closest('pre')?.querySelector('.math-inline')).toBeNull();
  });

  test('shows action loading state and then renders action response', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/lessons/lesson_123') && !init?.method) return mockJsonResponse(lessonFixture);
      if (url.endsWith('/api/lessons/lesson_123/actions') && init?.method === 'POST') {
        return mockJsonResponse(actionInteractionFixture);
      }
      return mockJsonResponse({ error: { code: 'UNKNOWN', message: 'Unknown request' } }, { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={['/lesson/lesson_123']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Python decorators' });
    await userEvent.click(screen.getByRole('button', { name: 'Give example' }));

    expect(screen.getByRole('button', { name: 'Give example' })).toHaveTextContent('Working...');
    expect(await screen.findByRole('heading', { name: 'A practical decorator example' })).toBeInTheDocument();
    expect(screen.getByText('Keep wrappers small.')).toBeInTheDocument();
  });

  test('renders API error messages for lesson loading and failed actions', async () => {
    const fetchMock = installFetchMock();
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({ error: { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' } }, { status: 404 })
    );

    render(
      <MemoryRouter initialEntries={['/lesson/missing']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(await screen.findByText('Lesson not found')).toBeInTheDocument();

    cleanup();
    fetchMock.mockReset();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/lessons/lesson_123') && !init?.method) return mockJsonResponse(lessonFixture);
      if (url.endsWith('/api/lessons/lesson_123/actions')) {
        return mockJsonResponse(
          { error: { code: 'LLM_GENERATION_FAILED', message: 'Could not generate an example right now' } },
          { status: 500 }
        );
      }
      return mockJsonResponse({ error: { code: 'UNKNOWN', message: 'Unknown request' } }, { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={['/lesson/lesson_123']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Python decorators' });
    await userEvent.click(screen.getByRole('button', { name: 'Give example' }));

    await waitFor(() => expect(screen.getByText('Could not generate an example right now')).toBeInTheDocument());
  });
});
