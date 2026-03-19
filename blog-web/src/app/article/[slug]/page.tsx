'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { articleApi } from '@/lib/api';
import type { Article, User } from '@/types';
import { Footer } from '@/components/layout';
import { ArticleContent, CommentSection } from '@/components/article';
import LoginModal from '@/components/LoginModal';

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 登录状态
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // 登录成功回调
  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

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
        <ArticleContent article={article} />

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

        {/* 评论区 */}
        <div className="mt-12">
          <CommentSection 
            articleId={article.id} 
            currentUser={currentUser}
            onShowLogin={() => setShowLoginModal(true)}
          />
        </div>
      </main>

      <Footer />

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
