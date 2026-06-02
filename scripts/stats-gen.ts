/**
 * 构建时统计生成脚本
 * 扫描 docs/ 下所有 .md 文件，生成 stats.json
 *
 * 使用方式: npx tsx scripts/stats-gen.ts
 */
import { readFileSync, writeFileSync } from 'fs'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { resolve, relative } from 'path'

interface Category {
  name: string
  count: number
  words: number
}

interface Tag {
  name: string
  count: number
}

interface RecentArticle {
  title: string
  path: string
  date: string
}

interface Stats {
  articleCount: number
  totalWords: number
  lastUpdated: string
  categories: Category[]
  tags: Tag[]
  timeline: Record<string, Record<string, number>>
  recentArticles: RecentArticle[]
  pathTitleMap: Record<string, string>
  pathTagsMap: Record<string, string[]>  // path → tags 映射
}

function countWords(text: string): number {
  // 移除代码块
  text = text.replace(/```[\s\S]*?```/g, '')
  // 移除行内代码
  text = text.replace(/`[^`]+`/g, '')
  // 移除 HTML 标签
  text = text.replace(/<[^>]+>/g, '')
  // 统计中文字符 + 英文单词
  const chineseChars = (text.match(/[一-鿿]/g) || []).length
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
  return chineseChars + englishWords
}

async function main() {
  const docsDir = resolve(process.cwd(), 'docs')

  // 扫描所有 .md 文件
  const files = await fg.glob('docs/**/*.md', {
    ignore: [
      '**/node_modules/**',
      '**/.vitepress/**',
      '**/@pages/**',
    ],
  })

  const stats: Stats = {
    articleCount: 0,
    totalWords: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
    categories: [],
    tags: [],
    timeline: {},
    recentArticles: [],
    pathTitleMap: {},
    pathTagsMap: {},
  }

  const categoryMap = new Map<string, number>()
  const categoryWordsMap = new Map<string, number>()
  const tagMap = new Map<string, number>()
  const articles: RecentArticle[] = []

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const { data, content: body } = matter(content)

    // 过滤条件：必须有标题
    if (!data.title) continue

    // 过滤目录页
    if (data.title === '目录' || data.permalink === false) continue

    stats.articleCount++

    // 字数统计
    const words = countWords(body)
    stats.totalWords += words

    // 分类统计
    const categories: string[] = data.categories || []
    if (typeof categories === 'string') {
      categories.push(categories)
    }
    for (const cat of categories) {
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
      categoryWordsMap.set(cat, (categoryWordsMap.get(cat) || 0) + words)
    }

    // 标签统计
    const tags: string[] = data.tags || []
    if (typeof tags === 'string') {
      tags.push(tags)
    }
    for (const tag of tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    }

    // 相对路径
    const relPath = relative(docsDir, file)
      .replace(/\\/g, '/')
      .replace(/\.md$/, '')
    const cleanPath = '/' + relPath

    // 标签映射（即使没有日期也保留）
    if (tags.length > 0) {
      stats.pathTagsMap[cleanPath] = tags
    }

    // 时间线
    if (data.date) {
      const dateStr = typeof data.date === 'string'
        ? data.date.substring(0, 10)
        : new Date(data.date).toISOString().split('T')[0]
      const [year, month] = dateStr.split('-')
      if (!stats.timeline[year]) stats.timeline[year] = {}
      stats.timeline[year][month] = (stats.timeline[year][month] || 0) + 1

      articles.push({
        title: data.title,
        path: cleanPath,
        date: dateStr,
      })
      stats.pathTitleMap[cleanPath] = data.title
    }
  }

  // 排序分类
  stats.categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      words: categoryWordsMap.get(name) || 0,
    }))
    .sort((a, b) => b.count - a.count)

  // 排序标签
  stats.tags = Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // 最近文章
  articles.sort((a, b) => b.date.localeCompare(a.date))
  stats.recentArticles = articles.slice(0, 10)

  // 写入输出
  const outputPath = resolve(process.cwd(), 'docs/public/data/stats.json')
  writeFileSync(outputPath, JSON.stringify(stats, null, 2), 'utf-8')

  console.log(`✅ stats.json 已生成 (${stats.articleCount} 篇文章, ${stats.totalWords} 字)`)
}

main().catch(console.error)
