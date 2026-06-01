import fs from 'fs';
import AdmZip from 'adm-zip';

const distPath = './docs/.vitepress/dist';
const serverPath = './server';
const outputPath = './dist.zip';

// 检查目录是否存在
if (!fs.existsSync(distPath)) {
  console.error('❌ dist 目录不存在，请先运行 pnpm docs:build');
  process.exit(1);
}

if (!fs.existsSync(serverPath)) {
  console.error('❌ server 目录不存在');
  process.exit(1);
}

try {
  const zip = new AdmZip();

  // 添加前端静态文件（不保留目录前缀）
  zip.addLocalFolder(distPath, '');

  // [新增] 添加后端文件，排除 venv/ .env __pycache__ *.pyc stats.db
  zip.addLocalFolder(serverPath, 'server', (filePath) => {
    // 排除整个 venv 目录及其所有子文件
    if (filePath.startsWith('venv') || filePath.includes('/venv/')) return false;
    const basename = filePath.split(/[/\\]/).pop() || '';
    if (basename === '.env' || basename === '__pycache__') return false;
    if (basename.endsWith('.pyc') || basename.endsWith('.db')) return false;
    return true;
  });

  // 写入文件
  zip.writeZip(outputPath);

  console.log('✅ 打包完成 (前端 + 后端):', outputPath);
} catch (err) {
  console.error('❌ 打包失败:', err);
  process.exit(1);
}