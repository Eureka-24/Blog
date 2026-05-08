import fs from 'fs';
import AdmZip from 'adm-zip';

const distPath = './docs/.vitepress/dist';
const outputPath = './dist.zip';

// 检查目录是否存在
if (!fs.existsSync(distPath)) {
  console.error('❌ dist 目录不存在，请先运行 pnpm docs:build');
  process.exit(1);
}

try {
  const zip = new AdmZip();
  
  // 添加整个目录到 zip，第二个参数 '' 表示不保留目录前缀
  zip.addLocalFolder(distPath, '');
  
  // 写入文件
  zip.writeZip(outputPath);
  
  console.log('✅ 打包完成:', outputPath);
} catch (err) {
  console.error('❌ 打包失败:', err);
  process.exit(1);
}