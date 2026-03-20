import type { Article, ArticleRequest, Category, Tag, Comment, RegistrationCode, User, Image, PageResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
const WEB_API_URL = import.meta.env.VITE_WEB_API_URL || 'http://localhost:8080';

/**
 * 获取完整的图片URL
 * 如果是相对路径（以/开头），则添加API基础URL
 */
export function getImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
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
    // 如果是 FormData，不要设置 Content-Type，让浏览器自动设置
    if (data instanceof FormData) {
      config.body = data;
      // 删除 Content-Type 头，让浏览器自动设置 multipart boundary
      delete (config.headers as Record<string, string>)['Content-Type'];
    } else {
      config.body = JSON.stringify(data);
    }
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
    getAll: (page: number = 1, size: number = 10, categoryId?: number, tagId?: number) => {
      let url = `/api/admin/articles?page=${page}&size=${size}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (tagId) url += `&tagId=${tagId}`;
      return requestWithAuth<PageResponse<Article>>(url);
    },
    getById: (id: number) => requestWithAuth<Article>(`/api/admin/articles/${id}`),
    create: (data: ArticleRequest) => requestWithAuth<Article>('/api/admin/articles', {
      method: 'POST',
      data,
    }),
    update: (id: number, data: ArticleRequest) => requestWithAuth<Article>(`/api/admin/articles/${id}`, {
      method: 'PUT',
      data,
    }),
    delete: (id: number) => requestWithAuth<void>(`/api/admin/articles/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // 分类管理
  categories: {
    getAll: () => requestWithAuth<Category[]>('/api/admin/categories'),
    create: (data: Partial<Category>) => requestWithAuth<Category>('/api/admin/categories', {
      method: 'POST',
      data,
    }),
    update: (id: number, data: Partial<Category>) => requestWithAuth<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      data,
    }),
    delete: (id: number) => requestWithAuth<void>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // 标签管理
  tags: {
    getAll: () => requestWithAuth<Tag[]>('/api/admin/tags'),
    create: (data: Partial<Tag>) => requestWithAuth<Tag>('/api/admin/tags', {
      method: 'POST',
      data,
    }),
    update: (id: number, data: Partial<Tag>) => requestWithAuth<Tag>(`/api/admin/tags/${id}`, {
      method: 'PUT',
      data,
    }),
    delete: (id: number) => requestWithAuth<void>(`/api/admin/tags/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // 评论管理
  comments: {
    getAll: (page: number = 1, size: number = 10) => 
      requestWithAuth<PageResponse<Comment>>(`/api/admin/comments?page=${page}&size=${size}`),
    getByArticle: (articleId: number) => requestWithAuth<Comment[]>(`/api/admin/comments/article/${articleId}`),
    delete: (id: number) => requestWithAuth<void>(`/api/admin/comments/${id}`, {
      method: 'DELETE',
    }),
    reply: (parentId: number, data: Partial<Comment>) => requestWithAuth<Comment>(`/api/admin/comments/${parentId}/reply`, {
      method: 'POST',
      data,
    }),
  },

  // 注册码管理
  registrationCodes: {
    getAll: (page: number = 1, size: number = 10) => 
      requestWithAuth<PageResponse<RegistrationCode>>(`/api/admin/registration-codes?page=${page}&size=${size}`),
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
    getAll: (page: number = 1, size: number = 10) => 
      requestWithAuth<PageResponse<User>>(`/api/admin/users?page=${page}&size=${size}`),
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

  // 图片管理
  images: {
    upload: (file: File, articleId?: number) => {
      const formData = new FormData();
      formData.append('file', file);
      if (articleId) {
        formData.append('articleId', articleId.toString());
      }
      return requestWithAuth<Image>('/api/admin/images/upload', {
        method: 'POST',
        data: formData,
        headers: {}, // 让浏览器自动设置 Content-Type with boundary
      });
    },
    getByArticle: (articleId: number) => requestWithAuth<Image[]>(`/api/admin/images?articleId=${articleId}`),
    delete: (id: number) => requestWithAuth<void>(`/api/admin/images/${id}`, {
      method: 'DELETE',
    }),
    getUrl: (id: number) => requestWithAuth<{ url: string }>(`/api/admin/images/${id}/url`),
    getThumbnailUrl: (id: number) => requestWithAuth<{ url: string }>(`/api/admin/images/${id}/thumbnail`),
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
