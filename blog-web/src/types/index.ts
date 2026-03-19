/**
 * 数据类型定义
 */

export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: number; // 0:普通用户 1:管理员
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string | null;
  categoryId: number;
  category?: Category;
  tags?: Tag[];
  status: number;
  viewCount: number;
  createTime: string;
  updateTime: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number | null;
  createTime: string;
  updateTime: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createTime: string;
}

export interface Comment {
  id: number;
  articleId: number;
  parentId?: number | null;
  rootId?: number | null;  // 根评论 ID
  authorName: string;
  authorEmail?: string | null;
  authorWebsite?: string | null;
  content: string;
  ip?: string | null;
  userAgent?: string | null;
  children?: Comment[];
  createTime: string;
}

export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}
