'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { articleFormSchema } from '../schemas/article.schema'
import type {
  CreateArticleInput,
  UpdateArticleInput,
  ArticleActionResult,
} from '../types'

const BUCKET_NAME = 'lesson-media'

function revalidateAllArticlePaths() {
  revalidatePath('/supervisor/articles')
  revalidatePath('/student/articles')
  revalidatePath('/teacher/articles')
  revalidatePath('/counselor/articles')
}

export async function createArticleAction(
  input: CreateArticleInput
): Promise<ArticleActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    // Verify role is supervisor or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (
      !profile ||
      (profile.role !== 'supervisor' && profile.role !== 'admin')
    ) {
      return {
        success: false,
        message: 'هذه العملية مخصصة للمشرفين التربويين وإدارة النظام فقط',
      }
    }

    const validated = articleFormSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات المنشور غير صالحة',
      }
    }

    const { title, content, category, image_path, pdf_path } = validated.data

    const { data: newArticle, error } = await supabase
      .from('articles')
      .insert({
        author_id: user.id,
        title,
        content,
        category: category || 'خبر',
        image_path: image_path || null,
        pdf_path: pdf_path || null,
      })
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          full_name,
          role
        )
      `)
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return {
        success: false,
        message: 'حدث خطأ أثناء نشر المقال/الخبر. يرجى المحاولة ثانية.',
      }
    }

    let imageUrl: string | null = null
    let pdfUrl: string | null = null

    if (newArticle.image_path) {
      const { data: signedImg } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(newArticle.image_path, 3600 * 24)
      imageUrl = signedImg?.signedUrl ?? null
    }

    if (newArticle.pdf_path) {
      const { data: signedPdf } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(newArticle.pdf_path, 3600 * 24)
      pdfUrl = signedPdf?.signedUrl ?? null
    }

    revalidateAllArticlePaths()

    return {
      success: true,
      message: 'تم نشر المنشور بنجاح في المنصة',
      article: {
        ...newArticle,
        imageUrl,
        pdfUrl,
      },
    }
  } catch (err) {
    console.error('Unexpected error creating article:', err)
    return { success: false, message: 'حدث خطأ غير متوقع' }
  }
}

export async function updateArticleAction(
  input: UpdateArticleInput
): Promise<ArticleActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (
      !profile ||
      (profile.role !== 'supervisor' && profile.role !== 'admin')
    ) {
      return {
        success: false,
        message: 'هذه العملية مخصصة للمشرفين التربويين وإدارة النظام فقط',
      }
    }

    const validated = articleFormSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات التعديل غير صالحة',
      }
    }

    const { title, content, category, image_path, pdf_path } = validated.data

    const { data: updatedArticle, error } = await supabase
      .from('articles')
      .update({
        title,
        content,
        category: category || 'خبر',
        image_path: image_path || null,
        pdf_path: pdf_path || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          full_name,
          role
        )
      `)
      .single()

    if (error) {
      console.error('Error updating article:', error)
      return { success: false, message: 'تعذر تعديل المنشور' }
    }

    let imageUrl: string | null = null
    let pdfUrl: string | null = null

    if (updatedArticle.image_path) {
      const { data: signedImg } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(updatedArticle.image_path, 3600 * 24)
      imageUrl = signedImg?.signedUrl ?? null
    }

    if (updatedArticle.pdf_path) {
      const { data: signedPdf } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(updatedArticle.pdf_path, 3600 * 24)
      pdfUrl = signedPdf?.signedUrl ?? null
    }

    revalidateAllArticlePaths()

    return {
      success: true,
      message: 'تم تحديث المنشور بنجاح',
      article: {
        ...updatedArticle,
        imageUrl,
        pdfUrl,
      },
    }
  } catch (err) {
    console.error('Unexpected error updating article:', err)
    return { success: false, message: 'حدث خطأ غير متوقع' }
  }
}

export async function deleteArticleAction(
  id: string
): Promise<ArticleActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (
      !profile ||
      (profile.role !== 'supervisor' && profile.role !== 'admin')
    ) {
      return { success: false, message: 'غير مصرح لك بحذف هذا المنشور' }
    }

    const { data: existing } = await supabase
      .from('articles')
      .select('id, image_path, pdf_path')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, message: 'المنشور غير موجود' }
    }

    // Clean up storage files if present
    const filesToRemove: string[] = []
    if (existing.image_path) filesToRemove.push(existing.image_path)
    if (existing.pdf_path) filesToRemove.push(existing.pdf_path)

    if (filesToRemove.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(filesToRemove)
    }

    const { error } = await supabase.from('articles').delete().eq('id', id)

    if (error) {
      console.error('Error deleting article:', error)
      return { success: false, message: 'تعذر حذف المنشور' }
    }

    revalidateAllArticlePaths()

    return { success: true, message: 'تم حذف المنشور بنجاح' }
  } catch (err) {
    console.error('Unexpected error deleting article:', err)
    return { success: false, message: 'حدث خطأ غير متوقع' }
  }
}
