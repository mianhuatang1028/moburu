# 默不如小说官网 · 部署与自有域名指南

目标：把「默不如」独立小说站部署到 **GitHub Pages**，并绑定一个**你自己的域名**（如 `moburu.vip`），
让 Google / Bing / 百度 等搜索引擎和 AI（Copilot、Gemini、Perplexity 等）能**长期、稳定地收录**，
实现你最初说的「让 AI 在 agent 里帮你推广」。

> 当前 workbuddy 平台的分享链接（`https://moburu.app.workbuddy.host/...`）是临时展示用的，
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

1. 登录 github.com → **New repository**，名字随意，例如 `moburu`（建议 Public，Private 需付费才能用 Pages）。
2. 在本机项目目录执行（Git Bash / Terminal）：

```bash
cd /d/workbuddy/2026-11-07-15-43-28
git init
git add .
git commit -m "默不如小说官网 v1.0"
git branch -M main
git remote add origin https://github.com/<你的用户名>/moburu.git
git push -u origin main
```

> 本目录已包含 `CNAME` 文件（内容 `moburu.vip`，请改成你真实域名）。
> 若用 `moburu.vip`，GitHub Pages 会自动把站点绑到该域名。

---

## 三、开启 GitHub Pages

1. 仓库 → **Settings** → **Pages**（左侧边栏）。
2. **Build and deployment** → Source 选 **Deploy from a branch**。
3. Branch 选 **main** / 目录 **/ (root)** → **Save**。
4. 等 1–2 分钟，得到默认地址：`https://<你的用户名>.github.io/moburu/`。
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

**方式 A（推荐，用 apex 域名）：加 A 记录**
```
@  A  185.199.108.153
@  A  185.199.109.153
```
（这是 GitHub Pages 的官方 IP，长期有效。GitHub 官方一共给出 4 个 IP：
`185.199.108/109/110/111.153`，全部加上只是为了冗余备份，**只加 2 条完全够用**。）

> ⚠️ **腾讯云 / DNSPod 免费版实测坑（2026-11-08 踩过）**
> 免费版「负载均衡」对**同一主机记录（@）最多只允许 2 条 A 记录**，
> 加第 3 条会报「子域名负载超过套餐限制」。**不用升级套餐**，保留 2 条即可。
> 另外腾讯云手机端「添加解析记录」的 **TTL 必填数字**，留空会红字报错，填 `600` 即可。
> 「关联云资源」开关保持关闭（打开才涉及备案）。

**方式 B（用 www 子域名）：加 CNAME 记录**
```
www  CNAME  <你的用户名>.github.io.
```
并在 GitHub Pages 设置里把自定义域名填成 `www.moburu.vip`，再开启「Enforce HTTPS」。

### 4.3 开启 HTTPS
回到仓库 **Settings → Pages**，自定义域名填 `moburu.vip`，勾选 **Enforce HTTPS**。
证书由 GitHub 自动签发，约几分钟生效。生效后浏览器访问 `https://moburu.vip` 即你的官网。

### 4.4 常见报错：www 子域名 improperly configured / InvalidDNSError
**现象**：Custom domain 填了 apex 域名（`moburu.vip`）后，GitHub 报
`www.moburu.vip is improperly configured. Domain's DNS record could not be retrieved. (InvalidDNSError)`。
**原因**：GitHub 配置 apex 域名时会**同时校验 www 变体**；若 `www` 没有任何 DNS 记录（NXDOMAIN），
或境内权威 DNS 对 GitHub 境外探测超时，就会报这个错。此时 `https://moburu.vip` 往往**已经能正常访问**。
**解决**：补一条 www 的 CNAME（单条普通 CNAME 免费版可用，不算负载均衡，不受 2 条上限影响）：
```
www  CNAME  mianhuatang1028.github.io
```
线路默认、TTL 600、关联云资源关。等 10 分钟后，回 Pages 把 Custom domain **删掉再重新填一次**
（Remove → Save → 等 1 分钟 → 填回 `moburu.vip` → Save），强制 GitHub 重新做 DNS 检查。
**注意**：Custom domain 里只填 `moburu.vip`，**不要填 `www.moburu.vip`**，仓库 `CNAME` 文件也保持 `moburu.vip`。

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

《恨长沙》**已全本公开**：45 章 / 3023 段 / 约 19.8 万字。正文按章独立存放，
改稿只动对应文件，不会牵动全站：

```
chapters/henchangsha/0.json   ← 引：鲲鹏
chapters/henchangsha/1.json   ← 第一章 鸮
...
chapters/henchangsha/44.json  ← 第四十四章 诸犍
chapters/henchangsha/*.html   ← 静态存档页（脚本生成，勿手改）
chapters/henchangsha/index.json  ← 章节清单与全书字数
```

1. **改内容**：
   - 修订某章正文 → 只改 `chapters/<作品>/<章号>.json` 里的 `paragraphs`，并同步 `chars`。
   - 新增章节 → 放一份同格式 JSON，在 `index.json` 与 `assets/js/data.js` 的 `chapters`
     补目录项。**`num` 是永久身份，永不复用**（收藏链接、URL、存证都靠它）。
   - 改简介 / 标签 / 山海经小传 → 改 `assets/js/data.js`。
2. **跑两条命令，顺序不能反**：
   ```bash
   node tools/publish.js       # 首发时间戳 + 修订记录 → posts.js / posts.json
   node tools/build-pages.js   # 重建静态存档页 + sitemap.xml / robots.txt / llms.txt
   ```
   - 新章 → 写 `firstPostedAt`（目录首发）与 `bodyFirstPostedAt`（全文首发）+ 内容 SHA-256。
   - 老章改了 → 只追加一条 `revisions` 并更新 `updatedAt`，**两个首发时间永不覆盖**。
   - 生成 `assets/js/posts.js`（页面读它）与根目录 `posts.json`（公开存证文件）。
3. 本地预览：`python -m http.server 8000` → `http://localhost:8000`。
   注意：阅读页正文用 `fetch` 按章加载，**必须走 http**，直接双击 `file://` 打开会加载失败；
   静态存档页 `chapters/<作品>/<章号>.html` 不依赖 JS，双击也能看全文。
4. 提交并推送（**务必把 posts.js / posts.json / 静态页一起提交**，时间证据靠 git 历史）：
   ```bash
   git add .
   git commit -m "更新：新增第X章 + 首发存证"
   git pull --rebase
   git push
   ```
5. GitHub Pages **自动重新构建**，线上 `https://moburu.vip` 同步更新，无需手动部署。

---

## 七、首发时间戳与原创性存证

目的：任何一章「最早公开发布到本站」的时间都可查、可证，用于主张原创性与版权归属。

- 唯一真相源：根目录 `posts.json`（公开可访问）+ `assets/js/posts.js`（页面同步读取）。
  两个文件由 `node tools/publish.js` 生成，**不要手工编辑**。
- 字段含义：
  - `firstPostedAt` —— 该章内容（目录 + 小传）首次发布到本站的时间（UTC+8，ISO 8601），**只写一次**。
  - `bodyFirstPostedAt` —— **全文正文首次公开**的时间，单独记录、同样只写一次。
    2026-11-09 一次性公开 45 章全文，所以这批时间相同；以后逐章发就会各自独立。
  - `firstSha256` / `bodyFirstSha256` —— 首发当时内容 / 正文的 SHA-256，之后永不改。
  - `sha256` / `updatedAt` / `bodySha256` / `bodyChars` —— 当前内容哈希、最后修订时间、正文字数。
  - `revisions` —— 每次内容变更（含正文增删）追加一条（时间 + 新哈希 + 旧哈希），保留完整修订链。
- 页面展示：作品页顶部「本站首发」条、章节目录每一项的首发日期与「全文」标记、
  阅读页标题下的首发 / 全文首发 / 修订时间与版权声明。
- AI / 搜索引擎可见：作品级 JSON-LD 注入 `datePublished` / `dateModified` / `copyrightHolder`；
  阅读页与每章静态存档页注入 `schema.org/Chapter`，带本章 `datePublished`、`wordCount`。
- 全本静态存档页：`chapters/<作品>/<章号>.html`，纯中文、不依赖 JavaScript，
  含完整正文、首发时间、版权声明与结构化数据；`sitemap.xml` 收录全部 45 章，
  `robots.txt` 指向 sitemap，`llms.txt` 给 AI 一份作品与章节入口清单。
- 第三方时间证据：每次发布把 `posts.json` 一起提交到公开 GitHub 仓库 —— git commit 时间、
  Pages 部署记录、搜索引擎收录与网络存档可交叉印证；页脚「首发存证」链接直接指向 `posts.json`，
  任何人都能核对。
- 说句实在的：站点自己写的时间戳只是第一层证据（作者可自行生成）。
  要更硬，发布后把 `https://moburu.vip/posts.json` 提交到 Wayback Machine 存档，
  或对该文件做可信时间戳 / 公证 / 区块链存证，那才是第三方背书的第二层。

---

## 八、付费端口（预留，未开放）

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
CNAME             自定义域名绑定 = moburu.vip
assets/js/data.js 全站内容（作品/章节目录/小传/5 语言文案）
assets/js/posts.js 首发时间戳数据（自动生成，勿手工改）
assets/js/app.js  渲染逻辑（i18n / 语言切换 / 按章加载正文 / 付费锁 / JSON-LD）
assets/css/style.css  深色工业 + 山海经神秘基调
assets/img/avatar.jpg 作者头像
chapters/henchangsha/*.json  45 章正文真源（改稿只动对应章）
chapters/henchangsha/*.html  45 个静态全文存档页（脚本生成）
chapters/henchangsha/index.json  章节清单与全书字数
posts.json        首发存证（公开文件，自动生成，供查证/AI 抓取）
sitemap.xml / robots.txt / llms.txt  搜索引擎与 AI 入口（脚本生成）
tools/publish.js  发版脚本：打首发时间戳 + 内容哈希 + 修订记录
tools/build-pages.js 生成静态存档页 / sitemap / robots / llms
```
