type Page = 'dashboard' | 'articles' | 'categories' | 'tags' | 'comments' | 'registrationCodes' | 'users'

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  currentUser: any
  onLogout: () => void
}

export default function Sidebar({ currentPage, onPageChange, currentUser, onLogout }: SidebarProps) {
  const navItems: { key: Page; icon: string; label: string }[] = [
    { key: 'dashboard', icon: '📊', label: '仪表盘' },
    { key: 'articles', icon: '📝', label: '文章管理' },
    { key: 'categories', icon: '📁', label: '分类管理' },
    { key: 'tags', icon: '🏷️', label: '标签管理' },
    { key: 'comments', icon: '💬', label: '评论管理' },
    { key: 'registrationCodes', icon: '🔑', label: '注册码管理' },
    { key: 'users', icon: '👥', label: '用户管理' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>博客管理系统</h1>
        <div className="user-info">
          <span className="user-name">👤 {currentUser?.nickname || currentUser?.username}</span>
          <button className="logout-btn" onClick={onLogout}>
            退出
          </button>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onPageChange(item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <a
          className="nav-item nav-link"
          href={import.meta.env.VITE_WEB_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
        >
          🌐 前往前台
        </a>
      </div>
    </aside>
  )
}

export type { Page }
