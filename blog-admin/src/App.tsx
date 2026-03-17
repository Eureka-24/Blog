import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { adminApi } from './lib/api'
import './App.css'

interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

function App() {
  const [count, setCount] = useState(0)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 测试 API 连接
  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.articles.getAll()
      setArticles(Array.isArray(data) ? data : [])
      console.log('Articles fetched:', data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch articles'
      setError(errorMsg)
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 组件加载时自动获取文章列表
    fetchArticles()
  }, [])

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
          
          {/* API 测试区域 */}
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>API Connection Test</h2>
            <button 
              onClick={fetchArticles}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#646cff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Loading...' : 'Load Articles from API'}
            </button>
            
            {error && (
              <div style={{ marginTop: '10px', color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                <strong>Error:</strong> {error}
                <br />
                <small>Make sure your backend API is running at http://localhost:8081</small>
              </div>
            )}
            
            {articles.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h3>Articles ({articles.length})</h3>
                <ul style={{ textAlign: 'left', maxWidth: '600px' }}>
                  {articles.map(article => (
                    <li key={article.id} style={{ marginBottom: '10px' }}>
                      <strong>{article.title}</strong>
                      <br />
                      <small style={{ color: '#666' }}>
                        Created: {new Date(article.createdAt).toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
