'use client';

import { useState, useEffect, Suspense } from 'react';
import { articleApi, categoryApi, tagApi } from '@/lib/api';
import type { Article, Category, Tag, PageResponse } from '@/types';
import { useAuth } from '@/hooks';
import { Header, Footer } from '@/components/layout';
import { ArticleList, Sidebar, Pagination } from '@/components/home';
import { Loading, ErrorState } from '@/components/common';
import LoginModal from '@/components/LoginModal';

function HomeContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Article> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [filterTag, setFilterTag] = useState<number | null>(null);
  
  // 使用 useAuth Hook 管理登录状态
  const { 
    currentUser, 
    showLoginModal, 
    setShowLoginModal, 
    handleLoginSuccess, 
    handleLogout 
  } = useAuth();

  // 加载数据
  const fetchData = async (page: number = 1, categoryId?: number, tagId?: number) => {
    try {
      setLoading(true);
      const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
        articleApi.getArticles(page, pageSize, categoryId, tagId),
        categoryApi.getCategories(),
        tagApi.getTags(),
      ]);

      setArticles(articlesRes.records || []);
      setPageData(articlesRes);
      setCategories(categoriesRes || []);
      setTags(tagsRes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 分页切换
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page, filterCategory || undefined, filterTag || undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 分类筛选
  const handleCategoryClick = (categoryId: number | null) => {
    setFilterCategory(categoryId);
    setFilterTag(null);
    setCurrentPage(1);
    fetchData(1, categoryId || undefined, undefined);
  };

  // 标签筛选
  const handleTagClick = (tagId: number | null) => {
    setFilterTag(tagId);
    setFilterCategory(null);
    setCurrentPage(1);
    fetchData(1, undefined, tagId || undefined);
  };

  // 清除筛选
  const handleClearFilter = () => {
    setFilterCategory(null);
    setFilterTag(null);
    setCurrentPage(1);
    fetchData(1);
  };

  if (loading) {
    return <Loading fullScreen size="lg" message="加载中..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        showBackLink={false}
        additionalInfo="请确保后端服务已启动"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧文章列表 */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">最新文章</h1>
            <ArticleList articles={articles} />
            {pageData && (
              <Pagination
                currentPage={pageData.current}
                totalPages={pageData.pages}
                total={pageData.total}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* 右侧边栏 */}
          <Sidebar
            categories={categories}
            tags={tags}
            filterCategory={filterCategory}
            filterTag={filterTag}
            onCategoryClick={handleCategoryClick}
            onTagClick={handleTagClick}
            onClearFilter={handleClearFilter}
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

export default function Home() {
  return (
    <Suspense fallback={<Loading fullScreen size="lg" message="加载中..." />}>
      <HomeContent />
    </Suspense>
  );
}
