import { supabase } from '../supabase';
import { Prompt, PromptFilters, PromptInsert, PromptUpdate } from '@/types/prompt';

// ========================================
// 프롬프트 조회 (필터링 + 정렬)
// ========================================

export async function getPrompts(
  filters?: PromptFilters, 
  sortBy: 'latest' | 'oldest' = 'latest'
) {
  let query = supabase
    .from('prompts')
    .select('*', { count: 'exact' });

  // 필터 적용
  if (filters?.model && filters.model !== 'Model') {
    query = query.eq('model', filters.model);
  }

  if (filters?.category && filters.category !== 'Category') {
    query = query.eq('category', filters.category);
  }

  if (filters?.form && filters.form !== 'Form') {
    const formValue = filters.form === '자연어' ? 'natural' 
                    : filters.form === 'Query' ? 'query' 
                    : filters.form === 'JSON' ? 'json' 
                    : filters.form;
    query = query.eq('form', formValue);
  }

  // 검색 (제목, 설명, 태그)
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`
    );
  }

  // 정렬
  query = query.order('created_at', { ascending: sortBy === 'oldest' });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching prompts:', error);
    throw error;
  }

  return {
    data: data as Prompt[],
    count: count || 0,
  };
}

// ========================================
// 단일 프롬프트 조회
// ========================================

export async function getPrompt(id: string) {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching prompt:', error);
    throw error;
  }

  return data as Prompt;
}

// ========================================
// 프롬프트 생성
// ========================================

export async function createPrompt(prompt: PromptInsert) {
  const { data, error } = await supabase
    .from('prompts')
    .insert([prompt])
    .select()
    .single();

  if (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }

  return data as Prompt;
}

// ========================================
// 프롬프트 수정
// ========================================

export async function updatePrompt(id: string, updates: PromptUpdate) {
  const { data, error } = await supabase
    .from('prompts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }

  return data as Prompt;
}

// ========================================
// 프롬프트 삭제
// ========================================

export async function deletePrompt(id: string) {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }

  return { success: true };
}

// ========================================
// 좋아요 증가
// ========================================

export async function incrementLikes(id: string) {
  const { error } = await supabase.rpc('increment_likes', {
    prompt_id: id,
  });

  if (error) {
    console.error('Error incrementing likes:', error);
    throw error;
  }

  return { success: true };
}

// ========================================
// 좋아요 감소
// ========================================

export async function decrementLikes(id: string) {
  const { error } = await supabase.rpc('decrement_likes', {
    prompt_id: id,
  });

  if (error) {
    console.error('Error decrementing likes:', error);
    throw error;
  }

  return { success: true };
}

// ========================================
// 조회수 증가
// ========================================

export async function incrementViews(id: string) {
  const { error } = await supabase.rpc('increment_views', {
    prompt_id: id,
  });

  if (error) {
    console.error('Error incrementing views:', error);
    throw error;
  }

  return { success: true };
}

// ========================================
// 통계 조회
// ========================================

export async function getStats() {
  // 전체 프롬프트 수
  const { count: totalPrompts } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true });

  // 카테고리 수
  const { data: categories } = await supabase
    .from('prompts')
    .select('category');
  
  const uniqueCategories = new Set(categories?.map(c => c.category) || []);

  // 총 좋아요 수
  const { data: likesData } = await supabase
    .from('prompts')
    .select('likes');
  
  const totalLikes = likesData?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0;

  return {
    totalPrompts: totalPrompts || 0,
    categories: uniqueCategories.size,
    likes: totalLikes,
  };
}
