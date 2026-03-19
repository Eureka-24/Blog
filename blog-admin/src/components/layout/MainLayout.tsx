import Sidebar, { type Page } from './Sidebar'
import TopBar from './TopBar'

interface MainLayoutProps {
  children: React.ReactNode
  currentPage: Page
  onPageChange: (page: Page) => void
  currentUser: any
  onLogout: () => void
  pageTitle: string
  loading: boolean
  onRefresh: () => void
  error: string | null
}

const pageTitles: Record<Page, string> = {
  dashboard: '仪表盘',
  articles: '文章管理',
  categories: '分类管理',
  tags: '标签管理',
  comments: '评论管理',
  registrationCodes: '注册码管理',
  users: '用户管理',
}

export default function MainLayout({
  children,
  currentPage,
  onPageChange,
  currentUser,
  onLogout,
  pageTitle,
  loading,
  onRefresh,
  error,
}: MainLayoutProps) {
  return (
    <div className="app">
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="main-content">
        <TopBar
          pageTitle={pageTitle || pageTitles[currentPage]}
          loading={loading}
          onRefresh={onRefresh}
        />

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {children}
      </main>
    </div>
  )
}

export type { Page }
