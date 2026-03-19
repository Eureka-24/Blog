import type { Article, ArticleRequest, Category, Tag, Comment, RegistrationCode, User } from '../types';

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

    // 处理空响应（如 DELETE 请求返回 204）
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
      return undefined as T;
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
  isWebApi: boolean = false
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': token } : {}),
  };
  return request<T>(endpoint, { ...options, headers }, isWebApi);
}

// Admin API 方法
export const adminApi = {
  // 认证
  auth: {
    login: (data: { username: string; password: string }) => request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      data,
    }),
    getCurrentUser: () => requestWithAuth<any>('/api/auth/me'),
    logout: () => requestWithAuth<void>('/api/auth/logout', { method: 'POST' }),
  },
  
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
  
  // 评论管理
  comments: {
    getAll: () => request<Comment[]>('/api/admin/comments'),
    getByArticle: (articleId: number) => request<Comment[]>(`/api/admin/comments/article/${articleId}`),
    delete: (id: number) => request<void>(`/api/admin/comments/${id}`, {
      method: 'DELETE',
    }),
    reply: (parentId: number, data: Partial<Comment>) => request<Comment>(`/api/admin/comments/${parentId}/reply`, {
      method: 'POST',
      data,
    }),
  },

  // 注册码管理
  registrationCodes: {
    getAll: () => requestWithAuth<RegistrationCode[]>('/api/admin/registration-codes'),
    generate: (data: { type: number; expireHours: number }) => requestWithAuth<RegistrationCode>('/api/admin/registration-codes', {
      method: 'POST',
      data,
    }),
    delete: (id: number) => requestWithAuth<void>(`/api/admin/registration-codes/${id}`, {
      method: 'DELETE',
    }),
  },

  // 用户管理
  users: {
    getAll: () => requestWithAuth<User[]>('/api/admin/users'),
    create: (data: Partial<User> & { password: string }) => requestWithAuth<User>('/api/admin/users', {
      method: 'POST',
      data,
    }),
    updateStatus: (id: number, status: number) => requestWithAuth<User>(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      data: { status },
    }),
    delete: (id: number) => requestWithAuth<void>(`/api/admin/users/${id}`, {
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
