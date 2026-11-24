## 2026-11-24 主图放大

桌面布局压缩左栏，三个指标按钮移至左侧。1920×1080屏幕中主SVG高度由845px增至996px，中央地图与文字同步放大，完整主图保持在首屏范围内。三层仍使用原有独立线性刻度和同一套数据。平板、手机保留横向滑动以避免缩小区名。

---

## 2026-11-24 界面精简

按用户要求移除整段“숫자로 읽는 서울”（统计发现和散点图），保留主圆盘及单区摘要、查询、比较、来源和下载。三个指标按钮统一为圆点符号和胶囊形选中状态。历史数据调查记录继续保留。

---

## 2026-11-23 全量信息调查更新

全市摘要与单区详情明确分离；全市不参与25区排名。左栏可直接选择25区，查看该区完整数字、排名、数量份额和相对全市加权比率的差值。新增由真实数据计算的四项分布发现和25点相关散点图。主圆盘及原有交互保留，界面为韩语。

重新调查记录：`data/raw/recheck-20261123/`；来源：`data/sources.md`；自动复核：`node scripts/audit-information.mjs`。统计时间仍为2024年3月，不代表当前营业医院或实际存活犬数量。截图和浏览器测试已更新。

---

## 2026-11-23 教授评语整合更新

原网址保持不变：https://liuchen040926-afk.github.io/seoul-pet-care-city/

仅保留一张大型圆盘综合图。三个顶部指标按钮同时控制全部图层的降序排列、真实共同排名和中央地图着色；初始仍为基本排列与全部图层。中央地图扩大并标注25区；选择后左侧全市总数切换为该区数值。删除第二张重复地图、重复指标按钮及重复地区数字。搜索、比较、数据表、来源、下载与SVG/PNG导出保留。

教授原话及误译判断见 `references/PROFESSOR_FEEDBACK_ANALYSIS.md`。当前浏览器测试记录见 `TEST_REPORT.md` 顶部，截图在 `exports/`。将 `exports/SEOUL-PET-CARE-CITY.svg` 拖入Figma即可继续编辑文字和路径；它不是原生.fig文件。

---

# SEOUL PET CARE CITY 3.0

GitHub Pages 发布步骤见 **GITHUB_PAGES_SETUP.md**。本项目已配置相对资源路径和自动部署工作流。

原项目融合版：大型三层圆盘重新作为首页主视觉，下方保留摄影地图、地区详情、搜索及左右分屏比较。界面韩语。旧版备份标签 `before-radial-merge-20261117`。

## 运行

需要 Node.js 24 LTS（24.15.0 或更新的 24.x）。

```bash
npm ci
npm run dev -- --port 5173
```

打开 http://localhost:5173 。`npm run build` 生成 dist；dev/build 前会自动验证完整统计数据，验证失败则不启动。网站基本功能无需实时接口或用户 API 密钥。

## 已核对的正式数据

使用首尔市官网发布、首尔数字财团编制的《서울 펫 스마트라이프》（2024-05-29）。两项集计均为 2024 年 3 月：25 区登记犬 612,085、动物医院 924。原始 PDF、图 2/图 6 插图、人工转录表和元数据均保存在 data/raw/report-2024/。25 区加总与报告总计一致。

犬数是包含死亡个体的累计登记运营数据，不是排除死亡的有效存量。医院数为报告正式集计，本项目不声称独立逐院核验当前营业时间。每千犬医院数由程序计算，首尔整体为 924/612085×1000 ≈1.51。详见 data/sources.md、methodology.md、validation_report.md。

未统计的夜间诊疗、公园等占位功能已从正式界面移除，没有虚构设施、数量或营业时间。2022 原件仍存作研究记录，但不参与当前数值。

## 交互

首页完整圆盘：25 组紫色犬数柱、25 组蓝色医院柱、25 个青绿色比例点与折线、中央同指标地图。悬停/键盘焦点显示三项数值与排名；点击任意图层、区名或地图联动地区摄影详情。四项指标突出、五种同步排序、搜索、重置、共同尺度双区比较、完整数据表、CSV/JSON、SVG/高清 PNG 海报均保留。

66 张真实摄影和本地字体继续使用；犬种为视觉主题，生活/医疗照不是具体地区或医院实拍证据。图片来源见 assets-manifest.json、image-credits.csv、image-placement.md。素材 ZIP 在 public/downloads/，网页底部可下载。

## 检查

```bash
npm run prepare-data
npm run validate
npm test
npm run test:ui
npm run poster
```

`poster` 使用同一 Chart 组件输出 SVG；PNG 为 3600×4400，可通过网页导出。交付海报在 exports/。圆盘上方预留数值轴空隙，避免遮挡柱形；25 区各占相同角区，折线不跨越轴留白。

没有可用的 cua_repl.js 浏览器控制工具，未声称完成真实浏览器排版、移动端或 canvas 保存测试。数据、DOM、构建与 SVG 静态渲染检查结果见 TEST_REPORT.md。

GitHub Pages 地址（部署工作流成功后）：https://liuchen040926-afk.github.io/seoul-pet-care-city/

源码仓库：https://github.com/liuchen040926-afk/seoul-pet-care-city

## GitHub Pages

上传完整项目后，在仓库 Settings → Pages 将 Source 设为 GitHub Actions，再运行 Deploy website to GitHub Pages。正式提交链接以 Visit site 显示地址为准，格式通常为 `https://你的GitHub用户名.github.io/seoul-pet-care-city/`。

新增 `npm run test:pages`，实际以 HTTP 服务加载构建文件，在根目录及任意仓库子目录运行编译后的界面逻辑，并核对照片、字体、原始报告和下载文件。该检查使用 Node + jsdom，不等同于真实浏览器视觉或 Canvas PNG 保存测试。
