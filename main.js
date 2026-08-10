/* ===============================================================
   文件名: main.js
   作者: @yuangwu
   描述: 为 Obsidian 提供排版、列表、独立布局、极简 UI、圆角与材质、
         毛玻璃效果等 100+ 精细控制选项。完全基于 Obsidian 核心变量，
         自动适配任意主题。一站式界面隐藏与美化增强。
   版本: 1.1.0
   兼容: Obsidian >= 1.0.0
   许可证: AGPL-3.0 双重许可 (AGPL-3.0 + 商业许可)
   版权: Copyright (c) 2026 @yuangwu
   本程序是自由软件：您可以根据 GNU Affero General Public License v3.0
   的条款再分发和/或修改它。完整许可证文本见 LICENSE 文件。
   如果您需要将本程序用于闭源商业产品，可向作者购买商业许可。
   所有贡献者须签署贡献者许可协议 (CLA)，详见 CLA.md。
   =============================================================== */

const { Plugin, PluginSettingTab, Setting, Modal, Notice, setIcon } = require('obsidian');

// =============================================================================
// 配置定义：所有可设置项（统一前缀 pure-hide-）
// 每个 select 在应用时只会清除自身可选值对应的类，避免误删其他设置
// =============================================================================
const CONFIG = [
  // -------- 界面隐藏 (Hider) --------
  { type: 'heading', title: '界面隐藏 (Hider)', level: 'core' },
  { id: 'pure-hide-tabs', title: '隐藏标签栏', desc: '隐藏窗口顶部的标签页容器。', type: 'toggle', default: false, className: 'pure-hide-tabs' },
  { id: 'pure-hide-status', title: '隐藏状态栏', desc: '隐藏字数、字符数、反向链接计数。', type: 'toggle', default: false, className: 'pure-hide-status' },
  { id: 'pure-hide-vault', title: '隐藏仓库名称', desc: '隐藏仓库资料。注意：这会同时隐藏设置和仓库切换器图标，可通过快捷键或命令面板打开。', type: 'toggle', default: false, className: 'pure-hide-vault' },
  { id: 'pure-hide-scroll', title: '隐藏滚动条', desc: '隐藏所有滚动条。', type: 'toggle', default: false, className: 'pure-hide-scroll' },
  { id: 'pure-hide-sidebar-buttons', title: '隐藏侧边栏切换按钮', desc: '隐藏左右两侧的侧边栏按钮。', type: 'toggle', default: false, className: 'pure-hide-sidebar-buttons' },
  { id: 'pure-hide-tooltips', title: '隐藏工具提示', desc: '隐藏所有悬浮提示。', type: 'toggle', default: false, className: 'pure-hide-tooltips' },
  { id: 'pure-hide-file-nav-header', title: '隐藏文件浏览器按钮', desc: '隐藏文件浏览器顶部的“新建文件”、“新建文件夹”等按钮。', type: 'toggle', default: false, className: 'pure-hide-file-nav-header' },
  { id: 'pure-hide-search-suggestions', title: '隐藏搜索建议', desc: '隐藏搜索面板中的建议。', type: 'toggle', default: false, className: 'pure-hide-search-suggestions' },
  { id: 'pure-hide-search-counts', title: '隐藏搜索结果匹配数', desc: '隐藏每个搜索结果中的匹配数量。', type: 'toggle', default: false, className: 'pure-hide-search-counts' },
  { id: 'pure-hide-instructions', title: '隐藏操作提示', desc: '隐藏快速切换器和命令面板中的操作提示。', type: 'toggle', default: false, className: 'pure-hide-instructions' },
  { id: 'pure-hide-meta', title: '阅读视图隐藏属性', desc: '在阅读视图中隐藏属性区域。', type: 'toggle', default: false, className: 'pure-hide-meta' },

  // -------- 排版与间距 --------
  { type: 'heading', title: '排版与间距', level: 'core' },
  { id: 'pure-hide-text-line-height', title: '正文行高 (px)', desc: '建议 28~44，数值越大行距越宽', type: 'number', default: 36, unit: 'px', min: 20, max: 60, step: 1 },
  { id: 'pure-hide-text-paragraph-gap', title: '段落间距 (px)', desc: '段落之间的额外间距', type: 'number', default: 3.4, unit: 'px', min: 0, max: 20, step: 0.1 },
  { id: 'pure-hide-text-justify', title: '启用两端对齐 (Justify)', desc: '使正文、列表文字左右对齐，配合英文断字效果更佳', type: 'toggle', default: false, className: 'pure-hide-text-justify' },
  { id: 'pure-hide-justify-word-spacing', title: '两端对齐时单词间距调整 (em)', desc: '负值可压缩单词间距，推荐 -0.05 ~ 0', type: 'number', default: -0.05, unit: 'em', min: -0.2, max: 0.2, step: 0.01 },

  // -------- 列表与序号系统 --------
  { type: 'heading', title: '列表与序号系统', level: 'core' },
  { id: 'pure-hide-list-ol-width', title: '有序序号宽度 (px)', desc: '数字序号占用的水平空间', type: 'number', default: 40, unit: 'px', min: 20, max: 80, step: 1 },
  { id: 'pure-hide-list-ol-font-size', title: '有序序号字号 (px)', type: 'number', default: 20, unit: 'px', min: 12, max: 40, step: 1 },
  { id: 'pure-hide-list-ul-font-size', title: '无序圆点字号 (px)', type: 'number', default: 14, unit: 'px', min: 10, max: 30, step: 1 },
  { id: 'pure-hide-list-guide-offset', title: '缩进指示线水平偏移 (px)', desc: '调整编辑器中缩进辅助线的左右位置', type: 'number', default: 5, unit: 'px', min: -10, max: 20, step: 1 },

  // -------- 编辑与阅读独立布局 --------
  { type: 'heading', title: '编辑与阅读独立布局', level: 'core' },
  { id: 'pure-hide-editor-width', title: '编辑模式宽度 (px)', desc: '编辑器中正文内容的最大宽度', type: 'number', default: 800, unit: 'px', min: 400, max: 2000, step: 10 },
  { id: 'pure-hide-reading-width-separate', title: '单独控制阅读模式宽度', desc: '启用后，阅读模式宽度独立于编辑模式', type: 'toggle', default: false, className: 'pure-hide-reading-width-separate' },
  { id: 'pure-hide-reading-width', title: '阅读模式宽度 (px)', desc: '建议 650~800，仅在单独控制阅读宽度启用时生效', type: 'number', default: 720, unit: 'px', min: 400, max: 2000, step: 10 },
  { id: 'pure-hide-reading-serif', title: '阅读模式使用衬线字体 (Serif)', type: 'toggle', default: false, className: 'pure-hide-reading-serif' },
  { id: 'pure-hide-reading-hyphens', title: '启用英文断字 (配合两端对齐)', type: 'toggle', default: false, className: 'pure-hide-reading-hyphens' },

  // -------- 极简交互 --------
  { type: 'heading', title: '极简交互', level: 'enhance' },
  { id: 'pure-hide-nav-auto-hide', title: '侧边栏导航按钮悬停展开（小圆点模式）', desc: '默认缩成小圆点，鼠标悬停时才展开为完整按钮（仅在鼠标设备生效）', type: 'toggle', default: false, className: 'pure-hide-nav-auto-hide' },
  { id: 'pure-hide-tab-underline', title: '激活标签页使用下划线（替代背景高亮）', type: 'toggle', default: false, className: 'pure-hide-tab-underline' },
  {
    id: 'pure-hide-vault-style',
    title: '仓库切换器布局风格',
    desc: '侧边栏收起时，切换器将在侧边栏左下角以所选风格显示。',
    type: 'select',
    default: 'pure-hide-vault-default',
    options: [
      { label: '顶部默认 (Obsidian 原生)', value: 'pure-hide-vault-default' },
      { label: '药丸徽章 (胶囊标签)', value: 'pure-hide-vault-badge' },
      { label: '左下 Zen 式 (悬停展开)', value: 'pure-hide-vault-left-bottom' },
      { label: '左下仅图标 (极简)', value: 'pure-hide-vault-left-icon' },
      { label: '完全隐藏', value: 'pure-hide-vault-hidden' }
    ]
  },
  { id: 'pure-hide-vault-accent', title: '使用强调色作为仓库切换器主色', type: 'toggle', default: false, className: 'pure-hide-vault-accent' },
  { id: 'pure-hide-vault-hover-animate', title: '悬浮微动画 (缩放/上浮)', type: 'toggle', default: false, className: 'pure-hide-vault-hover-animate' },

  // -------- 统一圆角与材质 --------
  { type: 'heading', title: '统一圆角与材质', level: 'enhance' },
  {
    id: 'pure-hide-modal-radius',
    title: '弹窗/面板圆角',
    type: 'select',
    default: 'pure-hide-modal-radius-lg',
    options: [
      { label: '直角 (0px)', value: 'pure-hide-modal-radius-none' },
      { label: '小圆角 (6px)', value: 'pure-hide-modal-radius-sm' },
      { label: '中圆角 (12px)', value: 'pure-hide-modal-radius-md' },
      { label: '大圆角 (20px)', value: 'pure-hide-modal-radius-lg' },
      { label: '超大圆角 (28px)', value: 'pure-hide-modal-radius-xl' }
    ]
  },
  { id: 'pure-hide-modal-glass', title: '弹窗毛玻璃效果 (背景模糊)', type: 'toggle', default: false, className: 'pure-hide-modal-glass' },
  { id: 'pure-hide-modal-glass-opacity', title: '毛玻璃背景透明度', desc: '值越大背景越不透明', type: 'number', default: 0.15, unit: '', min: 0, max: 0.6, step: 0.05 },
  {
    id: 'pure-hide-quote-style',
    title: '引用块样式',
    type: 'select',
    default: 'pure-hide-quote-default',
    options: [
      { label: '极简细线 (默认)', value: 'pure-hide-quote-default' },
      { label: '粗边框强调', value: 'pure-hide-quote-bold' },
      { label: '毛玻璃背景', value: 'pure-hide-quote-glass' },
      { label: '圆角卡片', value: 'pure-hide-quote-card' }
    ]
  },
  {
    id: 'pure-hide-media-radius',
    title: '图片/视频圆角',
    type: 'select',
    default: 'pure-hide-media-radius-md',
    options: [
      { label: '直角', value: 'pure-hide-media-radius-none' },
      { label: '小圆角 (4px)', value: 'pure-hide-media-radius-sm' },
      { label: '中圆角 (12px)', value: 'pure-hide-media-radius-md' },
      { label: '大圆角 (24px)', value: 'pure-hide-media-radius-lg' }
    ]
  },
  {
    id: 'pure-hide-scrollbar-style',
    title: '滚动条宽度',
    type: 'select',
    default: 'pure-hide-scrollbar-thin',
    options: [
      { label: '极细 (4px)', value: 'pure-hide-scrollbar-thin' },
      { label: '适中 (8px)', value: 'pure-hide-scrollbar-medium' },
      { label: '默认 (12px)', value: 'pure-hide-scrollbar-default' }
    ]
  },
  { id: 'pure-hide-scrollbar-hover', title: '仅悬浮时显示滚动条', type: 'toggle', default: false, className: 'pure-hide-scrollbar-hover' },

  // -------- 毛玻璃全局总控 --------
  { type: 'heading', title: '毛玻璃效果', level: 'enhance' },
  { id: 'pure-hide-glass-master', title: '启用全局毛玻璃', desc: '关闭后将彻底禁用所有毛玻璃效果（弹窗、命令面板、引用块等）', type: 'toggle', default: true, className: 'pure-hide-glass-master' },

  // -------- 编辑器细节 --------
  { type: 'heading', title: '编辑器细节', level: 'enhance' },
  { id: 'pure-hide-heading-label', title: '标题前显示 H1/H2… 等级标签', type: 'toggle', default: false, className: 'pure-hide-heading-label' },
  { id: 'pure-hide-heading-dash-line', title: '标题下使用虚线（替代主题默认实线）', type: 'toggle', default: false, className: 'pure-hide-heading-dash-line' },
  { id: 'pure-hide-heading-arrow-color', title: '标题折叠箭头跟随标题颜色', type: 'toggle', default: false, className: 'pure-hide-heading-arrow-color' },
  {
    id: 'pure-hide-hr-style',
    title: '水平线样式',
    type: 'select',
    default: 'pure-hide-hr-solid',
    options: [
      { label: '细实线', value: 'pure-hide-hr-solid' },
      { label: '粗实线 (3px)', value: 'pure-hide-hr-thick' },
      { label: '双线', value: 'pure-hide-hr-double' },
      { label: '居中星号徽章', value: 'pure-hide-hr-badge' }
    ]
  },
  {
    id: 'pure-hide-tab-height',
    title: '顶部标签页高度',
    type: 'select',
    default: 'pure-hide-tab-default',
    options: [
      { label: '紧凑 (28px)', value: 'pure-hide-tab-compact' },
      { label: '标准 (40px)', value: 'pure-hide-tab-default' },
      { label: '宽松 (52px)', value: 'pure-hide-tab-loose' }
    ]
  },
  { id: 'pure-hide-file-list-dot', title: '文件列表显示 • 前缀', type: 'toggle', default: false, className: 'pure-hide-file-list-dot' },
  { id: 'pure-hide-hide-root-folder', title: '隐藏仓库根文件夹名称', type: 'toggle', default: false, className: 'pure-hide-hide-root-folder' },
  { id: 'pure-hide-remove-table-empty-line', title: '移除表格前空行 ⚠️ 性能提示', desc: '使用 :has() 选择器，在超大笔记（>5万字）中可能引起输入延迟', type: 'toggle', default: false, className: 'pure-hide-remove-table-empty-line' },
  {
    id: 'pure-hide-linenumber',
    title: '编辑器行号显示',
    type: 'select',
    default: 'pure-hide-linenumber-show',
    options: [
      { label: '始终显示', value: 'pure-hide-linenumber-show' },
      { label: '悬浮时显示', value: 'pure-hide-linenumber-hover' },
      { label: '完全隐藏', value: 'pure-hide-linenumber-hide' }
    ]
  },

  // -------- 进阶功能 --------
  { type: 'heading', title: '进阶功能', level: 'longtail' },
  { id: 'pure-hide-focus-paragraph', title: '聚焦段落模式 (淡化非活跃行)', desc: '编辑时当前行以外的内容透明度降低至 30%', type: 'toggle', default: false, className: 'pure-hide-focus-paragraph' },
  { id: 'pure-hide-multi-column', title: '多列布局 (需在笔记中添加 .multi-column 类)', desc: '将正文分为 2~3 栏，配合两端对齐效果更佳', type: 'toggle', default: false, className: 'pure-hide-multi-column' },
  { id: 'pure-hide-column-count', title: '多列布局列数', type: 'number', default: 2, unit: '', min: 2, max: 3, step: 1 },
  {
    id: 'pure-hide-codeblock-bg',
    title: '代码块背景对比度',
    type: 'select',
    default: 'pure-hide-code-bg-medium',
    options: [
      { label: '暗 (高对比)', value: 'pure-hide-code-bg-dark' },
      { label: '中 (默认)', value: 'pure-hide-code-bg-medium' },
      { label: '亮 (低对比)', value: 'pure-hide-code-bg-light' }
    ]
  },
  { id: 'pure-hide-codeblock-radius', title: '代码块圆角 (px)', type: 'number', default: 8, unit: 'px', min: 0, max: 16, step: 1 },
  {
    id: 'pure-hide-codeblock-copy',
    title: '代码块复制按钮位置',
    type: 'select',
    default: 'pure-hide-copy-top-right',
    options: [
      { label: '右上', value: 'pure-hide-copy-top-right' },
      { label: '右下', value: 'pure-hide-copy-bottom-right' },
      { label: '隐藏', value: 'pure-hide-copy-hidden' }
    ]
  },
  {
    id: 'pure-hide-tag-size',
    title: '标签尺寸',
    type: 'select',
    default: 'pure-hide-tag-standard',
    options: [
      { label: '紧凑', value: 'pure-hide-tag-compact' },
      { label: '标准', value: 'pure-hide-tag-standard' },
      { label: '大', value: 'pure-hide-tag-large' }
    ]
  },
  { id: 'pure-hide-tag-hover', title: '标签悬停放大', type: 'toggle', default: false, className: 'pure-hide-tag-hover' },
  {
    id: 'pure-hide-embed-border',
    title: '嵌入块边框颜色',
    type: 'select',
    default: 'pure-hide-embed-accent',
    options: [
      { label: '强调色', value: 'pure-hide-embed-accent' },
      { label: '灰色', value: 'pure-hide-embed-gray' },
      { label: '隐藏', value: 'pure-hide-embed-none' }
    ]
  },
  {
    id: 'pure-hide-embed-padding',
    title: '嵌入块内边距',
    type: 'select',
    default: 'pure-hide-embed-padding-standard',
    options: [
      { label: '紧凑', value: 'pure-hide-embed-padding-compact' },
      { label: '标准', value: 'pure-hide-embed-padding-standard' },
      { label: '宽松', value: 'pure-hide-embed-padding-loose' }
    ]
  },
  { id: 'pure-hide-embed-radius', title: '嵌入块圆角 (px)', type: 'number', default: 8, unit: 'px', min: 0, max: 12, step: 1 },
  {
    id: 'pure-hide-titlebar-style',
    title: '顶栏样式',
    type: 'select',
    default: 'pure-hide-titlebar-default',
    options: [
      { label: '默认 (不透明)', value: 'pure-hide-titlebar-default' },
      { label: '半透明', value: 'pure-hide-titlebar-translucent' },
      { label: '毛玻璃', value: 'pure-hide-titlebar-glass' }
    ]
  },
  {
    id: 'pure-hide-titlebar-divider',
    title: '顶栏分割线样式',
    type: 'select',
    default: 'pure-hide-divider-hidden',
    options: [
      { label: '隐藏', value: 'pure-hide-divider-hidden' },
      { label: '细线', value: 'pure-hide-divider-thin' },
      { label: '粗线 (3px)', value: 'pure-hide-divider-thick' },
      { label: '阴影', value: 'pure-hide-divider-shadow' }
    ]
  },
  {
    id: 'pure-hide-collapse-indicator',
    title: '折叠指示器样式',
    type: 'select',
    default: 'pure-hide-collapse-default',
    options: [
      { label: '默认', value: 'pure-hide-collapse-default' },
      { label: '跟随标题颜色', value: 'pure-hide-collapse-heading' },
      { label: '灰色', value: 'pure-hide-collapse-gray' }
    ]
  },
  {
    id: 'pure-hide-collapse-animation',
    title: '折叠动画',
    type: 'select',
    default: 'pure-hide-collapse-smooth',
    options: [
      { label: '平滑旋转', value: 'pure-hide-collapse-smooth' },
      { label: '瞬间切换', value: 'pure-hide-collapse-instant' }
    ]
  },
  {
    id: 'pure-hide-gutter-bg',
    title: '装订线背景',
    type: 'select',
    default: 'pure-hide-gutter-transparent',
    options: [
      { label: '透明', value: 'pure-hide-gutter-transparent' },
      { label: '与编辑器背景一致', value: 'pure-hide-gutter-editor' },
      { label: '浅色对比', value: 'pure-hide-gutter-contrast' }
    ]
  },
  {
    id: 'pure-hide-modal-animation',
    title: '弹窗动画类型',
    type: 'select',
    default: 'pure-hide-modal-fade',
    options: [
      { label: '淡入', value: 'pure-hide-modal-fade' },
      { label: '上浮', value: 'pure-hide-modal-slide-up' },
      { label: '缩放', value: 'pure-hide-modal-scale' },
      { label: '无动画', value: 'pure-hide-modal-none' }
    ]
  },
  {
    id: 'pure-hide-context-menu-density',
    title: '右键菜单密度',
    type: 'select',
    default: 'pure-hide-menu-standard',
    options: [
      { label: '紧凑', value: 'pure-hide-menu-compact' },
      { label: '标准', value: 'pure-hide-menu-standard' },
      { label: '宽松', value: 'pure-hide-menu-loose' }
    ]
  },
  {
    id: 'pure-hide-dataview-row-height',
    title: 'Dataview 表格行高',
    type: 'select',
    default: 'pure-hide-dv-standard',
    options: [
      { label: '紧凑', value: 'pure-hide-dv-compact' },
      { label: '标准', value: 'pure-hide-dv-standard' },
      { label: '宽松', value: 'pure-hide-dv-loose' }
    ]
  },
  { id: 'pure-hide-dataview-header-bold', title: 'Dataview 表头加粗', type: 'toggle', default: false, className: 'pure-hide-dv-header-bold' },
  { id: 'pure-hide-dataview-card-radius', title: 'Dataview 卡片视图圆角 (px)', type: 'number', default: 12, unit: 'px', min: 0, max: 24, step: 1 },
  { id: 'pure-hide-calendar-cell-radius', title: '日历单元格圆角 (px)', type: 'number', default: 8, unit: 'px', min: 0, max: 16, step: 1 },
  {
    id: 'pure-hide-calendar-dot-style',
    title: '有笔记日期标记样式',
    type: 'select',
    default: 'pure-hide-calendar-dot',
    options: [
      { label: '圆点', value: 'pure-hide-calendar-dot' },
      { label: '下划线', value: 'pure-hide-calendar-underline' },
      { label: '背景色块', value: 'pure-hide-calendar-block' }
    ]
  },
  { id: 'pure-hide-canvas-radius-sync', title: 'Canvas 卡片圆角跟随全局', type: 'toggle', default: false, className: 'pure-hide-canvas-radius-sync' },
  { id: 'pure-hide-excalidraw-glass', title: 'Excalidraw 工具栏毛玻璃', type: 'toggle', default: false, className: 'pure-hide-excalidraw-glass' },

  // -------- 兼容性与性能 --------
  { type: 'heading', title: '兼容性与性能', level: 'enhance' },
  { id: 'pure-hide-transition', title: '启用平滑过渡动画 (可能影响性能)', desc: '仅在特定元素上启用，避免通配符', type: 'toggle', default: false, className: 'pure-hide-transition' },
  { id: 'pure-hide-saturation', title: '界面饱和度 (仅对非原生变量生效)', type: 'number', default: 1, unit: '', min: 0.8, max: 1.2, step: 0.01 },
  { id: 'pure-hide-contrast', title: '界面对比度 (仅对非原生变量生效)', type: 'number', default: 1, unit: '', min: 0.9, max: 1.1, step: 0.01 },

  // -------- 排版增强 --------
  { type: 'heading', title: '排版增强', level: 'enhance' },
  {
    id: 'pure-hide-highlight-style',
    title: '高亮标记样式',
    type: 'select',
    default: 'pure-hide-highlight-default',
    options: [
      { label: '默认', value: 'pure-hide-highlight-default' },
      { label: '圆角药丸', value: 'pure-hide-highlight-pill' },
      { label: '毛玻璃背景', value: 'pure-hide-highlight-glass' },
      { label: '下划线式', value: 'pure-hide-highlight-underline' }
    ]
  },
  {
    id: 'pure-hide-emphasis-style',
    title: '斜体/粗体特殊渲染',
    type: 'select',
    default: 'pure-hide-emphasis-default',
    options: [
      { label: '默认', value: 'pure-hide-emphasis-default' },
      { label: '斜体加下划线', value: 'pure-hide-emphasis-italic-underline' },
      { label: '粗体加背景色', value: 'pure-hide-emphasis-bold-bg' },
      { label: '粗体加下划线', value: 'pure-hide-emphasis-bold-underline' }
    ]
  },
  { id: 'pure-hide-link-underline-animation', title: '链接悬停下划线动画', type: 'toggle', default: false, className: 'pure-hide-link-underline-animation' },
  { id: 'pure-hide-paragraph-indent', title: '正文首行缩进 (2em)', type: 'toggle', default: false, className: 'pure-hide-paragraph-indent' },
  { id: 'pure-hide-drop-cap', title: '阅读模式首字下沉', type: 'toggle', default: false, className: 'pure-hide-drop-cap' },
  { id: 'pure-hide-chinese-spacing', title: '中文与英文/数字自动间距', desc: '需要浏览器支持 text-spacing-trim 或 letter-spacing 调整', type: 'toggle', default: false, className: 'pure-hide-chinese-spacing' },

  // -------- 列表强化 --------
  { type: 'heading', title: '列表强化', level: 'enhance' },
  {
    id: 'pure-hide-task-style',
    title: '任务列表复选框样式',
    type: 'select',
    default: 'pure-hide-task-default',
    options: [
      { label: '默认', value: 'pure-hide-task-default' },
      { label: '圆点 (Radio)', value: 'pure-hide-task-radio' },
      { label: '方形强调色', value: 'pure-hide-task-square' }
    ]
  },
  { id: 'pure-hide-list-marker-variety', title: '嵌套列表自动切换标记', type: 'toggle', default: false, className: 'pure-hide-list-marker-variety' },
  { id: 'pure-hide-list-card', title: '列表项卡片模式', type: 'toggle', default: false, className: 'pure-hide-list-card' },

  // -------- UI 交互细节 --------
  { type: 'heading', title: 'UI 交互细节', level: 'enhance' },
  { id: 'pure-hide-command-glass', title: '命令面板毛玻璃', type: 'toggle', default: false, className: 'pure-hide-command-glass' },
  { id: 'pure-hide-file-icon-color', title: '侧边栏文件图标按类型彩色', type: 'toggle', default: false, className: 'pure-hide-file-icon-color' },
  { id: 'pure-hide-center-inline-title', title: '阅读模式标题居中', type: 'toggle', default: false, className: 'pure-hide-center-inline-title' },
  { id: 'pure-hide-tab-close-enlarge', title: '标签页关闭按钮悬停放大', type: 'toggle', default: false, className: 'pure-hide-tab-close-enlarge' },
  {
    id: 'pure-hide-breadcrumb-style',
    title: '面包屑导航样式',
    type: 'select',
    default: 'pure-hide-breadcrumb-default',
    options: [
      { label: '默认', value: 'pure-hide-breadcrumb-default' },
      { label: '圆角药丸', value: 'pure-hide-breadcrumb-pill' },
      { label: '半透明背景', value: 'pure-hide-breadcrumb-glass' }
    ]
  },

  // -------- 编辑器增强 --------
  { type: 'heading', title: '编辑器增强', level: 'longtail' },
  { id: 'pure-hide-cursor-accent', title: '光标颜色跟随强调色', type: 'toggle', default: false, className: 'pure-hide-cursor-accent' },
  { id: 'pure-hide-active-line-indicator', title: '当前行左侧竖线指示', type: 'toggle', default: false, className: 'pure-hide-active-line-indicator' },
  { id: 'pure-hide-selection-accent', title: '选中文本背景跟随强调色', type: 'toggle', default: false, className: 'pure-hide-selection-accent' },
  { id: 'pure-hide-suggestion-glass', title: '自动补全菜单毛玻璃', type: 'toggle', default: false, className: 'pure-hide-suggestion-glass' },
  { id: 'pure-hide-bracket-highlight', title: '括号/标签匹配高亮', type: 'toggle', default: false, className: 'pure-hide-bracket-highlight' },

  // -------- 阅读模式增强 --------
  { type: 'heading', title: '阅读模式增强', level: 'longtail' },
  { id: 'pure-hide-footnote-tooltip-glass', title: '脚注悬停预览毛玻璃', type: 'toggle', default: false, className: 'pure-hide-footnote-tooltip-glass' },
  { id: 'pure-hide-table-word-wrap', title: '表格单元格自动换行', type: 'toggle', default: false, className: 'pure-hide-table-word-wrap' },
  { id: 'pure-hide-image-shadow', title: '图片添加柔和阴影', type: 'toggle', default: false, className: 'pure-hide-image-shadow' },
  { id: 'pure-hide-callout-bg-blocks', title: '启用预设彩色背景块', desc: '在段落前添加 `> [!bg]- red` 等 callout 语法可得到彩色背景块', type: 'toggle', default: false, className: 'pure-hide-callout-bg-blocks' },

  // -------- 设置按钮位置（移动系统设置按钮） --------
  { type: 'heading', title: '设置入口', level: 'core' },
  {
    id: 'pure-hide-setting-button-position',
    title: '设置按钮位置',
    desc: '选择 Obsidian 原生设置按钮的显示位置。当选择“侧边栏左下角”且侧边栏折叠时，按钮会自动移动到状态栏以保证可见。',
    type: 'select',
    default: 'ribbon',
    options: [
      { label: '侧边栏左下角', value: 'ribbon' },
      { label: '状态栏', value: 'statusbar' },
      { label: '标签栏', value: 'tabbar' }
    ]
  }
];

// 默认设置对象（从 CONFIG 提取）
const DEFAULT_SETTINGS = Object.fromEntries(
  CONFIG.filter(item => item.type !== 'heading').map(item => [item.id, item.default])
);
// 额外添加一个内部标志，不暴露给用户设置
DEFAULT_SETTINGS['pure-hide-license-shown'] = false;

// =============================================================================
// 工具函数：防抖
// =============================================================================
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// =============================================================================
// 插件主类
// =============================================================================
class PureHidePlugin extends Plugin {
  async onload() {
    // ===== 加载设置并应用 =====
    await this.loadSettings();
    this.addSettingTab(new PureHideSettingTab(this.app, this));
    this.applySettings();

    // ===== 首次启动显示许可证信息（不阻塞，不强制同意） =====
    this.showLicenseInfoIfNeeded();

    // ===== 注册命令 =====

    // 1. 查看许可证信息（供用户随时查阅）
    this.addCommand({
      id: 'pure-hide-show-license',
      name: '查看许可证信息',
      callback: () => this.showLicenseInfo(true) // 强制显示，不改变已读标志
    });

    // 2. 切换状态栏
    this.addCommand({
      id: 'toggle-hider-status',
      name: '切换状态栏显示',
      callback: () => {
        this.settings['pure-hide-status'] = !this.settings['pure-hide-status'];
        this.saveSettings();
        this.applySettings();
      }
    });

    // 3. 切换标签栏
    this.addCommand({
      id: 'toggle-hider-tabs',
      name: '切换标签栏显示',
      callback: () => {
        this.settings['pure-hide-tabs'] = !this.settings['pure-hide-tabs'];
        this.saveSettings();
        this.applySettings();
      }
    });

    // 4. 打赏支持
    this.addCommand({
      id: 'pure-hide-donate',
      name: '支持开发者 / 打赏',
      callback: () => this.showDonateModal()
    });

    // ===== 设置按钮位置管理 - 移动 Obsidian 原生设置按钮 =====
    this.settingButtonEl = null;    // 我们创建的替代按钮 DOM 引用
    this.nativeSettingsBtn = null;  // Obsidian 原生设置按钮 DOM 引用

    // 布局就绪后隐藏原生设置按钮，并创建替代按钮
    this.app.workspace.onLayoutReady(() => {
      // 定位原生设置按钮（左侧 ribbon 中的齿轮图标）
      const nativeBtn = document.querySelector('.side-dock-ribbon-action[aria-label="打开设置"]');
      if (nativeBtn) {
        this.nativeSettingsBtn = nativeBtn;
        nativeBtn.style.display = 'none'; // 隐藏原生按钮
      }
      this.updateSettingButton();
    });

    // 监听侧边栏折叠/展开，实时调整按钮位置
    this.registerEvent(this.app.workspace.on('layout-change', () => this.updateSettingButton()));
  }

  onunload() {
    // 移除注入的样式
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }

    // 移除我们创建的自定义设置按钮
    this.removeSettingButton();

    // 恢复原生设置按钮（如果被隐藏）
    if (this.nativeSettingsBtn) {
      this.nativeSettingsBtn.style.display = '';
      this.nativeSettingsBtn = null;
    }

    // 彻底清理所有添加的类、CSS 变量，避免残留影响主题
    const body = document.body;
    for (const item of CONFIG) {
      if (item.type === 'heading') continue;
      if (item.type === 'toggle') {
        body.classList.remove(item.className);
      } else if (item.type === 'select') {
        for (const opt of item.options) {
          body.classList.remove(opt.value);
        }
      } else if (item.type === 'number') {
        body.style.removeProperty('--' + item.id);
      }
    }
    body.classList.remove('pure-hide-glass-disabled');
  }


  /**
   * 显示许可证信息弹窗（AGPL-3.0 + 双重许可 + CLA 提示）
   * @param {boolean} force - 是否强制显示（忽略已展示标志）
   */
  showLicenseInfo(force = false) {
    // 如果已经显示过且不是强制，则不再重复弹出
    if (!force && this.settings['pure-hide-license-shown']) {
      return;
    }

    const modal = new Modal(this.app);
    modal.titleEl.innerHTML = '📜 许可证信息';

    // 直接使用 modal.contentEl 作为容器
    const container = modal.contentEl;

    // 复用之前的样式类
    const header = container.createDiv('pure-hide-eula-header');
    header.innerHTML = '<span style="font-size:1.8rem;">⚖️</span> 使用许可说明';

    const content = container.createDiv('pure-hide-eula-content');
    content.innerHTML = `
      <p><strong>Pure Hide 插件</strong> 采用 <strong>AGPL-3.0 双重许可</strong> 模式发布：</p>
      <ul>
        <li><strong>🔓 开源版</strong>：基于 <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">GNU Affero General Public License v3.0</a>，<strong>免费</strong>供个人、研究人员和开源项目使用。您可以在遵守 AGPL-3.0 条款的前提下自由使用、修改和分发。</li>
        <li><strong>💼 商业版</strong>：对于无法遵守 AGPL-3.0 强互惠条款的组织（例如需要将本软件集成到专有商业产品中），可向作者<a href="https://github.com/yuangwu">购买商业许可证</a>，获得专有使用权。</li>
      </ul>
      <p><strong>🤝 贡献者须知</strong>：所有贡献者需签署 <a href="https://github.com/yuangwu/obsidian-pure-hide/blob/main/CLA.md" target="_blank">贡献者许可协议 (CLA)</a>，以维护双重许可模式的可持续性。</p>
      <p style="margin-top: 12px; font-size: 0.9rem; color: var(--text-muted);">
        详细条款请阅读 <a href="https://github.com/yuangwu/obsidian-pure-hide/blob/main/LICENSE.md" target="_blank">完整的 LICENSE 文件</a>。
      </p>
    `;

    const actions = container.createDiv('pure-hide-eula-actions');
    const closeBtn = actions.createEl('button', { text: '我已知晓', cls: 'agree-btn' });
    // 仅首次展示（force=false）时记录已读标志；命令强制查看（force=true）不改变标志
    closeBtn.onclick = () => {
      if (!force) {
        this.settings['pure-hide-license-shown'] = true;
        this.saveSettings();
      }
      modal.close();
    };

    modal.open();
  }

  /**
   * 在首次启动时检查是否需要显示许可证信息
   */
  showLicenseInfoIfNeeded() {
    // 如果从未显示过，则显示（force=false）
    if (!this.settings['pure-hide-license-shown']) {
      this.showLicenseInfo(false);
    }
  }

  /**
   * 打赏模态框 - 移除内层容器，直接使用 modal.contentEl
   */
  showDonateModal() {
    const sponsorLinks = [
      { label: '爱发电', url: 'https://ifdian.net/a/yuangwu', icon: '❤️' },
      { label: '微信/支付宝', url: 'https://github.com/yuangwu/obsidian-pure-hide/blob/main/yuangwu/Donate.md', icon: '💰' }
    ];

    const modal = new Modal(this.app);
    modal.titleEl.setText('☕ 支持开发者');

    // 直接使用 modal.contentEl，并添加一个类用于样式微调
    const content = modal.contentEl;
    content.addClass('pure-hide-donate-modal');

    const intro = content.createEl('p', { text: '如果 Pure Hide 插件帮到了你，可以请开发者喝杯咖啡～' });
    intro.style.marginBottom = '16px';

    const buttonGroup = content.createDiv('donate-button-group');
    sponsorLinks.forEach((link) => {
      const btn = buttonGroup.createEl('button', { text: `${link.icon} ${link.label}`, cls: 'donate-link-btn' });
      btn.addEventListener('click', () => {
        if (link.url) {
          window.open(link.url, '_blank');
        } else {
          new Notice('该赞助渠道暂未设置');
        }
      });
    });

    const hint = content.createEl('p', { text: '赞助链接由开发者固定，感谢您的支持！', cls: 'setting-hint' });
    const closeBtn = content.createEl('button', { text: '关闭', cls: 'mod-cta' });
    closeBtn.addEventListener('click', () => modal.close());
    modal.open();
  }

  /**
   * 根据用户设置和左侧边栏的折叠状态，移动 Obsidian 原生设置按钮
   * 原按钮被隐藏，我们在目标位置创建视觉一致的替代按钮（齿轮图标）
   */
  updateSettingButton() {
    this.removeSettingButton();
    const position = this.settings?.['pure-hide-setting-button-position'] || 'ribbon';
    const leftCollapsed = this.app.workspace.leftSplit?.collapsed;

    let actualPosition = position;

    // 如果选择侧边栏但侧边栏折叠，自动改用状态栏作为备选，保证始终可见
    if (position === 'ribbon' && leftCollapsed) {
      actualPosition = 'statusbar';
    }

    // 确保原生按钮保持隐藏（可能在布局变化后被重置，这里再强制隐藏）
    if (this.nativeSettingsBtn) {
      this.nativeSettingsBtn.style.display = 'none';
    }

    const openSystemSettings = () => {
      // 打开 Obsidian 全局设置窗口（不是插件设置）
      this.app.setting.open();
    };

    if (actualPosition === 'ribbon') {
      // 在左侧 ribbon 区域创建一个齿轮图标，模拟原生设置按钮
      const ribbonIcon = this.addRibbonIcon('settings', '打开设置', openSystemSettings);
      ribbonIcon.addClass('pure-hide-settings-btn');
      this.settingButtonEl = ribbonIcon;
    } else if (actualPosition === 'statusbar') {
      // 状态栏项：使用齿轮图标（复用公共方法）
      this.settingButtonEl = this.createStatusBarButton();
    } else if (actualPosition === 'tabbar') {
      // 附加到顶部标签栏容器中，同样使用齿轮图标
      const tabHeaderContainer = document.querySelector('.workspace-tab-header-container');
      if (tabHeaderContainer) {
        const btn = document.createElement('div');
        btn.className = 'pure-hide-settings-btn';
        // 使用 setIcon 设置齿轮图标
        setIcon(btn, 'settings');
        btn.setAttribute('aria-label', '打开设置');
        btn.addEventListener('click', openSystemSettings);
        tabHeaderContainer.appendChild(btn);
        this.settingButtonEl = btn;
      } else {
        // 降级到状态栏（图标形式）
        console.warn('Pure Hide: 未找到标签栏容器，设置按钮将显示在状态栏');
        this.settingButtonEl = this.createStatusBarButton();
      }
    }
  }

  /**
   * 在状态栏创建带齿轮图标的设置按钮
   * @returns {HTMLElement} 状态栏项元素
   */
  createStatusBarButton() {
    const statusBarItem = this.addStatusBarItem();
    statusBarItem.addClass('pure-hide-settings-btn');
    // 创建 span 容器并设置齿轮图标
    const iconContainer = statusBarItem.createSpan();
    setIcon(iconContainer, 'settings');
    statusBarItem.setAttribute('aria-label', '打开设置');
    statusBarItem.addEventListener('click', () => this.app.setting.open());
    return statusBarItem;
  }

  /**
   * 移除我们创建的替代设置按钮
   */
  removeSettingButton() {
    if (this.settingButtonEl) {
      this.settingButtonEl.remove();
      this.settingButtonEl = null;
    }
  }

  async loadSettings() {
    // 加载存储的数据，并与默认设置合并
    const stored = await this.loadData() || {};
    // 只保留 DEFAULT_SETTINGS 中存在的键，避免多余字段
    const validSettings = {};
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (key in stored) {
        validSettings[key] = stored[key];
      } else {
        validSettings[key] = DEFAULT_SETTINGS[key];
      }
    }
    this.settings = validSettings;
    // 仅当存储中存在多余字段时写盘清理，避免每次启动无条件写入
    const hasExtraKeys = Object.keys(stored).some(key => !(key in DEFAULT_SETTINGS));
    if (hasExtraKeys) {
      await this.saveData(this.settings);
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * 核心：应用所有设置（类、CSS 变量）
   */
  applySettings() {
    const body = document.body;
    const settings = this.settings;

    for (const item of CONFIG) {
      if (item.type === 'heading') continue;
      const value = settings[item.id];

      if (item.type === 'toggle') {
        const cls = item.className;
        if (value) {
          body.classList.add(cls);
        } else {
          body.classList.remove(cls);
        }
      } else if (item.type === 'select') {
        // 只移除该 select 可能设置的值，不影响其他设置
        for (const opt of item.options) {
          body.classList.remove(opt.value);
        }
        body.classList.add(value);
      } else if (item.type === 'number') {
        const varName = '--' + item.id;
        let val = value;
        if (item.unit && item.unit !== '') {
          val = parseFloat(val) + item.unit;
        } else {
          val = parseFloat(val);
        }
        body.style.setProperty(varName, val);
      }
    }

    // 处理全局毛玻璃总开关
    if (settings['pure-hide-glass-master'] === false) {
      body.classList.add('pure-hide-glass-disabled');
    } else {
      body.classList.remove('pure-hide-glass-disabled');
    }
  }
}

// =============================================================================
// 设置面板（优化 UI/UX：搜索、展开/折叠、导出/导入、分组折叠）
// 修复：搜索框支持中文输入，增加防抖，提升流畅度
// =============================================================================
class PureHideSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    // 用于搜索过滤
    this.filterText = '';
    this.searchInput = null;
    this.isComposing = false; // 输入法组合标志
    // 防抖函数
    this.debouncedFilter = debounce(this.filterSettings.bind(this), 200);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    // 标题
    containerEl.createEl('h2', { text: 'Pure Hide 设置' });
    const descEl = containerEl.createEl('p', {
      text: '一站式控制 Obsidian 界面隐藏、排版、圆角、毛玻璃与交互细节。'
    });
    descEl.style.marginBottom = '1.5em';
    descEl.style.color = 'var(--text-muted)';
    descEl.style.fontSize = '0.9em';

    // ---- 工具栏：搜索、展开/折叠、导出/导入 ----
    const toolbar = containerEl.createDiv('pure-hide-toolbar');
    toolbar.style.display = 'flex';
    toolbar.style.gap = '10px';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.marginBottom = '1.2em';
    toolbar.style.alignItems = 'center';

    // 搜索框
    const searchInput = toolbar.createEl('input', { type: 'text', placeholder: '🔍 搜索设置项...' });
    searchInput.style.flex = '1';
    searchInput.style.minWidth = '150px';
    searchInput.style.padding = '6px 10px';
    searchInput.style.borderRadius = '6px';
    searchInput.style.border = '1px solid var(--background-modifier-border)';
    searchInput.style.background = 'var(--background-primary)';
    searchInput.style.color = 'var(--text-normal)';
    this.searchInput = searchInput;

    // 展开全部按钮
    const expandBtn = toolbar.createEl('button', { text: '展开全部' });
    expandBtn.style.padding = '4px 12px';
    expandBtn.addEventListener('click', () => {
      const details = containerEl.querySelectorAll('details');
      details.forEach(d => d.open = true);
    });

    // 折叠全部按钮
    const collapseBtn = toolbar.createEl('button', { text: '折叠全部' });
    collapseBtn.style.padding = '4px 12px';
    collapseBtn.addEventListener('click', () => {
      const details = containerEl.querySelectorAll('details');
      details.forEach(d => d.open = false);
    });

    // 导出设置
    const exportBtn = toolbar.createEl('button', { text: '导出设置' });
    exportBtn.style.padding = '4px 12px';
    exportBtn.addEventListener('click', () => {
      const data = JSON.stringify(this.plugin.settings, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pure-hide-settings.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    // 导入设置
    const importBtn = toolbar.createEl('button', { text: '导入设置' });
    importBtn.style.padding = '4px 12px';
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
          const imported = JSON.parse(text);
          // 合并导入：仅接受存在于 CONFIG 且类型匹配的配置键，跳过无效项
          let accepted = 0;
          let rejected = 0;
          for (const key of Object.keys(imported)) {
            const item = CONFIG.find(c => c.id === key);
            const val = imported[key];
            const valid = item && (
              (item.type === 'toggle' && typeof val === 'boolean') ||
              (item.type === 'number' && typeof val === 'number' && !isNaN(val)) ||
              (item.type === 'select' && typeof val === 'string' && item.options.some(o => o.value === val))
            );
            if (valid) {
              this.plugin.settings[key] = val;
              accepted++;
            } else {
              rejected++;
            }
          }
          await this.plugin.saveSettings();
          this.plugin.applySettings();
          this.plugin.updateSettingButton();
          this.display();
          new Notice(rejected > 0 ? `设置导入成功：接受 ${accepted} 项，跳过 ${rejected} 项无效配置` : `设置导入成功：接受 ${accepted} 项`);
        } catch (err) {
          new Notice('导入失败：无效的 JSON 文件');
          console.error(err);
        }
      };
      input.click();
    });

    // ---- 设置项渲染 ----
    let totalOptions = 0;
    let currentGroup = null;
    let groupTitle = '';
    let groupSummary = null;
    let groupCount = 0;

    for (const item of CONFIG) {
      try {
        if (item.type === 'heading') {
          // 为上一分组补上设置项计数
          if (groupSummary !== null) {
            groupSummary.textContent = groupTitle + '（' + groupCount + ' 项）';
          }
          // 创建 details 分组
          const details = containerEl.createEl('details');
          // 整合优化：核心层分组默认展开，其余默认折叠，聚焦核心价值
          if (item.level === 'core') {
            details.setAttribute('open', '');
          }
          details.style.marginBottom = '1.2em';
          details.style.padding = '0.5em 0.8em';
          details.style.border = '1px solid var(--background-modifier-border)';
          details.style.borderRadius = '8px';
          details.style.backgroundColor = 'var(--background-secondary)';

          const summary = details.createEl('summary');
          summary.textContent = item.title;
          summary.style.fontWeight = '600';
          summary.style.fontSize = '1.05em';
          summary.style.cursor = 'pointer';
          summary.style.paddingBottom = '0.3em';

          // 为分组添加搜索数据属性与层级标记（供搜索时展开折叠组）
          details.dataset.groupSearchText = item.title.toLowerCase();
          details.dataset.level = item.level || 'enhance';

          groupTitle = item.title;
          groupSummary = summary;
          groupCount = 0;
          currentGroup = details.createDiv();
          continue;
        }

        if (!currentGroup) {
          // 如果没有分组，则直接添加到容器
          currentGroup = containerEl;
        }

        totalOptions++;
        groupCount++;
        const setting = new Setting(currentGroup)
          .setName(item.title)
          .setDesc(item.desc || '');

        // 为设置项添加搜索数据属性（标题 + 描述）
        const searchText = (item.title + ' ' + (item.desc || '')).toLowerCase();
        setting.settingEl.dataset.searchText = searchText;

        const id = item.id;
        const currentValue = this.plugin.settings[id];

        if (item.type === 'toggle') {
          setting.addToggle(toggle => toggle
            .setValue(currentValue)
            .onChange(async (val) => {
              this.plugin.settings[id] = val;
              await this.plugin.saveSettings();
              this.plugin.applySettings();
            })
          );
        } else if (item.type === 'select') {
          setting.addDropdown(dropdown => {
            for (const opt of item.options) {
              dropdown.addOption(opt.value, opt.label);
            }
            dropdown.setValue(currentValue)
              .onChange(async (val) => {
                this.plugin.settings[id] = val;
                await this.plugin.saveSettings();
                this.plugin.applySettings();
                if (id === 'pure-hide-setting-button-position') {
                  this.plugin.updateSettingButton();
                }
              });
          });
        } else if (item.type === 'number') {
          const hasSlider = item.min !== undefined && item.max !== undefined && item.step !== undefined;
          if (hasSlider) {
            setting.addSlider(slider => {
              slider.setLimits(item.min, item.max, item.step)
                .setValue(currentValue)
                .setDynamicTooltip()
                .onChange(async (val) => {
                  this.plugin.settings[id] = val;
                  await this.plugin.saveSettings();
                  this.plugin.applySettings();
                });
            });
            setting.addText(text => {
              text.setValue(String(currentValue))
                .setDisabled(true);
              if (text.inputEl) {
                text.inputEl.style.width = '50px';
              }
            });
          } else {
            setting.addText(text => {
              text.setValue(String(currentValue))
                .setPlaceholder('数值')
                .onChange(async (val) => {
                  const num = parseFloat(val);
                  if (!isNaN(num)) {
                    this.plugin.settings[id] = num;
                    await this.plugin.saveSettings();
                    this.plugin.applySettings();
                  }
                });
            });
          }
        }
      } catch (e) {
        console.error(`渲染选项 "${item.title || item.id}" 时出错:`, e);
        const errEl = containerEl.createEl('div', {
          text: `⚠️ 选项 "${item.title || item.id}" 加载失败，详情见控制台。`
        });
        errEl.style.color = 'var(--text-error)';
        errEl.style.marginBottom = '1em';
      }
    }

    // 为最后一组补上设置项计数
    if (groupSummary !== null) {
      groupSummary.textContent = groupTitle + '（' + groupCount + ' 项）';
    }

    // ---- 绑定搜索事件（支持中文输入法 + 防抖） ----
    this.bindSearchEvents();

    // ---- 应用当前的过滤（如果有搜索文本） ----
    if (this.filterText) {
      this.searchInput.value = this.filterText;
      this.filterSettings();
    }

    // ---- 支持开发者区域 ----
    const supportSection = containerEl.createDiv('pure-hide-support-section');
    supportSection.createEl('h3', { text: '☕ 支持开发者' });
    supportSection.createEl('p', { text: '如果插件对你有帮助，欢迎请开发者喝杯咖啡～' });
    supportSection.createEl('p', { text: '赞助链接已由开发者固定，感谢您的支持！', cls: 'pure-hide-support-hint' });
    const donateBtn = supportSection.createEl('button', { text: '打赏支持', cls: 'mod-cta pure-hide-donate-glow-btn' });
    donateBtn.addEventListener('click', () => {
      this.plugin.showDonateModal();
    });

    // ---- 底部统计与重置 ----
    const footer = containerEl.createDiv();
    footer.style.marginTop = '2em';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';

    const countEl = footer.createEl('span', {
      text: `已加载 ${totalOptions} 个设置项`
    });
    countEl.style.fontSize = '0.8em';
    countEl.style.color = 'var(--text-muted)';

    new Setting(footer)
      .setName('重置所有设置')
      .setDesc('将全部选项恢复为插件默认值')
      .addButton(btn => btn
        .setButtonText('恢复默认')
        .setWarning()
        .onClick(async () => {
          if (confirm('确定要重置所有设置为默认值吗？此操作不可撤销。')) {
            // 重置为 DEFAULT_SETTINGS
            this.plugin.settings = { ...DEFAULT_SETTINGS };
            await this.plugin.saveSettings();
            this.plugin.applySettings();
            this.plugin.updateSettingButton();
            this.display();
          }
        })
      );
  }

  /**
   * 绑定搜索框事件，支持中文输入法 + 防抖
   */
  bindSearchEvents() {
    if (!this.searchInput) return;

    // 移除旧事件（避免重复绑定）
    this.searchInput.removeEventListener('input', this._searchHandler);
    this.searchInput.removeEventListener('compositionstart', this._compositionStartHandler);
    this.searchInput.removeEventListener('compositionend', this._compositionEndHandler);

    // 定义事件处理器（使用防抖）
    this._searchHandler = () => {
      if (this.isComposing) return; // 输入法组合中不触发搜索
      this.filterText = this.searchInput.value;
      this.debouncedFilter(); // 防抖执行过滤
    };

    this._compositionStartHandler = () => {
      this.isComposing = true;
    };

    this._compositionEndHandler = () => {
      this.isComposing = false;
      // 组合结束后立即更新搜索文本并触发过滤（防抖）
      this.filterText = this.searchInput.value;
      this.debouncedFilter();
    };

    // 绑定事件
    this.searchInput.addEventListener('input', this._searchHandler);
    this.searchInput.addEventListener('compositionstart', this._compositionStartHandler);
    this.searchInput.addEventListener('compositionend', this._compositionEndHandler);
  }

  /**
   * 根据当前搜索文本过滤设置项和分组
   * 不重建 DOM，仅切换 display
   */
  filterSettings() {
    const searchText = this.filterText.toLowerCase().trim();
    const container = this.containerEl;

    // 获取所有设置项
    const settingItems = container.querySelectorAll('.setting-item');
    settingItems.forEach(el => {
      const text = el.dataset.searchText || '';
      if (searchText === '' || text.includes(searchText)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // 处理分组：如果分组内所有设置项都隐藏，则隐藏整个分组
    const detailsList = container.querySelectorAll('details');
    detailsList.forEach(details => {
      const items = details.querySelectorAll('.setting-item');
      const total = items.length;
      if (total === 0) {
        details.style.display = ''; // 无设置项的分组保持可见（理论上不会出现）
        return;
      }
      let hiddenCount = 0;
      items.forEach(item => {
        if (item.style.display === 'none') hiddenCount++;
      });
      if (searchText !== '' && hiddenCount === total) {
        details.style.display = 'none';
      } else {
        details.style.display = '';
        // 整合优化：搜索命中时自动展开分组，避免结果藏在折叠组内
        if (searchText !== '') {
          details.open = true;
        }
      }
    });
  }
}

module.exports = PureHidePlugin;