import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  GraduationCap,
  Copy,
  Check,
} from 'lucide-react';
import { askStudyAssistant } from '../api/studyAssistantApi';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../api/studentselfApi';

// Sample quiz questions bank categorized by school level/class
const QUIZ_BANK = {
  default: [
    {
      subject: 'Integrated Science',
      topic: 'Photosynthesis',
      question: 'Which pigment in plants absorbs sunlight to drive photosynthesis?',
      options: ['Chlorophyll', 'Carotenoid', 'Hemoglobin', 'Anthocyanin'],
      correctIndex: 0,
      explanation: 'Chlorophyll is the green pigment in chloroplasts that absorbs light energy required for photosynthesis.',
    },
    {
      subject: 'Mathematics',
      topic: 'Algebra & Equations',
      question: 'Solve for x in the linear equation: 3x - 7 = 14',
      options: ['x = 5', 'x = 7', 'x = 21', 'x = 3'],
      correctIndex: 1,
      explanation: 'Adding 7 to both sides gives 3x = 21. Dividing both sides by 3 gives x = 7.',
    },
    {
      subject: 'English Language',
      topic: 'Parts of Speech',
      question: 'Identify the adverb in the following sentence: "The students listened attentively to the teacher."',
      options: ['students', 'listened', 'attentively', 'teacher'],
      correctIndex: 2,
      explanation: '"Attentively" is an adverb because it modifies the verb "listened", describing how they listened.',
    },
    {
      subject: 'Social Studies',
      topic: 'Our Environment',
      question: 'Which of the following human activities is the leading cause of soil degradation and deforestation?',
      options: ['Crop rotation', 'Afforestation', 'Illegal surface mining (Galamsey)', 'Organic farming'],
      correctIndex: 2,
      explanation: 'Illegal surface mining strips topsoil, destroys vegetative cover, and pollutes water bodies.',
    },
    {
      subject: 'ICT / Computing',
      topic: 'Computer Hardware',
      question: 'Which computer component is known as the "brain" of the computer that performs calculations?',
      options: ['Hard Disk Drive', 'Central Processing Unit (CPU)', 'RAM', 'Power Supply Unit'],
      correctIndex: 1,
      explanation: 'The CPU (Central Processing Unit) executes instructions and coordinates all processing tasks.',
    },
  ],
  JHS: [
    {
      subject: 'Integrated Science',
      topic: 'Acids and Bases',
      question: 'What color does blue litmus paper turn when dipped into an acidic solution?',
      options: ['Blue', 'Red', 'Green', 'Yellow'],
      correctIndex: 1,
      explanation: 'Acids turn blue litmus paper red, while alkalis turn red litmus paper blue.',
    },
    {
      subject: 'Mathematics',
      topic: 'Percentages and Ratios',
      question: 'What is 15% of 240?',
      options: ['32', '36', '40', '24'],
      correctIndex: 1,
      explanation: '15% of 240 = (15 / 100) * 240 = 0.15 * 240 = 36.',
    },
    {
      subject: 'English Language',
      topic: 'Figures of Speech',
      question: '"The wind whispered through the trees" is an example of which literary device?',
      options: ['Metaphor', 'Simile', 'Personification', 'Hyperbole'],
      correctIndex: 2,
      explanation: 'Personification gives human qualities (whispering) to non-human things (the wind).',
    },
    {
      subject: 'Social Studies',
      topic: 'Governance & Citizenship',
      question: 'Which organ of government is primarily responsible for making and amending laws in Ghana?',
      options: ['The Judiciary', 'The Executive', 'The Legislature (Parliament)', 'The Council of State'],
      correctIndex: 2,
      explanation: 'Parliament (the Legislature) has constitutional authority to introduce, debate, and pass laws.',
    },
  ],
  PRIMARY: [
    {
      subject: 'Natural Science',
      topic: 'Living and Non-Living Things',
      question: 'Which of the following is a characteristic of all living organisms?',
      options: ['They can grow and reproduce', 'They are made of metal', 'They do not need food or water', 'They stay the same size forever'],
      correctIndex: 0,
      explanation: 'All living things can respire, feed, grow, reproduce, and excrete waste.',
    },
    {
      subject: 'Mathematics',
      topic: 'Fractions',
      question: 'Which fraction is equivalent to 1/2?',
      options: ['2/4', '1/3', '3/5', '2/6'],
      correctIndex: 0,
      explanation: '2/4 simplifies directly to 1/2 when dividing the numerator and denominator by 2.',
    },
    {
      subject: 'English',
      topic: 'Punctuation',
      question: 'Which punctuation mark belongs at the end of an interrogative sentence (a question)?',
      options: ['Period (.)', 'Question mark (?)', 'Comma (,)', 'Exclamation point (!)'],
      correctIndex: 1,
      explanation: 'Questions end with a question mark (?).',
    },
  ],
  SHS: [
    {
      subject: 'Biology / Science',
      topic: 'Cellular Respiration',
      question: 'In which organelle does aerobic cellular respiration take place inside eukaryotic cells?',
      options: ['Mitochondria', 'Golgi apparatus', 'Ribosome', 'Endoplasmic reticulum'],
      correctIndex: 0,
      explanation: 'Mitochondria are the powerhouses of eukaryotic cells where ATP is produced via cellular respiration.',
    },
    {
      subject: 'Core Mathematics',
      topic: 'Quadratic Equations',
      question: 'What are the roots of the equation: x² - 5x + 6 = 0?',
      options: ['x = 2 and x = 3', 'x = -2 and x = -3', 'x = 1 and x = 6', 'x = -1 and x = -6'],
      correctIndex: 0,
      explanation: 'Factoring gives (x - 2)(x - 3) = 0, so the roots are x = 2 and x = 3.',
    },
    {
      subject: 'Economics / Social Studies',
      topic: 'Supply and Demand',
      question: 'All other things being equal, what happens to the price of a commodity when demand increases significantly?',
      options: ['Price rises', 'Price falls to zero', 'Price stays completely unaffected', 'Demand disappears'],
      correctIndex: 0,
      explanation: 'When demand exceeds current supply, competition among buyers bids prices upward.',
    },
  ],
};

const STUDY_GUIDE_TEMPLATES = [
  {
    title: 'How to Solve Word Problems in Mathematics',
    subject: 'Mathematics',
    summary: 'A step-by-step 4-step framework (Polya Method) to dissect any mathematical problem with confidence.',
    tips: [
      'Understand the problem: Read twice, highlight what is given and what you need to find.',
      'Devise a plan: Draw a diagram, identify formulas, or introduce variable letters like x.',
      'Carry out the plan: Substitute numbers carefully and show every working step.',
      'Review and check: Ask yourself if the final answer makes sense in the real world context.',
    ],
  },
  {
    title: 'Mastering Integrated Science Revision',
    subject: 'Integrated Science',
    summary: 'Key techniques for memorizing scientific terms, labeling diagrams, and writing balanced equations.',
    tips: [
      'Draw and label diagrams from memory (plant/animal cells, digestive system, water cycle).',
      'Use flashcards for definitions (e.g. Osmosis vs Diffusion, Acids vs Bases).',
      'Memorize SI units and standard symbols for measurements and elements.',
      'Practice past questions under timed conditions to improve exam speed.',
    ],
  },
  {
    title: 'Writing Winning Essays and Formal Letters',
    subject: 'English Language',
    summary: 'Essential structures for argumentative essays, narrative stories, and formal letters.',
    tips: [
      'Plan your structure: 1 Introduction + 3 Body Paragraphs (PEEL method) + 1 Conclusion.',
      'PEEL: Point, Explanation, Evidence/Example, Link back to the main question.',
      'Vary your sentence starters and use transitional words (Furthermore, Consequently, In contrast).',
      'Reserve 5 minutes at the end to proofread for punctuation, tense agreement, and spelling.',
    ],
  },
  {
    title: 'Active Recall & Spaced Repetition Habits',
    subject: 'General Study Skills',
    summary: 'Proven cognitive science techniques to retain information permanently for final exams.',
    tips: [
      'Do not just re-read notes passively; close your notebook and recite key concepts aloud.',
      'Space out revision sessions: Review a topic 1 day, 3 days, 1 week, and 3 weeks later.',
      'Teach someone else: Explaining a topic simply to a classmate exposes your knowledge gaps.',
      'Get 7-8 hours of sleep: The brain consolidates short-term memories into long-term memories during sleep.',
    ],
  },
];

const starterQuestions = [
  'Can you explain fractions with a real-life example?',
  'How do I structure a persuasive essay?',
  'What is the difference between mass and weight?',
  'Can you summarize the process of photosynthesis?',
];

export default function StudyAssistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' | 'quiz' | 'guide'
  const [studentProfile, setStudentProfile] = useState(null);

  // --- Section 1: What are you learning today? (Chat) ---
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // --- Section 2: Quick Quiz based on class ---
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // --- Section 3: Study Guide ---
  const [selectedGuide, setSelectedGuide] = useState(STUDY_GUIDE_TEMPLATES[0]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Fetch student profile to detect class
  useEffect(() => {
    if (user?.role === 'STUDENT') {
      getMyProfile()
        .then((profile) => setStudentProfile(profile))
        .catch(() => {
          // Fall back gracefully if not available
        });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'learn') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending, activeTab]);

  const askQuestion = async (value = question) => {
    const text = value.trim();
    if (!text || sending) return;

    setQuestion('');
    setError('');
    setSending(true);
    setMessages((current) => [...current, { role: 'user', text }]);

    try {
      const result = await askStudyAssistant(text);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: result.answer,
          refused: result.refused === true,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Goreb AI could not answer at this moment. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    askQuestion();
  };

  // Determine quiz list based on student's class name
  const className = studentProfile?.className || user?.className || '';
  const classKey = (() => {
    const upper = className.toUpperCase();
    if (upper.includes('SHS') || upper.includes('SENIOR') || upper.includes('FORM')) return 'SHS';
    if (upper.includes('JHS') || upper.includes('BASIC 7') || upper.includes('BASIC 8') || upper.includes('BASIC 9')) return 'JHS';
    if (upper.includes('PRIMARY') || upper.includes('BASIC 1') || upper.includes('BASIC 2') || upper.includes('BASIC 3') || upper.includes('BASIC 4') || upper.includes('BASIC 5') || upper.includes('BASIC 6')) return 'PRIMARY';
    return 'default';
  })();

  const rawQuizList = QUIZ_BANK[classKey] || QUIZ_BANK.default;
  const filteredQuizList =
    selectedSubjectFilter === 'ALL'
      ? rawQuizList
      : rawQuizList.filter((q) => q.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase()));

  const currentQuestion = filteredQuizList[currentQuizIndex] || filteredQuizList[0];

  const handleSelectOption = (optionIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuizIndex]: optionIndex,
    }));
  };

  const calculateQuizScore = () => {
    let score = 0;
    filteredQuizList.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setCurrentQuizIndex(0);
  };

  const handleCopyGuide = (text, index) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl flex-col gap-6">
      {/* Goreb AI Header */}
      <header className="rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10">
              <Sparkles className="h-7 w-7 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Goreb AI</h1>
                <span className="self-start sm:self-auto rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-200 border border-indigo-400/20">
                  {user?.role === 'STUDENT' ? 'Smart Study Companion' : 'AI Teaching & Study Assistant'}
                </span>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-indigo-100">
                Your intelligent study partner for step-by-step learning, quizzes, problem-solving, and revision guides.
              </p>
              {className && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-900/60 px-3 py-1 text-xs text-indigo-200 border border-indigo-700/50">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
                  <span>{user?.role === 'STUDENT' ? 'Personalized for class:' : 'Class scope:'} <strong>{className}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3 Main Sections Navigation */}
        <div className="mt-6 grid grid-cols-1 gap-2 border-t border-indigo-600/50 pt-6 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveTab('learn')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === 'learn'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <BookOpen className={`h-5 w-5 ${activeTab === 'learn' ? 'text-indigo-600' : 'text-indigo-200'}`} />
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">Section 1</div>
              <div className="font-bold">Learn Today</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <HelpCircle className={`h-5 w-5 ${activeTab === 'quiz' ? 'text-indigo-600' : 'text-indigo-200'}`} />
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">Section 2</div>
              <div className="font-bold">Quick Quiz</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${activeTab === 'guide' ? 'text-indigo-600' : 'text-indigo-200'}`} />
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">Section 3</div>
              <div className="font-bold">Study Guide</div>
            </div>
          </button>
        </div>
      </header>

      {/* SECTION 1: LEARN TODAY */}
      {activeTab === 'learn' && (
        <section className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-800">
                1. Learn Today
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {user?.role === 'STUDENT' ? 'Ask any question across your school syllabus' : 'Lesson explanations, syllabus clarifications & questions'}
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 min-h-[380px]">
            {messages.length === 0 && (
              <div className="mx-auto max-w-xl py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-gray-900">Learn Today</h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Ask Goreb AI to explain topics, walk you through homework problems, or summarize key lessons.
                </p>
                <div className="mt-6 grid gap-2.5 text-left sm:grid-cols-2">
                  {starterQuestions.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => askQuestion(starter)}
                      disabled={sending}
                      className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3.5 text-sm text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900 disabled:opacity-50 text-left"
                    >
                      <span>{starter}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 border border-gray-200/60 shadow-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                      <Sparkles className="h-3.5 w-3.5" /> Goreb AI
                    </div>
                  )}
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
                <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" />
                  <span className="ml-1 text-xs font-medium">Goreb AI is crafting your explanation...</span>
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-gray-100 bg-white p-3 sm:p-4">
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
                placeholder={
                user?.role === 'STUDENT'
                  ? "Ask Goreb AI anything about your subjects, e.g. 'Explain Newton's third law'..."
                  : "Ask Goreb AI for lesson ideas, syllabus explanations, or student quiz suggestions..."
              }
                className="max-h-40 min-h-12 flex-1 resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={sending || !question.trim()}
                aria-label="Send question"
                className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Goreb AI is designed for learning support. Check key facts with your teacher and syllabus textbooks.
            </p>
          </form>
        </section>
      )}

      {/* SECTION 2: QUICK QUIZ */}
      {activeTab === 'quiz' && (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-gray-900">2. Quick Quiz</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Targeted practice questions customized for {className ? <strong>{className}</strong> : 'your class level'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetQuiz}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Quiz
              </button>
            </div>
          </div>

          <div className="p-6">
            {filteredQuizList.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p>No quiz questions available for this selection.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Question progress & Topic metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800">
                      {currentQuestion?.subject}
                    </span>
                    <span className="text-xs text-gray-500">• {currentQuestion?.topic}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    Question {currentQuizIndex + 1} of {filteredQuizList.length}
                  </span>
                </div>

                {/* Question Box */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
                    {currentQuestion?.question}
                  </h3>

                  <div className="mt-4 space-y-2.5">
                    {currentQuestion?.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuizIndex] === optIdx;
                      const isCorrect = currentQuestion.correctIndex === optIdx;
                      let optionStyle = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'border-red-500 bg-red-50 text-red-900';
                        } else {
                          optionStyle = 'border-gray-200 opacity-60';
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-medium ring-2 ring-indigo-500/20';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(optIdx)}
                          disabled={quizSubmitted}
                          className={`w-full text-left rounded-xl border p-4 text-sm transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {quizSubmitted && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 ml-2" />
                          )}
                          {quizSubmitted && isSelected && !isCorrect && (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation if submitted */}
                {quizSubmitted && currentQuestion?.explanation && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-900">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-600" /> Explanation:
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-indigo-800">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* Controls & Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={currentQuizIndex === 0}
                      onClick={() => setCurrentQuizIndex((i) => Math.max(0, i - 1))}
                      className="flex-1 sm:flex-initial rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentQuizIndex === filteredQuizList.length - 1}
                      onClick={() => setCurrentQuizIndex((i) => Math.min(filteredQuizList.length - 1, i + 1))}
                      className="flex-1 sm:flex-initial rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {!quizSubmitted ? (
                      <button
                        type="button"
                        onClick={() => setQuizSubmitted(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
                      >
                        <FileCheck2 className="h-4 w-4" />
                        Check Answers
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">
                          Score: {calculateQuizScore()} / {filteredQuizList.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const prompt = `Can you explain the topics from the questions I missed in this quiz? The subject is ${currentQuestion?.subject}.`;
                            setActiveTab('learn');
                            askQuestion(prompt);
                          }}
                          className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          Ask Goreb AI to Explain My Mistakes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 3: STUDY GUIDE */}
      {activeTab === 'guide' && (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-gray-900">3. Study Guide</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Curated study methodologies, subject cheat sheets, and revision frameworks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Guide List Sidebar */}
            <div className="p-4 space-y-2 bg-gray-50/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">
                Available Guides
              </p>
              {STUDY_GUIDE_TEMPLATES.map((guide, idx) => {
                const isSelected = selectedGuide.title === guide.title;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedGuide(guide)}
                    className={`w-full text-left rounded-xl p-3 text-sm transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-800 hover:border-indigo-300 hover:bg-indigo-50/30'
                    }`}
                  >
                    <span className={`block text-[11px] font-semibold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-indigo-600'}`}>
                      {guide.subject}
                    </span>
                    <span className="mt-0.5 block font-semibold leading-snug">
                      {guide.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Guide Content Display */}
            <div className="p-6 md:col-span-2 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                    {selectedGuide.subject}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">{selectedGuide.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{selectedGuide.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyGuide(`${selectedGuide.title}\n\n${selectedGuide.tips.join('\n')}`, 0)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition flex-shrink-0"
                >
                  {copiedIndex === 0 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedIndex === 0 ? 'Copied' : 'Copy Guide'}
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Key Steps & Study Action Items
                </h4>
                <div className="space-y-2.5">
                  {selectedGuide.tips.map((tip, tipIdx) => (
                    <div
                      key={tipIdx}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 text-sm text-gray-800"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white flex-shrink-0 mt-0.5">
                        {tipIdx + 1}
                      </span>
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button to ask Goreb AI directly about this guide */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    Want personalized revision notes or a timetable for <strong>{selectedGuide.title}</strong>?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Can you generate a detailed study guide and step-by-step revision timetable for: "${selectedGuide.title}" (${selectedGuide.subject})?`;
                    setActiveTab('learn');
                    askQuestion(prompt);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition flex-shrink-0"
                >
                  Generate with Goreb AI
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
