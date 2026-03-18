import type { Article, Category, Tag, PageResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8081';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  isAdminApi: boolean = false
): Promise<T> {
  const baseUrl = isAdminApi ? ADMIN_API_URL : API_BASE_URL;
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

// Web API 方法
export const articleApi = {
  // 获取文章列表（分页）
  getArticles: (page: number = 1, size: number = 10) => 
    request<PageResponse<Article>>(`/api/articles?page=${page}&size=${size}`),
  
  // 获取文章详情
  getArticle: (slug: string) => request<Article>(`/api/articles/${slug}`),
  
  // 获取热门文章
  getHotArticles: (limit: number = 5) => request<Article[]>(`/api/articles/hot?limit=${limit}`),
  
  // 按标签获取文章
  getArticlesByTag: (tagId: number) => request<Article[]>(`/api/articles/tag/${tagId}`),
};

export const categoryApi = {
  // 获取分类列表
  getCategories: () => request<Category[]>('/api/categories'),
};

export const tagApi = {
  // 获取标签列表
  getTags: () => request<Tag[]>('/api/tags'),
};
