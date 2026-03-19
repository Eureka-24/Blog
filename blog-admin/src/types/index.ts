/**
 * 数据类型定义
 */

export interface Article {
  id?: number;
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  coverImage?: string | null;
  categoryId?: number;
  category?: Category;
  tags?: Tag[];
  status?: number;
  viewCount?: number;
  createTime?: string;
  updateTime?: string;
}

export interface ArticleRequest {
  article: Partial<Article>;
  tagIds?: number[];
}

export interface Category {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  createTime?: string;
  updateTime?: string;
}

export interface Tag {
  id?: number;
  name: string;
  slug?: string;
  createTime?: string;
}

export interface Comment {
  id?: number;
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
  createTime?: string;
  article?: Article;
}

export interface RegistrationCode {
  id?: number;
  code: string;
  type: number; // 0:普通用户码 1:管理员码
  expireTime: string;
  isUsed: boolean;
  usedBy?: number;
  usedTime?: string;
  createTime?: string;
  updateTime?: string;
}

export interface User {
  id?: number;
  username: string;
  password?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  role: number; // 0:普通用户 1:管理员
  status: number; // 0:禁用 1:启用
  createTime?: string;
  updateTime?: string;
}

export interface Image {
  id?: number;
  articleId?: number;
  originalName: string;
  fileName: string;
  filePath?: string;
  thumbnailPath?: string;
  fileSize: number;
  mimeType?: string;
  width?: number;
  height?: number;
  url?: string;
  thumbnailUrl?: string;
  createTime?: string;
}
