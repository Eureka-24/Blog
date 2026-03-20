import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blog Hub - 导航中心",
  description: "博客系统导航中心 - 快速访问博客前台、后台管理等功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
