"use client";

import { BookOpen, Settings, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface NavCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  delay: number;
}

function NavCard({ title, description, icon, href, color, delay }: NavCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="nav-card group relative block p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-sm animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}15, transparent 40%)`,
        }}
      />
      
      <div className="relative z-10">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {icon}
        </div>
        
        <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-gradient-accent transition-all duration-300">
          {title}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          {description}
        </p>
        
        <div className="flex items-center text-sm font-medium" style={{ color }}>
          <span>进入页面</span>
          <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-400">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export default function Home() {
  // 从环境变量获取跳转链接
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL || "http://localhost:3000";
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

  const navItems: Omit<NavCardProps, "delay">[] = [
    {
      title: "博客前台",
      description: "浏览文章、搜索内容、查看分类标签，体验简洁优雅的阅读界面",
      icon: <BookOpen className="w-7 h-7" />,
      href: blogUrl,
      color: "#3b82f6",
    },
    {
      title: "后台管理",
      description: "文章管理、分类标签维护、评论审核、用户管理等功能",
      icon: <Settings className="w-7 h-7" />,
      href: adminUrl,
      color: "#8b5cf6",
    },
  ];

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* 背景效果 */}
      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* 内容区域 */}
      <div className="relative z-10 max-w-5xl w-full">
        {/* 头部 */}
        <div className="text-center mb-16 animate-fade-in-up" style={{ opacity: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">博客系统导航中心</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
            Blog Hub
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            欢迎来到博客系统导航中心，快速访问博客前台浏览内容，或进入后台管理系统进行内容维护
          </p>
        </div>

        {/* 导航卡片 */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {navItems.map((item, index) => (
            <NavCard key={item.title} {...item} delay={200 + index * 100} />
          ))}
        </div>

        {/* 功能特性 */}
        <div
          className="max-w-2xl mx-auto p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in-up"
          style={{ animationDelay: "500ms", opacity: 0 }}
        >
          <h2 className="text-lg font-semibold mb-6 text-center text-gradient">
            系统功能概览
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureItem text="文章发布与管理" />
            <FeatureItem text="分类标签系统" />
            <FeatureItem text="全文搜索功能" />
            <FeatureItem text="评论互动系统" />
            <FeatureItem text="响应式设计" />
            <FeatureItem text="SEO 优化支持" />
          </div>
        </div>

        {/* 页脚 */}
        <footer
          className="mt-16 text-center text-gray-500 text-sm animate-fade-in-up"
          style={{ animationDelay: "700ms", opacity: 0 }}
        >
          <p>© {new Date().getFullYear()} Blog System. All rights reserved.</p>
        </footer>
      </div>

      {/* 装饰性元素 */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
    </main>
  );
}
