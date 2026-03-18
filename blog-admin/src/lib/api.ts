import type { Article, ArticleRequest, Category, Tag } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
const WEB_API_URL = import.meta.env.VITE_WEB_API_URL || 'http://localhost:8080';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  isWebApi: boolean = false
): Promise<T> {
  const baseUrl = isWebApi ? WEB_API_URL : API_BASE_URL;
  const url = `${baseUrl}${endpoint}`;

  const { method = 'GET', data, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Admin API 方法
export const adminApi = {
  // 文章管理
  articles: {
    getAll: () => request<Article[]>('/api/admin/articles'),
    getById: (id: number) => request<Article>(`/api/admin/articles/${id}`),
    create: (data: ArticleRequest) => request<Article>('/api/admin/articles', {
      method: 'POST',
      data,
    }),
    update: (id: number, data: ArticleRequest) => request<Article>(`/api/admin/articles/${id}`, {
      method: 'PUT',
      data,
    }),
    delete: (id: number) => request<void>(`/api/admin/articles/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // 分类管理
  categories: {
    getAll: () => request<Category[]>('/api/admin/categories'),
    create: (data: Partial<Category>) => request<Category>('/api/admin/categories', {
      method: 'POST',
      data,
    }),
    update: (id: number, data: Partial<Category>) => request<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      data,
    }),
    delete: (id: number) => request<void>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // 标签管理
  tags: {
    getAll: () => request<Tag[]>('/api/admin/tags'),
    create: (data: Partial<Tag>) => request<Tag>('/api/admin/tags', {
      method: 'POST',
      data,
    }),
    update: (id: number, data: Partial<Tag>) => request<Tag>(`/api/admin/tags/${id}`, {
      method: 'PUT',
      data,
    }),
    delete: (id: number) => request<void>(`/api/admin/tags/${id}`, {
      method: 'DELETE',
    }),
  },
};

// Web API 方法（用于预览等）
export const webApi = {
  articles: {
    getAll: () => request<Article[]>('/api/articles', {}, true),
    getById: (id: number) => request<Article>(`/api/articles/${id}`, {}, true),
  },
  categories: {
    getAll: () => request<Category[]>('/api/categories', {}, true),
  },
  tags: {
    getAll: () => request<Tag[]>('/api/tags', {}, true),
  },
};
