import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

// `yarn docs` / `predocs:build` 会先运行 scripts/sync-plugin-docs.mjs，
// 从各插件 external/<plugin>/docs 汇集生成 docs/services 下的侧边栏数据。
// external/ 为空时该文件可能尚未生成，此处容错处理。
let serviceSidebar: { text: string; items: { text: string; link: string }[] }[] = []
const sidebarUrl = new URL('../services/sidebar.ts', import.meta.url)
if (existsSync(fileURLToPath(sidebarUrl))) {
  serviceSidebar = (await import(sidebarUrl.href)).serviceSidebar
}

const sidebar = [
  {
    text: '入门',
    items: [
      { text: '文档首页', link: '/' },
      { text: '创建 Cordis 应用', link: '/cordis-application-setup' },
    ],
  },
  {
    text: '插件开发',
    items: [
      { text: '运行时插件', link: '/cordis-plugin-runtime' },
      { text: 'WebUI 插件', link: '/cordis-plugin-webui' },
      { text: 'Service 元数据规范', link: '/cordis-service-package-metadata' },
      { text: '知识沉淀与文档维护', link: '/guide/knowledge-capture' },
    ],
  },
  {
    text: '构建与发布',
    items: [
      { text: 'Yakumo 构建与调试', link: '/cordis-build-and-debug' },
      { text: '版本兼容性', link: '/cordis-version-compatibility' },
      { text: '发布插件', link: '/cordis-plugin-publishing' },
    ],
  },
  {
    text: '参考',
    items: [
      { text: 'SDK 与插件参考', link: '/cordis-sdk-reference' },
      { text: '常见问题排查', link: '/troubleshooting' },
      { text: '项目 Service 使用说明', link: '/services/' },
    ],
  },
]

const sidebarConfig = {
  '/services/': [
    { text: '项目 Service', items: [{ text: '总览', link: '/services/' }] },
    ...serviceSidebar,
  ],
  '/': sidebar,
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Cordis 应用开发文档',
  description: 'Cordis 应用配置、插件开发、构建与发布指南。',
  themeConfig: {
    nav: [
      { text: '指南', link: '/cordis-application-setup' },
      { text: '插件开发', link: '/cordis-plugin-runtime' },
      { text: '参考', link: '/cordis-sdk-reference' },
    ],
    sidebar: sidebarConfig,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/BSTluo/cordis-app-template' },
    ],
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一页', next: '下一页' },
  },
})
