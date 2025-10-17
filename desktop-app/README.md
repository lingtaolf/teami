# Teami Desktop

Electron 桌面版客户端，完全复刻 `ui_files` 中的界面与配色，可本地开发并打包成 macOS 安装包。

## 快速开始
- `npm install`：在 `desktop-app` 目录内安装依赖。
- `npm run dev`：并行启动 Vite 和 Electron，自动加载 React UI。开发阶段窗口会打开调试工具，便于检查界面与样式。

## 构建与打包
- `npm run build`：构建渲染进程资源到 `dist/`，供 Electron 生产模式加载。
- `npm run package:mac`：先构建前端，再调用 `electron-builder` 生成 macOS `.dmg` 安装包，输出位于 `dist/` 的同级 `dist/mac` 或 `dist/dmg` 目录。默认关闭代码签名，适合本地调试；如需正式签名，请配置 Apple Developer 证书并覆盖 `build.mac.identity`。
- `npm run dist`：与 `package:mac` 类似，但按照 `electron-builder` 默认配置构建全部目标（当前仅启用 macOS DMG）。

macOS 打包依赖 Xcode Command Line Tools；首次安装后可通过 `xcode-select --install` 配置。

## 目录结构
- `electron/`：主进程与 `preload` 脚本，负责创建窗口和安全地暴露原生 API。
- `src/`：React 组件与样式，保留 `ui_files` 的组织结构（Feature 组件在 `components/`，基础组件在 `components/ui/`，主题变量在 `styles/globals.css`）。
- `dist/`：Vite 构建输出，生产模式由 Electron 主窗口加载。

## 数据持久化
- 主进程使用 `better-sqlite3` 将 workspace 数据持久化到 `app.getPath('userData')` 目录下的 `teami.sqlite`，首启自动创建数据表。
- 内置 API 通过 `preload` 暴露给渲染进程，支持查询、创建与更新最近访问时间，最多保存 5 个 workspace。

## 样式与主题
- UI 使用 Tailwind 生成的样式与 `globals.css` 中声明的语义色板，任何新颜色需同时更新亮/暗主题变量。
- 组件库沿用了 shadcn/ui 的模式，扩展新控件时请放到 `components/ui/` 并遵循现有 props 设计。

## 调试技巧
- Electron 窗口中菜单的 “View > Toggle Developer Tools” 可随时打开 DevTools。
- 所有外部链接会在系统默认浏览器中打开，防止在桌面应用内跳转。
