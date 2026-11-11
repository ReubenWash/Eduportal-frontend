import { useEffect, useRef, useState } from 'react';
import { ArrowUp, BookOpen, Sparkles } from 'lucide-react';
import { askStudyAssistant } from '../api/studyAssistantApi';
import { useAuth } from '../context/AuthContext';

const starterQuestions = [
  'Can you explain fractions with an example?',
  'How do I structure a persuasive essay?',
  'What is the difference between mass and weight?',
];

export default function StudyAssistant() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const askQuestion = async (value = question) => {
    const text = value.trim();
    if (!text || sending) return;

    setQuestion('');
    setError('');
    setSending(true);
    setMessages((current) => [...current, { role: 'user', text }]);

    try {
      const result = await askStudyAssistant(text);
      setMessages((current) => [...current, {
        role: 'assistant',
        text: result.answer,
        refused: result.refused === true,
      }]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'The assistant could not answer. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    askQuestion();
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-4xl flex-col gap-6">
      <header className="rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-900 p-6 text-white shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/10 p-3"><Sparkles className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-semibold">Study Assistant</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
              Ask about school subjects, lessons, homework, and study skills. The assistant is designed for students and teachers and will decline unrelated questions.
            </p>
            <p className="mt-3 text-xs text-indigo-200">
              Signed in as {user?.role === 'STUDENT' ? 'student' : 'teacher'} · Questions are sent to the configured AI provider and are not saved as chat history.
            </p>
          </div>
        </div>
      </header>

      <section className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="mx-auto max-w-xl py-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-indigo-600" />
              <h2 className="mt-3 font-semibold text-gray-900">What are you learning today?</h2>
              <p className="mt-1 text-sm text-gray-500">Choose a suggested question or ask your own.</p>
              <div className="mt-5 grid gap-2 text-left sm:grid-cols-3">
                {starterQuestions.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => askQuestion(starter)}
                    disabled={sending}
                    className="rounded-xl border border-gray-200 p-3 text-sm text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {message.refused && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Outside educational scope
                  </p>
                )}
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <p className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">Preparing an explanation...</p>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={onSubmit} className="border-t border-gray-100 p-3 sm:p-4">
          <label htmlFor="study-question" className="sr-only">Ask a study question</label>
          <div className="flex items-end gap-2">
            <textarea
              id="study-question"
              rows={2}
              maxLength={2000}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  askQuestion();
                }
              }}
              placeholder="Ask a question about a school subject..."
              className="max-h-40 min-h-12 flex-1 resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              disabled={sending || !question.trim()}
              aria-label="Send question"
              className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">For learning support only. Verify important information with your teacher or textbook.</p>
        </form>
      </section>
    </div>
  );
}
