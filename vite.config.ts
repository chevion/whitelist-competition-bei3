import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { viteSingleFile } from "vite-plugin-singlefile";
import fs from 'fs';
import path from 'path';

// 自定义插件：将 JavaScript 中的图片资源内联为 Base64
function inlineImageAssets() {
  return {
    name: 'inline-image-assets',
    async transform(code, id) {
      if (!id.endsWith('.js') && !id.endsWith('.jsx') && !id.endsWith('.ts') && !id.endsWith('.tsx')) {
        return;
      }

      const publicDir = path.resolve(process.cwd(), 'public');
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];

      function getAllFiles(dir, files = []) {
        if (!fs.existsSync(dir)) return files;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            getAllFiles(fullPath, files);
          } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (imageExtensions.includes(ext)) {
              files.push({
                name: entry.name,
                path: fullPath,
                urlPath: '/' + path.relative(publicDir, fullPath).replace(/\\/g, '/')
              });
            }
          }
        }
        return files;
      }

      const images = getAllFiles(publicDir);
      let modifiedCode = code;

      for (const image of images) {
        const possiblePatterns = [
          `"/${image.urlPath}"`,
          `'/${image.urlPath}'`,
          `"${image.urlPath}"`,
          `'${image.urlPath}'`
        ];

        for (const pattern of possiblePatterns) {
          if (modifiedCode.includes(pattern)) {
            const fileBuffer = fs.readFileSync(image.path);
            const mimeTypes: Record<string, string> = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif',
              '.webp': 'image/webp'
            };
            const ext = path.extname(image.name).toLowerCase();
            const mimeType = mimeTypes[ext] || 'image/png';
            const base64 = fileBuffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64}`;

            modifiedCode = modifiedCode.replace(
              new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              `"${dataUrl}"`
            );
            break;
          }
        }
      }

      return modifiedCode;
    }
  };
}

// 自定义插件：构建完成后清理不需要的文件并复制 index.html 到根目录
function cleanDistPlugin() {
  return {
    name: 'clean-dist',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const extensions = ['.png', '.svg', '.jpg', '.jpeg', '.gif', '.webp'];

      if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (extensions.includes(ext)) {
            fs.unlinkSync(path.join(distDir, file));
            console.log(`🗑️ 已删除: ${file}`);
          }
        }

        // 复制 dist/index.html 到项目根目录
        const distIndex = path.join(distDir, 'index.html');
        const rootIndex = path.join(process.cwd(), 'index.html');
        if (fs.existsSync(distIndex)) {
          fs.copyFileSync(distIndex, rootIndex);
          console.log(`📋 已复制: dist/index.html -> index.html`);
        }
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  root: 'src',
  publicDir: path.resolve(process.cwd(), 'public'),
  resolve: {
    alias: {
      '/china-map.svg': path.resolve(process.cwd(), 'public/china-map.svg'),
    }
  },
  build: {
    outDir: '../dist',
    sourcemap: false,
    assetsInlineLimit: 100000000,
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif', '**/*.webp'],
  plugins: [
    inlineImageAssets(),
    cleanDistPlugin(),
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-left',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }),
    tsconfigPaths(),
    viteSingleFile({
      inlineSource: ['.css', '.js'],
      removeViteModuleLoader: true,
    }),
  ],
})
