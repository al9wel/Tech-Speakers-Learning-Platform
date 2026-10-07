'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Send,
  Loader2,
  RotateCcw,
  User,
  ExternalLink,
  Compass,
} from 'lucide-react'
import type { CopilotMessage, CopilotResponse } from '../types'

interface GlobalAiCopilotDrawerProps {
  isOpen: boolean
  onClose: () => void
  userRole?: string | null
  userName?: string | null
}

const rolePrompts: Record<string, string[]> = {
  student: [
    'أين أجد دروسي وملخصات الـ PDF؟',
    'كيف أستشير الأخصائي النفسي بسرية؟',
    'كيف أنشر مشاركتي في مساهمات الطلاب؟',
    'أين أرسل اقتراحاً لتطوير المنصة؟',
  ],
  teacher: [
    'كيف أنشئ درساً جديداً وأرفق ملخص PDF؟',
    'أين أتابع استفسارات وأسئلة الطلاب؟',
    'كيف أنشر مقالاً إثرائياً في المركز الإعلامي؟',
    'كيف أعدل درساً قمت بنشره مسبقاً؟',
  ],
  supervisor: [
    'كيف أدقق محتوى الدروس المنشورة وأعدلها؟',
    'أين أتابع مقترحات الطلاب الواردة وحالاتها؟',
    'كيف أراجع مساهمات الطلاب الإبداعية؟',
    'كيف أنشر تعميماً رسمياً في الأخبار؟',
  ],
  counselor: [
    'كيف أرد على استشارات الطلاب بسرية تامة؟',
    'كيف أبدأ بمراسلة طالب محدد للدعم النفسي؟',
    'كيف أنشر مقالاً إرشادياً للطلاب؟',
  ],
  admin: [
    'كيف أعدل دور وصلاحيات مستخدم في المنصة؟',
    'كيف أضيف معلماً أو مشرفاً جديداً؟',
    'أين أجد الإحصائيات الشاملة للمنصة؟',
  ],
}

const defaultPrompts = [
  'ما هي الخدمات المتوفرة في المنصة؟',
  'دلني على أقسام المنصة الرئيسية.',
  'كيف أستفيد من المعلم الذكي والتلخيص الفوري؟',
]

const roleBadgeLabels: Record<string, string> = {
  student: 'حساب طالب',
  teacher: 'حساب معلم',
  supervisor: 'مشرف تربوي',
  counselor: 'مستشار نفسي',
  admin: 'مشرف عام (إدارة)',
}

export function GlobalAiCopilotDrawer({
  isOpen,
  onClose,
  userRole,
  userName,
}: GlobalAiCopilotDrawerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize initial greeting if empty
  const initializeGreeting = useCallback(() => {
    const displayName = userName ? `يا ${userName}` : 'عزيزي'
    const roleTitle = userRole && roleBadgeLabels[userRole] ? ` (${roleBadgeLabels[userRole]})` : ''
    const greetingText = `مرحباً بك ${displayName}! 👋\nأنا **دليل ومساعد المنصة**${roleTitle}. مهمتي إرشادك وتسهيل وصولك لأي خدمة أو قسم ترغب به بخطوات سريعة.\n\nكيف يمكنني مساعدتك اليوم؟`

    setMessages([
      {
        id: 'welcome_copilot',
        role: 'assistant',
        content: greetingText,
        createdAt: Date.now(),
      },
    ])
  }, [userName, userRole])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeGreeting()
    }
  }, [isOpen, messages.length, initializeGreeting])

  // Focus input safely
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true })
      }, 150)
    }
  }, [isOpen])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isOpen])

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputValue).trim()
    if (!content || isLoading) return

    const userMessage: CopilotMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content,
      createdAt: Date.now(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentPath: pathname,
        }),
      })

      if (!response.ok || response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json().catch(() => null)
        const errorMessage: CopilotMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: data?.error || 'عذراً، حدث خطأ أثناء إعداد التوجيه. يرجى المحاولة مرة أخرى.',
          createdAt: Date.now(),
        }
        setMessages((prev) => [...prev, errorMessage])
        return
      }

      const assistantId = `bot_${Date.now()}`
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
      const errorMessage: CopilotMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'تعذر الاتصال بخادم الذكاء الاصطناعي. يرجى التحقق من اتصال الإنترنت.',
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Parse [LINK: Title | /path] and render interactive buttons
  const renderMessageContent = (content: string) => {
    const linkRegex = /\[LINK:\s*([^\|]+?)\s*\|\s*([^\]]+?)\s*\]/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }

      const label = match[1].trim()
      const path = match[2].trim()

      parts.push(
        <button
          key={`link_${match.index}`}
          type="button"
          onClick={() => {
            router.push(path)
            onClose()
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1.5 mx-1 rounded-xl bg-[#F5EEDF] hover:bg-[#EBDDC3] text-ink-900 font-extrabold text-xs border border-[#DEC498] shadow-2xs transition cursor-pointer group"
          title={`الانتقال إلى: ${path}`}
        >
          <ExternalLink className="w-3.5 h-3.5 text-gold-dark group-hover:scale-110 transition-transform" />
          <span>{label}</span>
        </button>
      )

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-medium">
        {parts.map((p, idx) => (typeof p === 'string' ? <span key={idx}>{p}</span> : p))}
      </div>
    )
  }

  const suggestions = (userRole && rolePrompts[userRole]) || defaultPrompts

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="w-[94vw] sm:max-w-2xl max-h-[88vh] h-[640px] p-0 flex flex-col overflow-hidden rounded-2xl bg-white border-2 border-[#E2D8C3] shadow-2xl"
        showCloseButton={true}
      >
        {/* Header - Solid Cream Background */}
        <DialogHeader className="p-4 sm:p-5 border-b border-[#E8DFC9] bg-[#FAF7F0] shrink-0 text-right">
          <div className="flex items-center justify-between pl-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5EFE0] border border-[#DFC496] flex items-center justify-center text-gold-dark shadow-2xs shrink-0">
                <Compass className="w-5 h-5 text-gold-dark" />
              </div>
              <div className="text-right">
                <DialogTitle className="text-base sm:text-lg font-heading font-extrabold text-ink-900">
                  دليل المنصة
                </DialogTitle>
                <p className="text-xs text-ink-600 mt-0.5 flex items-center gap-2">
                  <span>مرشدك للوصول السريع لجميع الخدمات</span>
                  {userRole && roleBadgeLabels[userRole] && (
                    <span className="px-1.5 py-0.2 rounded bg-[#EFE6D4] text-gold-dark text-[10px] font-bold border border-[#DEC498]">
                      {roleBadgeLabels[userRole]}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={initializeGreeting}
              disabled={isLoading}
              className="p-2 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-[#EFE6D4] transition cursor-pointer"
              title="إعادة بدء المحادثة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-white border-b border-[#EFE7D8] overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-ink-500 whitespace-nowrap pl-1 shrink-0">
              أسئلة شائعة:
            </span>
            {suggestions.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-[#FAF7F0] hover:bg-[#F2E8D5] text-ink-800 text-xs font-semibold border border-[#E2D8C3] hover:border-gold transition shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Body - Solid Ivory Background */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-[#F7F4EC]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user'

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#EBDDBF] text-ink-900 border border-[#DFC496]'
                      : 'bg-[#EFE7D8] text-ink-800 border border-[#DFC496] shadow-2xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Compass className="w-4 h-4 text-gold-dark" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs transition-all ${
                    isUser
                      ? 'bg-[#EBD8B7] text-ink-900 border border-[#DFC496] rounded-tr-xs'
                      : 'bg-white text-ink-900 border border-[#E2D6BF] rounded-tl-xs shadow-xs'
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-xl bg-[#EFE7D8] text-ink-800 border border-[#DFC496] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-gold-dark" />
              </div>
              <div className="bg-white border border-[#E2D6BF] rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2 text-ink-700 text-xs shadow-xs font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-gold-dark" />
                <span>جاري إعداد التوجيه المناسب...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Footer - Solid White Pinned to bottom */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E8DFC9] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اطرح سؤالك حول أي خدمة أو قسم في المنصة..."
              disabled={isLoading}
              className="flex-1 bg-[#FAF7F0] border border-[#D8CBB6] focus:border-gold focus:ring-2 focus:ring-gold/30 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink-900 outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="btn-primary py-2.5 px-4 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-bold"
              title="إرسال السؤال"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">إرسال</span>
            </button>
          </form>
          <p className="text-[11px] text-ink-500 text-center mt-2 flex items-center justify-center gap-1 font-medium">
            <span>دليل تفاعلي للوصول السريع لجميع خدمات وأقسام المنصة</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
