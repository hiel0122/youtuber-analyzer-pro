export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  model: string;
  category: string;
  form: 'natural' | 'query' | 'json';
  tags: string[];
  imageUrl?: string;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  author_name?: string;
}

export interface PromptFilters {
  model?: string;
  category?: string;
  form?: string;
  search?: string;
}

export interface PromptsResponse {
  data: Prompt[];
  count: number;
  error?: string;
}

export type PromptInsert = Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'likes' | 'views'>;

export type PromptUpdate = Partial<PromptInsert>;
