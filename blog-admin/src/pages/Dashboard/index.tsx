import type { Article, Category, Tag } from '../../types'
import { EmptyState } from '../../components/common'

interface StatCardProps {
  icon: string
  value: number
  label: string
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

interface DashboardProps {
  articles: Article[]
  categories: Category[]
  tags: Tag[]
}

export default function Dashboard({ articles, categories, tags }: DashboardProps) {
  const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0)

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard icon="📝" value={articles.length} label="文章总数" />
        <StatCard icon="👁" value={totalViews} label="总阅读量" />
        <StatCard icon="📁" value={categories.length} label="分类数量" />
        <StatCard icon="🏷️" value={tags.length} label="标签数量" />
      </div>

      <div className="section">
        <h3>最新文章</h3>
        {articles.length === 0 ? (
          <EmptyState message="暂无文章" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>阅读量</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              {articles.slice(0, 5).map(article => (
                <tr key={article.id}>
                  <td>{article.title}</td>
                  <td>{article.category?.name || '-'}</td>
                  <td>{article.viewCount || 0}</td>
                  <td>
                    {article.createTime 
                      ? new Date(article.createTime).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
