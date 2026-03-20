import type { Article, Category, Tag, PageResponse, Comment, User, SearchResult } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8081';

/**
 * 获取完整的图片URL
 * 如果是相对路径（以/开头），则添加API基础URL
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // 如果已经是完整URL（http/https），直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // 如果是相对路径，添加API基础URL
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}

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

// 带认证的请求函数
export async function requestWithAuth<T>(
  endpoint: string,
  options: RequestOptions = {},
  isAdminApi: boolean = false
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': token } : {}),
  };
  return request<T>(endpoint, { ...options, headers }, isAdminApi);
}

// 认证 API
export const authApi = {
  login: (data: { username: string; password: string }) => request<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    data,
  }, true),
  getCurrentUser: () => requestWithAuth<User>('/api/auth/me', {}, true),
  logout: () => requestWithAuth<void>('/api/auth/logout', { method: 'POST' }, true),
};

// Web API 方法
export const articleApi = {
  // 获取文章列表（分页）
  getArticles: (page: number = 1, size: number = 10, categoryId?: number, tagId?: number) => {
    let url = `/api/articles?page=${page}&size=${size}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (tagId) url += `&tagId=${tagId}`;
    return request<PageResponse<Article>>(url);
  },
  
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

// 评论 API
export const commentApi = {
  // 获取文章评论
  getByArticle: (articleId: number) => request<Comment[]>(`/api/comments/article/${articleId}`),
  
  // 提交评论
  create: (data: Partial<Comment>) => request<Comment>('/api/comments', {
    method: 'POST',
    data,
  }),
};

// 注册 API
export const registerApi = {
  register: (data: {
    username: string;
    password: string;
    email: string;
    nickname: string;
    registrationCode: string;
  }) => request<{
    success: boolean;
    message: string;
    userId?: number;
  }>('/api/register', {
    method: 'POST',
    data,
  }),
};

// Search API
export const searchApi = {
  // Search articles
  search: (query: string, page: number = 1, size: number = 10) => {
    return request<SearchResult>(`/api/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  },
};
