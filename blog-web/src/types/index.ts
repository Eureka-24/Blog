/**
 * 数据类型定义
 */

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

export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}
