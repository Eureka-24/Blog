'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { articleApi, commentApi } from '@/lib/api';
import type { Article, Comment } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
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
        
        // 加载评论
        if (data && data.id) {
          const commentsData = await commentApi.getByArticle(data.id);
          setComments(commentsData || []);
        }
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
                {article.createTime ? new Date(article.createTime).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : '-'}
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
            <div className="prose prose-lg max-w-none markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content || ''}
              </ReactMarkdown>
            </div>

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

        {/* 评论区 */}
        <div className="mt-12">
          <CommentSection 
            articleId={article.id} 
            comments={comments} 
            setComments={setComments} 
          />
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

// 评论区组件
interface CommentSectionProps {
  articleId: number;
  comments: Comment[];
  setComments: (comments: Comment[]) => void;
}

function CommentSection({ articleId, comments, setComments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.authorName || !newComment.content) {
      alert('请填写昵称和评论内容');
      return;
    }

    setSubmitting(true);
    try {
      const commentData = {
        articleId,
        authorName: newComment.authorName,
        authorEmail: newComment.authorEmail || undefined,
        content: newComment.content,
      };

      await commentApi.create(commentData);
      
      // 重新加载评论
      const updatedComments = await commentApi.getByArticle(articleId);
      setComments(updatedComments || []);
      
      // 清空表单
      setNewComment({
        authorName: '',
        authorEmail: '',
        content: '',
      });
      
      alert('评论成功！');
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('评论失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">评论</h2>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暂无评论，快来抢沙发吧！</p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium text-gray-900">{comment.authorName}</span>
                      {comment.authorWebsite && (
                        <a 
                          href={comment.authorWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-sm text-blue-600 hover:underline"
                        >
                          🌐 个人网站
                        </a>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatTime(comment.createTime)}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">发表评论</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
              昵称 *
            </label>
            <input
              type="text"
              id="authorName"
              value={newComment.authorName}
              onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="请输入昵称"
              required
            />
          </div>

          <div>
            <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱（可选）
            </label>
            <input
              type="email"
              id="authorEmail"
              value={newComment.authorEmail}
              onChange={(e) => setNewComment({ ...newComment, authorEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              评论内容 *
            </label>
            <textarea
              id="content"
              value={newComment.content}
              onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="写下你的评论..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </div>
      </form>
    </div>
  );
}
