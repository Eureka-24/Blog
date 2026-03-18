'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { articleApi } from '@/lib/api';
import type { Article } from '@/types';

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        console.log('Fetching article with slug:', slug);
        
        if (!slug) {
          setError('缺少文章标识符');
          return;
        }
        
        const data = await articleApi.getArticle(slug);
        console.log('Article data:', data);
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
        const errorMsg = err instanceof Error ? err.message : '加载失败';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error || '文章不存在'}</div>
          <p className="text-gray-600 mb-4">Slug: {slug || '无'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            返回首页 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← 返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow overflow-hidden">
          {/* 封面图 */}
          {article.coverImage && (
            <div className="relative h-64 sm:h-96 bg-gray-200">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 文章内容 */}
          <div className="p-6 sm:p-8">
            {/* 文章元信息 */}
            <div className="flex items-center gap-3 mb-4">
              {article.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {article.category.name}
                </span>
              )}
              <span className="text-sm text-gray-500">
                {new Date(article.createTime).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="text-sm text-gray-500">
                👁 {article.viewCount} 次阅读
              </span>
            </div>

            {/* 标题 */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* 标签 */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* 文章内容 */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* 分享区域 */}
            <div className="border-t mt-8 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">分享到：</span>
                <div className="flex gap-4">
                  <button className="text-blue-600 hover:text-blue-700">
                    微信
                  </button>
                  <button className="text-blue-400 hover:text-blue-500">
                    微博
                  </button>
                  <button className="text-green-600 hover:text-green-700">
                    朋友圈
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* 上一篇/下一篇 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-white rounded-lg shadow p-4 text-left hover:shadow-md transition-shadow disabled:opacity-50" disabled>
            <span className="text-sm text-gray-500">上一篇</span>
            <p className="text-gray-900 font-medium truncate">暂无</p>
          </button>
          <button className="bg-white rounded-lg shadow p-4 text-left hover:shadow-md transition-shadow disabled:opacity-50" disabled>
            <span className="text-sm text-gray-500">下一篇</span>
            <p className="text-gray-900 font-medium truncate">暂无</p>
          </button>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2026 我的博客。All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
