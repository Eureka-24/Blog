'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { articleApi } from '@/lib/api';
import type { Article } from '@/types';
import { useAuth } from '@/hooks';
import { Header, Footer } from '@/components/layout';
import { ArticleContent, CommentSection } from '@/components/article';
import { Loading, ErrorState } from '@/components/common';
import LoginModal from '@/components/LoginModal';

function ArticleContentPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用 useAuth Hook 管理登录状态
  const { 
    currentUser, 
    showLoginModal, 
    setShowLoginModal, 
    handleLoginSuccess, 
    handleLogout 
  } = useAuth();

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
    return <Loading fullScreen size="lg" message="加载中..." />;
  }

  if (error || !article) {
    return (
      <ErrorState 
        message={error || '文章不存在'}
        additionalInfo={`Slug: ${slug || '无'}`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onShowLogin={() => setShowLoginModal(true)}
      />

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

export default function ArticleDetail() {
  return (
    <Suspense fallback={<Loading fullScreen size="lg" message="加载中..." />}>
      <ArticleContentPage />
    </Suspense>
  );
}
