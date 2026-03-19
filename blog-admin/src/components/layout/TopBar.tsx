interface TopBarProps {
  pageTitle: string
  loading: boolean
  onRefresh: () => void
}

export default function TopBar({ pageTitle, loading, onRefresh }: TopBarProps) {
  return (
    <header className="top-bar">
      <h2 className="page-title">{pageTitle}</h2>
      <button onClick={onRefresh} disabled={loading}>
        {loading ? '加载中...' : '🔄 刷新'}
      </button>
    </header>
  )
}
