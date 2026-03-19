'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { articleApi, categoryApi, tagApi } from '@/lib/api';
import type { Article, Category, Tag, User } from '@/types';
import LoginModal from '@/components/LoginModal';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [filterTag, setFilterTag] = useState<number | null>(null);
  
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

  // 加载数据
  const fetchData = async (categoryId?: number, tagId?: number) => {
    try {
      setLoading(true);
      // 并行获取数据
      const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
        articleApi.getArticles(1, 10, categoryId, tagId),
        categoryApi.getCategories(),
        tagApi.getTags(),
      ]);

      setArticles(articlesRes.records || []);
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

  // 分类筛选
  const handleCategoryClick = (categoryId: number | null) => {
    setFilterCategory(categoryId);
    setFilterTag(null);
    fetchData(categoryId || undefined, undefined);
  };

  // 标签筛选
  const handleTagClick = (tagId: number | null) => {
    setFilterTag(tagId);
    setFilterCategory(null);
    fetchData(undefined, tagId || undefined);
  };

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <p className="text-gray-600">请确保后端服务已启动</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              我的博客
            </Link>
            <nav className="flex space-x-6 items-center">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                首页
              </Link>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                关于
              </a>
              {/* 管理员入口 - 仅管理员可见 */}
              {currentUser && currentUser.role === 1 && (
                <a 
                  href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173'} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  管理后台
                </a>
              )}
              {/* 用户状态 */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {currentUser.nickname || currentUser.username}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/register"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    注册
                  </Link>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    登录
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧文章列表 */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">最新文章</h1>
            
            {articles.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">暂无文章</p>
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    {article.coverImage && (
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {article.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.category.name}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {article.createTime ? new Date(article.createTime).toLocaleDateString('zh-CN') : '-'}
                        </span>
                        <span className="text-sm text-gray-500">
                          👁 {article.viewCount}
                        </span>
                      </div>
                      
                      <Link href={article.slug ? `/article/${article.slug}` : '#'} 
                            onClick={(e) => !article.slug && e.preventDefault()}>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {article.title}
                        </h2>
                      </Link>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.summary || article.content.substring(0, 200)}...
                      </p>
                      
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <Link
                        href={article.slug ? `/article/${article.slug}` : '#'}
                        className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          if (!article.slug) {
                            e.preventDefault();
                            alert('文章暂无详情页面');
                          }
                        }}
                      >
                        阅读全文 →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* 右侧边栏 */}
          <aside className="space-y-6">
            {/* 当前筛选 */}
            {(filterCategory || filterTag) && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    筛选：{filterCategory ? categories.find(c => c.id === filterCategory)?.name : tags.find(t => t.id === filterTag)?.name}
                  </span>
                  <button
                    onClick={() => { setFilterCategory(null); setFilterTag(null); fetchData(); }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    清除
                  </button>
                </div>
              </div>
            )}

            {/* 分类 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">分类</h2>
              {categories.length === 0 ? (
                <p className="text-gray-500">暂无分类</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => handleCategoryClick(category.id!)}
                        className={`flex justify-between items-center w-full text-left ${
                          filterCategory === category.id ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500">
                          {category.description || ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 标签 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">标签</h2>
              {tags.length === 0 ? (
                <p className="text-gray-500">暂无标签</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.id!)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        filterTag === tag.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2026 我的博客。All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
