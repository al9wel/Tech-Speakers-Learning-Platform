'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Compass,
  CheckCircle2,
  Target,
  BookOpen,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Award,
} from 'lucide-react'

import type { StudentLearningInsightsData, StudentInsightsResponse } from '../types'

const CACHE_KEY = 'tech_speakers_student_insights'
const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours cache

interface CachedInsights {
  timestamp: number
  data: StudentLearningInsightsData
}

export function StudentAiInsightsCard() {
  const [insights, setInsights] = useState<StudentLearningInsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async (forceRefresh = false) => {
    // 1. Check local cache first if not force-refreshing
    if (!forceRefresh) {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY)
        if (cachedRaw) {
          const cached: CachedInsights = JSON.parse(cachedRaw)
          const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS
          if (isFresh && cached.data?.focusRecommendation) {
            setInsights(cached.data)
            setIsLoading(false)
            return
          }
        }
      } catch {
        // Ignore cache parse error
      }
    }

    if (forceRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const res = await fetch('/api/ai/student-insights')
      const json: StudentInsightsResponse = await res.json()

      if (json.success && json.insights) {
        setInsights(json.insights)
        try {
          const cachePayload: CachedInsights = {
            timestamp: Date.now(),
            data: json.insights,
          }
          localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload))
        } catch {
          // Ignore localStorage storage failure
        }
      } else {
        setError(json.error || 'تعذر جلب التوصيات الذكية.')
      }
    } catch {
      setError('تعذر الاتصال بخدمة التحليل الذكي.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  // Solid Loading Skeleton (no transparency)
  if (isLoading) {
    return (
      <div className="bg-white border-2 border-[#E6DAC4] rounded-2xl p-5 sm:p-6 shadow-sm mb-8 animate-pulse">
        <div className="flex items-center justify-between mb-4 border-b border-[#F0E8DC] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFE7D8]" />
            <div className="space-y-2">
              <div className="h-4 w-44 bg-[#EFE7D8] rounded-md" />
              <div className="h-3 w-32 bg-[#EFE7D8] rounded-md" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-[#FAF7F0] rounded-xl border border-[#E8DEC8]" />
          <div className="h-32 bg-[#FAF7F0] rounded-xl border border-[#E8DEC8]" />
          <div className="h-32 bg-[#FAF7F0] rounded-xl border border-[#E8DEC8]" />
        </div>
      </div>
    )
  }

  // Error State with Solid Background
  if (error || !insights) {
    return (
      <div className="bg-white border-2 border-[#E6DAC4] rounded-2xl p-5 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5EFE3] text-gold-dark flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-gold-dark" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-ink-900">
              مرشد المذاكرة
            </h3>

            <p className="text-xs text-ink-600 mt-0.5">
              {error || 'اضغط على زر التحديث لتوليد خطتك الدراسية والتحدي اليومي.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchInsights(true)}
          disabled={isRefreshing}
          className="btn-outline text-xs py-2 px-4 flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 bg-white hover:bg-[#FAF7F0]"
        >
          {isRefreshing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-gold-dark" />
          )}
          <span>توليد التوصيات</span>
        </button>
      </div>
    )
  }

  // Active Insights Card - 100% Solid Opaque Backgrounds & Crisp Contrast
  return (
    <div className="bg-white border-2 border-[#E4D7BF] rounded-2xl p-5 sm:p-6 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-[#EFE7D8] pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F6EFE2] border border-[#DEC498] flex items-center justify-center text-gold-dark shadow-2xs shrink-0">
            <Compass className="w-5 h-5 text-gold-dark" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-ink-900">
                مرشد المذاكرة والتوصيات الدراسية
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-[#F4ECDC] text-gold-dark text-[11px] font-bold border border-[#DEC498]">
                خطة موجهة
              </span>
            </div>
            <p className="text-xs text-ink-600 mt-0.5">
              توجيهات مخصصة مبنية على المناهج والمقررات لدعم تفوقك
            </p>
          </div>
        </div>


        <button
          type="button"
          onClick={() => fetchInsights(true)}
          disabled={isRefreshing}
          className="self-start sm:self-auto btn-outline text-xs py-1.5 px-3 bg-white hover:bg-[#FAF7F0] text-ink-800 flex items-center gap-1.5 rounded-xl border border-[#DEC498] shadow-2xs transition cursor-pointer shrink-0"
          title="تحديث التوصيات بناءً على أحدث بيانات المناهج"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-gold-dark ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="font-bold">{isRefreshing ? 'جاري التحليل...' : 'تحديث التوصيات'}</span>
        </button>
      </div>

      {/* Grid of 3 Insights - Responsive & Solid Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Focus Recommendation */}
        <div className="bg-[#FAF7F0] rounded-xl p-4 sm:p-5 border border-[#E5DAC4] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EFE4D0] text-gold-dark flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-gold-dark" />
              </div>
              <span className="font-heading font-bold text-xs sm:text-sm text-ink-900">
                التركيز المقترح اليوم
              </span>
            </div>
            <div className="mb-2">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-[#EBDDBF] text-ink-900 text-xs font-extrabold border border-[#DFC496]">
                {insights.focusRecommendation.subject}
              </span>
            </div>
            <p className="text-xs text-ink-700 leading-relaxed font-medium">
              {insights.focusRecommendation.reason}
            </p>
          </div>

          <div className="pt-3 mt-4 border-t border-[#EAE0CD]">
            <Link
              href="/student/subjects"
              className="text-xs font-bold text-gold-dark hover:text-ink-900 flex items-center gap-1 transition"
            >
              <span>فتح مادة {insights.focusRecommendation.subject}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Study Strategy */}
        <div className="bg-[#FAF7F0] rounded-xl p-4 sm:p-5 border border-[#E5DAC4] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EFE4D0] text-ink-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-ink-700" />
              </div>
              <span className="font-heading font-bold text-xs sm:text-sm text-ink-900">
                استراتيجية الاستذكار الفعّالة
              </span>
            </div>
            <p className="text-xs text-ink-700 leading-relaxed font-medium mt-1">
              {insights.studyStrategy}
            </p>
          </div>

          <div className="pt-3 mt-4 border-t border-[#EAE0CD]">
            <span className="text-[11px] text-ink-600 font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-gold-dark" />
              <span>استخدم "المعلم الذكي" داخل أي درس</span>
            </span>
          </div>
        </div>

        {/* 3. Daily Challenge */}
        <div className="bg-[#F5EFE0] rounded-xl p-4 sm:p-5 border-2 border-[#DFC496] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#E2EFD9] text-emerald-800 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-emerald-700" />
              </div>
              <span className="font-heading font-bold text-xs sm:text-sm text-ink-900">
                تحدي التفوق لليوم
              </span>
            </div>

            <p className="text-xs text-ink-900 font-semibold leading-relaxed mt-1">
              {insights.dailyChallenge}
            </p>
          </div>

          <div className="pt-3 mt-4 border-t border-[#E0D1B5]">
            <Link
              href="/student/subjects"
              className="btn-primary text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5 font-bold shadow-2xs"
            >
              <span>خوض التحدي الآن</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
