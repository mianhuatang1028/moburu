# 默不如小说官网 · 部署与自有域名指南

目标：把「默不如」独立小说站部署到 **GitHub Pages**，并绑定一个**你自己的域名**（如 `moburu.vip`），
让 Google / Bing / 百度 等搜索引擎和 AI（Copilot、Gemini、Perplexity 等）能**长期、稳定地收录**，
实现你最初说的「让 AI 在 agent 里帮你推广」。

> 当前 workbuddy 平台的分享链接（`https://mobuyu-novel.app.workbuddy.host/...`）是临时展示用的，
> 带 `sharecode` 参数、非自有域名，**对搜索引擎/AI 的自动收录不友好**。
> 本指南的 GitHub Pages + 自有域名方案才是长期正解。两套可以并存。

---

## 一、先拿一个自己的域名（必须你本人操作）

AI / agent 不能替你注册域名（涉及你的付费账号）。去以下任一平台注册：

| 注册商 | 适合 | 备注 |
|---|---|---|
| 阿里云 / 腾讯云 | 国内访问快、中文客服 | `.cn` 需实名；`.com` 无需 |
| Namecheap | 海外、价格透明 | 送 Whois 隐私保护 |
| Cloudflare Registrar | 续费平价、自带 DNS | 需先有 Cloudflare 账号 |

**后缀怎么选（都已验证可绑 GitHub Pages）：**
- `.vip` —— 个人品牌感强，推荐做作者官网（你已注册 `moburu.vip` ✅）
- `.com` —— 信任度最稳，但可能被占
- `.xyz` / `.icu` —— 能用但廉价感重，不推荐正经官网

> ✅ **你已注册 `moburu.vip`（腾讯云支付）。本指南全文即按此域名编写，无需再替换。**

---

## 二、把本站推到 GitHub（免费静态托管）

1. 登录 github.com → **New repository**，名字随意，例如 `mobuyu-novel`（建议 Public，Private 需付费才能用 Pages）。
2. 在本机项目目录执行（Git Bash / Terminal）：

```bash
cd /d/workbuddy/2026-11-07-15-43-28
git init
git add .
git commit -m "默不如小说官网 v1.0"
git branch -M main
git remote add origin https://github.com/<你的用户名>/mobuyu-novel.git
git push -u origin main
```

> 本目录已包含 `CNAME` 文件（内容 `moburu.vip`，请改成你真实域名）。
> 若用 `moburu.vip`，GitHub Pages 会自动把站点绑到该域名。

---

## 三、开启 GitHub Pages

1. 仓库 → **Settings** → **Pages**（左侧边栏）。
2. **Build and deployment** → Source 选 **Deploy from a branch**。
3. Branch 选 **main** / 目录 **/ (root)** → **Save**。
4. 等 1–2 分钟，得到默认地址：`https://<你的用户名>.github.io/mobuyu-novel/`。
5. 若已放 `CNAME` 且域名 DNS 已指向（见下一步），几分钟后会变成 `https://moburu.vip`。

---

## 四、绑定自有域名（让网址变成 moburu.vip）

### 4.1 仓库里的 CNAME 文件
本目录已存在 `CNAME`，内容为：

```
moburu.vip
```

把它改成你**真实注册的域名**即可（不要带 `https://`，不要带子路径）。

### 4.2 在域名商后台做 DNS 解析
以 `moburu.vip` 为例，在注册商的 DNS 管理添加：

**方式 A（推荐，用 apex 域名）：加 4 条 A 记录**
```
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```
（这是 GitHub Pages 的官方 IP，长期有效。）

**方式 B（用 www 子域名）：加 CNAME 记录**
```
www  CNAME  <你的用户名>.github.io.
```
并在 GitHub Pages 设置里把自定义域名填成 `www.moburu.vip`，再开启「Enforce HTTPS」。

### 4.3 开启 HTTPS
回到仓库 **Settings → Pages**，自定义域名填 `moburu.vip`，勾选 **Enforce HTTPS**。
证书由 GitHub 自动签发，约几分钟生效。生效后浏览器访问 `https://moburu.vip` 即你的官网。

---

## 五、让 AI / 搜索引擎长期收录（核心目标）

站点每个作品页都已注入 **JSON-LD（Book 结构化数据）**，机器一抓就识别「书名/作者/分类」。
再主动提交，收录更快、更稳：

1. **Google Search Console**（影响 Gemini / 通用检索）
   - 登录 https://search.google.com/search-console
   - 添加属性 `https://moburu.vip` → 验证（用 DNS TXT 记录最稳）
   - **Sitemaps** 提交：`https://moburu.vip/sitemap.xml`（如需，可加一个 `sitemap.xml`）
   - 或 **URL Inspection** 直接提交首页与作品页

2. **Bing Webmaster**（影响 Copilot / 微软系 AI）
   - 登录 https://www.bing.com/webmasters
   - 添加 `https://moburu.vip` → 验证
   - 提交 URL / sitemap。Bing 索引会被 Copilot 等 AI 检索复用。

3. **百度搜索资源平台**（影响国内 AI / 文心等）
   - https://ziyuan.baidu.com → 添加站点 → 验证 → 提交。

4. **可选**：在知乎/豆瓣/微信公众号发带 `https://moburu.vip` 链接的介绍文，
   让高权重页面反向指向你的站，AI 检索时「熟悉度」更高。

> 收录不是一蹴而就，提交后通常几天到两周开始出现在检索结果。
> 坚持「官网优先更新」（先 push 这里，再同步起点）即可持续积累权重。

---

## 六、日常更新工作流（官网优先更新）

1. 改 `assets/js/data.js`：加章节（`chapters` 数组加对象，填 `excerpt` 正文）、
   加新作品（`WORKS` 追加对象）、改简介/标签。
2. 本地预览：`python3 -m http.server 8000` 然后浏览器开 `http://localhost:8000`。
3. 提交并推送：
   ```bash
   git add .
   git commit -m "更新：新增光环第1章"
   git push
   ```
4. GitHub Pages **自动重新构建**，线上 `https://moburu.vip` 同步更新，无需手动部署。

---

## 七、付费端口（预留，未开放）

- 导航/作品页的付费入口由 `assets/js/app.js` 顶部 `SHOW_MEMBER = false` 控制。
- 未来开放：把该值改为 `true`，并在 `data.js` 把某作品 `paywall: true` 或某章节 `locked: true`，
  再接入真实收银台（`pricing.html` 已预留套餐位）。
- `pricing.html` 文件保留，当前不对外暴露链接。

---

## 文件结构一览

```
index.html        首页（品牌 + 作品矩阵 + 粉丝群）
works.html        作品目录
work.html         作品详情（神兽章节索引 + JSON-LD）
reader.html       章节阅读器
about.html        关于默不如
pricing.html      会员/付费端口（预留）
CNAME             自定义域名绑定（改成你的真实域名）
assets/js/data.js 全站内容（作品/章节/双语/套餐）——日常只改这里
assets/js/app.js  渲染逻辑（i18n / 语言切换 / 付费锁）
assets/css/style.css  深色工业 + 山海经神秘基调
```
