# GitHub Pages 发布说明（中文）

本项目已完成 GitHub Pages 配置，原设计、圆盘、地图、66 张照片、统计数据与交互功能保留。使用 GitHub Actions 自动构建，不需要自己改仓库名对应的路径，也不需要 API 密钥。

## 一、准备上传的目录

推荐使用本次提供的 `SEOUL-PET-CARE-CITY-GITHUB-PAGES.zip`，先解压，再上传其中的项目文件。不要把 ZIP 本身当成网页上传。

项目根目录应直接包含：

```text
.github/workflows/deploy-pages.yml
package.json
package-lock.json
vite.config.js
index.html
src/
public/
data/
exports/
references/
```

`.github` 是隐藏目录，但必须上传。不要在 GitHub 仓库中额外套一层同名文件夹，否则 workflow 找不到 package.json。

压缩包不包含 node_modules、dist、旧 Git 历史或 Sites 托管身份。源码、原始统计数据、GeoJSON、66 张图片、字体、摄影来源、海报、下载素材及交互逻辑均保留。GitHub Actions 根据这些文件生成 dist。

## 二、推荐：用 GitHub Desktop 上传

项目含大量照片，推荐 GitHub Desktop，避免网页拖拽上传时漏文件。

1. 登录 GitHub Desktop。
2. 点击 **File → Add Local Repository**，选择解压后的项目目录。
3. 如果提示不是 Git 仓库，点击 **create a repository here**，在当前目录创建；保留已有 `.gitignore`。
4. 如有未提交文件，在左下角填写 `Publish Seoul Pet Care City`，点击 **Commit to main**。
5. 点击 **Publish repository**。仓库名建议填写 `seoul-pet-care-city`。
6. 使用 GitHub Free 时，取消 **Keep this code private**，发布为 Public。
7. 点击 **Publish Repository**，完成上传。

请使用解压后的新目录，这样不会把现有 Sites 仓库的 origin 地址带到 GitHub。

## 三、开启 Pages

1. 打开刚创建的 GitHub 仓库。
2. 点击 **Settings → Pages**。
3. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
4. 打开仓库上方 **Actions**。
5. 选择 **Deploy website to GitHub Pages**。
6. 点击 **Run workflow → main → Run workflow**。
7. 等待所有步骤绿色通过，然后返回 **Settings → Pages → Visit site**。

首次上传可能在设置 Pages 前已自动触发一次流程；若那次失败，完成第 3 步后重新运行即可。后续每次推送 main 都会自动更新网站。

workflow 使用 GitHub 自带的 GITHUB_TOKEN，不需要创建个人访问令牌或配置 Secrets。

## 四、提交给教授的链接

若 GitHub 用户名是你的实际用户名，仓库名为 `seoul-pet-care-city`，网址格式为：

```text
https://你的GitHub用户名.github.io/seoul-pet-care-city/
```

这只是格式，不能把“你的GitHub用户名”原样提交。**以 Settings → Pages 中的 Visit site 实际地址为准。** 提交这个网站地址，不是 `github.com/...` 源码仓库地址，也不是 localhost。

本项目对应仓库为 `liuchen040926-afk/seoul-pet-care-city`，预定 Pages 地址为 `https://liuchen040926-afk.github.io/seoul-pet-care-city/`。是否已完成发布，应以工作流部署结果和实际 HTTP 访问结果为准。

## 五、本地运行和检查

安装 Node.js 24 LTS（24.15.0 或更新的 24.x）。项目内 `.nvmrc` 已设为 24。

```bash
npm ci
npm run dev
```

开发地址使用终端实际显示的 URL。默认是 http://localhost:5173/ 。

完整检查：

```bash
npm test
npm run test:ui
npm run build
npm run test:pages
```

构建预览（供你在本地浏览器打开）：

```bash
npm run preview -- --port 4173
```

访问 http://localhost:4173/ 。不要双击 index.html 以 file:// 方式运行。

## 六、已经处理的兼容性

- Vite `base: './'`，适应普通项目子目录、账号根站点及自定义域名。
- 动态摄影、原始 PDF、数据文件和素材 ZIP 使用统一的 publicUrl 路径函数。
- 字体路径由 Vite 在打包时转换，测试验证每个字体文件存在。
- 原有页面使用弹窗及 #radial、#map-explorer 锚点，没有需要服务器接管的前端路径；因此不需要另写 404 页面伪装成首页。
- public/.nojekyll 随静态文件发布。
- 已添加官方 Pages 工作流、Node 版本、npm 锁定安装与自动数据/交互/子目录检查。
- 本地统计、图片和字体均随网站发布，浏览者不需要登录或申请地图接口密钥。

## 七、常见问题

**Actions 一直没有出现：** 检查 `.github/workflows/deploy-pages.yml` 是否位于仓库根层级；确认分支名是 main；在 Actions 中启用工作流。

**Configure Pages 或 Deploy 失败：** 先确认 Settings → Pages 的 Source 是 GitHub Actions，再重新运行流程。若账号对 Pages 或 Actions 有组织限制，按 GitHub 显示的提示处理。

**网页有框架但缺图片：** 确保 public/assets、public/fonts、public/downloads 均已上传，不要只传 src。不要把 assets ZIP 的源码片段当成完整网站项目。

**看到了项目说明而不是网站：** 不要选择 Deploy from a branch 发布源码根目录，使用本文的 GitHub Actions 流程。

**网址还没出来：** 等待工作流成功后查看 Settings → Pages。新站上线可能需要几分钟。

**仓库改名：** 当前使用相对资源路径，一般无需改 Vite base；重新运行工作流，并使用 Pages 页面显示的新网址。

## 官方依据

- https://vite.dev/guide/static-deploy.html#github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
