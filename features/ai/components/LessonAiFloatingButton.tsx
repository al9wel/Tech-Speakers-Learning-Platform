'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Bot,
  FileText,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  FileCheck2,
  Zap,
} from 'lucide-react'
import { LessonAiAssistantModal } from './LessonAiAssistantModal'
import type { LessonContentPayload, AiAssistantMode } from '../types'

interface LessonAiWrapperProps {
  lessonData: LessonContentPayload
}

/**
 * Modern Floating Action Button (FAB)
 * Sleek, glassmorphic, warm ivory & gold styling with subtle pulse.
 */
export function LessonAiFloatingButton({ lessonData }: LessonAiWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AiAssistantMode>('chat')

  const openWithMode = (m: AiAssistantMode) => {
    setMode(m)
    setIsOpen(true)
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 left-6 z-40 group">
        <button
          onClick={() => openWithMode('chat')}
          className="relative flex items-center gap-3 p-2 pr-4 pl-2 rounded-full bg-white/95 backdrop-blur-md text-ink-900 shadow-xl hover:shadow-2xl border border-gold/40 hover:border-gold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="المعلم الذكي للدرس"
        >
          {/* Subtle glowing ambient pulse */}
          <span className="absolute -inset-1 rounded-full bg-linear-to-r from-gold/30 to-gold-light/40 blur-xs opacity-60 group-hover:opacity-100 transition animate-pulse pointer-events-none" />

          {/* Text Labels */}
          <div className="relative flex flex-col text-right leading-tight select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-heading font-extrabold text-ink-900">
                المعلم الذكي
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
            </div>
            <span className="text-[10px] text-gold-dark font-medium">
              اسأل عن محتوى الدرس
            </span>
          </div>

          {/* Glowing Icon Avatar */}
          <div className="relative w-9 h-9 rounded-full bg-linear-to-tr from-gold to-gold-dark flex items-center justify-center text-white shrink-0 shadow-md shadow-gold/25 group-hover:rotate-6 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* The AI Modal */}
      <LessonAiAssistantModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        lessonData={lessonData}
        initialMode={mode}
      />
    </>
  )
}

/**
 * In-Page AI Lesson Hero Card
 * Elegant, light-themed premium card seamlessly integrated into the lesson page.
 */
export function LessonAiBanner({ lessonData }: LessonAiWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AiAssistantMode>('chat')

  const openWithMode = (m: AiAssistantMode) => {
    setMode(m)
    setIsOpen(true)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white via-cream/50 to-gold/10 p-6 sm:p-7 shadow-card border border-gold/30 hover:border-gold/50 transition-all duration-300 mb-8">
        {/* Soft background ambient blurs */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-sage/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Main Info */}
          <div className="flex items-start gap-4">
            <div className="relative w-13 h-13 rounded-2xl bg-linear-to-tr from-gold via-gold-dark to-gold text-white flex items-center justify-center shadow-lg shadow-gold/25 shrink-0 mt-0.5">
              <Bot className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-ink-900 leading-snug">
                  المعلم والمساعد الذكي لهذا الدرس
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Powered</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>متصل بالدرس</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-2xl">
                اطرح أي استفسار حول هذا الدرس ليجيبك الذكاء الاصطناعي حصرياً من محتواه وملفات الـ PDF المرفقة، أو استخرج ملخصاً سريعاً واختبر فهمك بكويز تفاعلي فوري.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-ink-500 font-medium">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                  <span>إجابات مقيدة بالدرس فقط</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-gold-dark" />
                  <span>قراءة ذكية لملفات الـ PDF</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-gold" />
                  <span>تصحيح وتقييم فوري</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto self-stretch lg:self-center shrink-0">
            <button
              onClick={() => openWithMode('chat')}
              className="flex-1 lg:flex-initial btn-gold text-xs sm:text-sm py-2.5 px-4 font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>اسأل المعلم الذكي</span>
            </button>

            <button
              onClick={() => openWithMode('summary')}
              className="flex-1 lg:flex-initial py-2.5 px-3.5 rounded-xl bg-white hover:bg-gold/10 text-ink-800 text-xs sm:text-sm font-semibold border border-ink-200 hover:border-gold/60 transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <FileText className="w-4 h-4 text-gold-dark" />
              <span>ملخص فوري</span>
            </button>

            <button
              onClick={() => openWithMode('quiz')}
              className="flex-1 lg:flex-initial py-2.5 px-3.5 rounded-xl bg-white hover:bg-sage-50 text-ink-800 text-xs sm:text-sm font-semibold border border-ink-200 hover:border-sage transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <HelpCircle className="w-4 h-4 text-sage" />
              <span>كويز تفاعلي</span>
            </button>
          </div>
        </div>
      </div>

      {/* The AI Modal */}
      <LessonAiAssistantModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        lessonData={lessonData}
        initialMode={mode}
      />
    </>
  )
}
