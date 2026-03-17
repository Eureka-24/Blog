/**
 * API 请求工具类
 */

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
  // 获取文章列表
  getArticles: () => request('/api/articles'),
  
  // 获取文章详情
  getArticle: (id: number) => request(`/api/articles/${id}`),
  
  // 获取分类列表
  getCategories: () => request('/api/categories'),
  
  // 获取标签列表
  getTags: () => request('/api/tags'),
};

// Admin API 方法
export const adminArticleApi = {
  // 获取所有文章（管理端）
  getArticles: () => request('/api/admin/articles', {}, true),
  
  // 创建文章
  createArticle: (data: any) => request('/api/admin/articles', {
    method: 'POST',
    data,
  }, true),
  
  // 更新文章
  updateArticle: (id: number, data: any) => request(`/api/admin/articles/${id}`, {
    method: 'PUT',
    data,
  }, true),
  
  // 删除文章
  deleteArticle: (id: number) => request(`/api/admin/articles/${id}`, {
    method: 'DELETE',
  }, true),
};
