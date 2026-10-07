'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sparkles,
  MessageSquare,
  FileText,
  HelpCircle,
  Send,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Bot,
  User,
  Lightbulb,
  Award,
} from 'lucide-react'
import type {
  LessonContentPayload,
  AiChatMessage,
  QuizQuestion,
  AiAssistantMode,
  AiAssistantResponse,
} from '../types'

interface LessonAiAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  lessonData: LessonContentPayload
  initialMode?: AiAssistantMode
}

export function LessonAiAssistantModal({
  isOpen,
  onClose,
  lessonData,
  initialMode = 'chat',
}: LessonAiAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<AiAssistantMode>(initialMode)

  // Chat State
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Summary State
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [copiedSummary, setCopiedSummary] = useState(false)

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false)
  const [isQuizLoading, setIsQuizLoading] = useState(false)

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab, isChatLoading])

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen && initialMode) {
      setActiveTab(initialMode)
    }
  }, [isOpen, initialMode])

  // Quick suggestion prompts
  const suggestionPrompts = [
    `اشرح لي الفكرة الرئيسية لدرس "${lessonData.lessonTitle}" بأسلوب مبسط`,
    `ما هي أهم المفاهيم والمصطلحات المذكورة في هذا الدرس؟`,
    `أعطني مثالاً توضيحياً من واقع الحياة حول موضوع الدرس`,
    `لخص لي أهم نقطة في هذا الدرس أركز عليها في الاختبار`,
  ]

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isChatLoading) return

    const userMessage: AiChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    if (!textToSend) setInputValue('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/ai/lesson-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          ...lessonData,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok || response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json().catch(() => null)
        const errorMessage: AiChatMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: data?.error || 'عذراً، حدث خطأ أثناء معالجة السؤال. يرجى المحاولة مرة أخرى.',
          createdAt: Date.now(),
        }
        setMessages((prev) => [...prev, errorMessage])
        return
      }

      const assistantId = `asst_${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          createdAt: Date.now(),
        },
      ])

      const reader = response.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantId ? { ...msg, content: accumulated } : msg))
        )
      }
    } catch {
      const errorMessage: AiChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة ثانية.',
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Generate Summary
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true)
    try {
      const response = await fetch('/api/ai/lesson-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'summary',
          ...lessonData,
        }),
      })

      if (!response.ok || response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json().catch(() => null)
        setSummary('تعذر توليد الملخص حالياً: ' + (data?.error || 'خطأ غير متوقع'))
        return
      }

      const reader = response.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let accumulated = ''
      setSummary('')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setSummary(accumulated)
      }
    } catch {
      setSummary('تعذر الاتصال بالخادم أثناء طلب التلخيص.')
    } finally {
      setIsSummaryLoading(false)
    }
  }

  // Copy Summary
  const handleCopySummary = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    setIsQuizLoading(true)
    setIsQuizSubmitted(false)
    setSelectedAnswers({})
    try {
      const response = await fetch('/api/ai/lesson-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'quiz',
          ...lessonData,
        }),
      })

      const data: AiAssistantResponse = await response.json()
      if (data.success && data.quiz && data.quiz.length > 0) {
        setQuizQuestions(data.quiz)
      } else {
        alert(data.error || 'تعذر توليد الكويز التفاعلي. حاول مجدداً.')
      }
    } catch {
      alert('تعذر الاتصال بالخادم لتوليد الكويز.')
    } finally {
      setIsQuizLoading(false)
    }
  }

  // Quiz answer selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isQuizSubmitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  // Calculate Quiz Score
  const score = quizQuestions.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctAnswer ? acc + 1 : acc
  }, 0)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] h-[88vh] max-h-[820px] p-0 flex flex-col overflow-hidden bg-white rounded-3xl border-ink-100 shadow-2xl">
        {/* Header with Title and Mode Tabs */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-ink-100 bg-linear-to-r from-cream/80 via-white to-cream/40 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-gold to-gold-dark text-white flex items-center justify-center shadow-md shadow-gold/20 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-lg font-heading font-extrabold text-ink-900 flex items-center gap-2">
                  <span>المعلم الذكي للدرس</span>
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30">
                    AI Powered
                  </span>
                </DialogTitle>
                <p className="text-xs text-ink-500 font-medium truncate max-w-sm sm:max-w-md">
                  {lessonData.lessonTitle} {lessonData.subjectName ? `• ${lessonData.subjectName}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 p-1 bg-ink-100/60 rounded-xl">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-ink-900 shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>اسأل المعلم</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('summary')
                if (!summary && !isSummaryLoading) {
                  handleGenerateSummary()
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'summary'
                  ? 'bg-white text-ink-900 shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>الملخص الذكي</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('quiz')
                if (quizQuestions.length === 0 && !isQuizLoading) {
                  handleGenerateQuiz()
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-white text-ink-900 shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>كويز تفاعلي</span>
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Chat Content */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-parchment/30">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="max-w-lg mx-auto py-6 text-center space-y-5">
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-gold/15 text-gold-dark flex items-center justify-center shadow-inner">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-ink-900 mb-1">
                      أهلاً بك يا بطل في درس "{lessonData.lessonTitle}"!
                    </h3>
                    <p className="text-xs text-ink-600 leading-relaxed">
                      أنا معلمك الذكي المقيد بمحتوى هذا الدرس فقط. اسألني عن أي نقطة غامضة، أو اطلب توضيحاً، أو اختر أحد الأسئلة المقترحة أدناه:
                    </p>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="grid grid-cols-1 gap-2 pt-2 text-right">
                    {suggestionPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="p-3 text-xs text-ink-800 bg-white border border-ink-150 rounded-xl hover:border-gold hover:bg-gold/5 transition flex items-center gap-2.5 text-right group shadow-2xs"
                      >
                        <Lightbulb className="w-4 h-4 text-gold shrink-0 group-hover:scale-110 transition" />
                        <span className="flex-1 leading-snug">{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        msg.role === 'user'
                          ? 'bg-ink-900 text-white'
                          : 'bg-gold text-white shadow-xs'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-ink-900 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-ink-800 border border-ink-150 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}

              {isChatLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gold text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-ink-150 rounded-2xl rounded-tl-xs p-4 flex items-center gap-2.5 text-xs text-ink-500 shadow-2xs">
                    <Loader2 className="w-4 h-4 animate-spin text-gold-dark" />
                    <span>المعلم الذكي يفكّر ويكتب الإجابة...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-ink-100 flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="مسح المحادثة"
                  className="p-2.5 text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-xl transition shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="اكتب سؤالك عن محتوى هذا الدرس هنا..."
                className="flex-1 input-field text-xs sm:text-sm py-2.5 px-4 bg-cream/30 border-ink-200 focus:bg-white"
                disabled={isChatLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isChatLoading}
                className="btn-gold py-2.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0"
              >
                {isChatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>إرسال</span>
                    <Send className="w-3.5 h-3.5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Smart Summary Content */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto p-6 bg-parchment/30">
            {isSummaryLoading ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center animate-bounce">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-ink-900 text-sm">
                    جاري إعداد الملخص الذكي للدرس...
                  </h4>
                  <p className="text-xs text-ink-500 mt-1">
                    يقوم الذكاء الاصطناعي بتحليل مقدمة الدرس والأقسام لصياغة أهم النقاط المركزة.
                  </p>
                </div>
              </div>
            ) : summary ? (
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-ink-150">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold-dark" />
                    <span className="font-heading font-bold text-sm text-ink-900">
                      ملخص ومراجعة الدرس السريعة
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySummary}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-sage" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-ink-500" />
                          <span>نسخ الملخص</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGenerateSummary}
                      className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1 text-ink-600"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة التوليد</span>
                    </button>
                  </div>
                </div>

                <div className="card p-6 bg-white border-ink-150 text-xs sm:text-sm text-ink-800 leading-relaxed whitespace-pre-line shadow-card">
                  {summary}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-ink-900 text-sm">
                    احصل على ملخص ذكي وشامل في ثوانٍ
                  </h4>
                  <p className="text-xs text-ink-500 mt-1">
                    يلخص لك الذكاء الاصطناعي الأفكار الجوهرية للدرس لتسهيل المراجعة السريعة.
                  </p>
                </div>
                <button
                  onClick={handleGenerateSummary}
                  className="btn-gold text-xs sm:text-sm py-2 px-5 font-bold"
                >
                  توليد الملخص الآن
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Interactive Quiz Content */}
        {activeTab === 'quiz' && (
          <div className="flex-1 overflow-y-auto p-6 bg-parchment/30">
            {isQuizLoading ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center animate-bounce">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-ink-900 text-sm">
                    جاري صياغة أسئلة الاختبار الذكي...
                  </h4>
                  <p className="text-xs text-ink-500 mt-1">
                    نستخرج أسئلة تفاعلية ومميزة مباشرة من صلب محتوى الدرس.
                  </p>
                </div>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Result banner if submitted */}
                {isQuizSubmitted && (
                  <div
                    className={`card p-5 border text-center transition-all ${
                      score === quizQuestions.length
                        ? 'bg-sage-50 border-sage/40 text-sage-dark'
                        : score >= quizQuestions.length / 2
                        ? 'bg-gold/10 border-gold/30 text-ink-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-xs mb-2">
                      <Award className="w-6 h-6 text-gold-dark" />
                    </div>
                    <h3 className="font-heading font-extrabold text-base">
                      {score === quizQuestions.length
                        ? '🎉 رائع جداً! إجابات مثالية بالكامل'
                        : score >= quizQuestions.length / 2
                        ? '👏 أحسنت! أداء جيد جداً'
                        : '💪 محاولة جيدة! راجع الشروحات أدناه للمزيد من الفهم'}
                    </h3>
                    <p className="text-xs mt-1 font-bold">
                      حصلت على {score} من {quizQuestions.length} أسئلة صحيحة
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={handleGenerateQuiz}
                        className="btn-outline text-xs py-1.5 px-3 bg-white"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>اختبار جديد بأسئلة أخرى</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-6">
                  {quizQuestions.map((q, qIndex) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined
                    const selectedIdx = selectedAnswers[q.id]
                    const isCorrect = selectedIdx === q.correctAnswer

                    return (
                      <div
                        key={q.id}
                        className="card p-5 sm:p-6 bg-white border-ink-150 shadow-card"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <span className="w-6 h-6 rounded-lg bg-ink-100 text-ink-800 text-xs font-heading font-bold flex items-center justify-center shrink-0">
                            {qIndex + 1}
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-ink-900 leading-snug">
                            {q.question}
                          </h4>
                        </div>

                        {/* Options */}
                        <div className="space-y-2.5">
                          {q.options.map((option, optIdx) => {
                            const isChosen = selectedIdx === optIdx
                            let optionClass =
                              'border-ink-150 bg-white hover:border-gold hover:bg-gold/5 text-ink-800'

                            if (isQuizSubmitted) {
                              if (optIdx === q.correctAnswer) {
                                optionClass =
                                  'border-sage bg-sage-50 text-sage-dark font-bold'
                              } else if (isChosen && !isCorrect) {
                                optionClass =
                                  'border-red-300 bg-red-50 text-red-800 font-bold'
                              } else {
                                optionClass =
                                  'border-ink-100 bg-ink-50/50 text-ink-400 opacity-60'
                              }
                            } else if (isChosen) {
                              optionClass =
                                'border-gold bg-gold/15 text-gold-dark font-bold shadow-2xs'
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isQuizSubmitted}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`w-full p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 text-right transition ${optionClass}`}
                              >
                                <span className="flex-1 leading-relaxed">{option}</span>
                                {isQuizSubmitted && optIdx === q.correctAnswer && (
                                  <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                                )}
                                {isQuizSubmitted && isChosen && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Explanation after submission */}
                        {isQuizSubmitted && (
                          <div className="mt-4 p-3.5 rounded-xl bg-cream/40 border border-ink-150 text-xs text-ink-700 leading-relaxed flex items-start gap-2.5">
                            <Lightbulb className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-ink-900 block mb-0.5">
                                توضيح الإجابة الصحيحة:
                              </strong>
                              <span>{q.explanation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Submit button */}
                {!isQuizSubmitted && (
                  <div className="text-center pt-2 pb-4">
                    <button
                      onClick={() => setIsQuizSubmitted(true)}
                      disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                      className="btn-gold text-sm py-2.5 px-8 font-bold disabled:opacity-50"
                    >
                      تحقق من إجاباتي
                    </button>
                    {Object.keys(selectedAnswers).length < quizQuestions.length && (
                      <p className="text-[11px] text-ink-500 mt-2">
                        يرجى الإجابة على جميع الأسئلة لتتمكن من التحقق من النتيجة
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-ink-900 text-sm">
                    اختبر فهمك لمحتوى الدرس
                  </h4>
                  <p className="text-xs text-ink-500 mt-1">
                    يولد لك الذكاء الاصطناعي 3 إلى 4 أسئلة اختيار من متعدد مباشرة من المحتوى.
                  </p>
                </div>
                <button
                  onClick={handleGenerateQuiz}
                  className="btn-gold text-xs sm:text-sm py-2 px-5 font-bold"
                >
                  بدء الاختبار التفاعلي
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
