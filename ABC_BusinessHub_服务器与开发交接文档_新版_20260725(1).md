# ABC Business Hub 服务器与开发交接文档

更新日期：2026-07-25  
用途：交给负责人、开发人员或 Codex 继续维护 ABC Business Hub  
说明：本文档不保存密码、私钥或 API Key。

## 1. 生产环境

| 项目 | 当前值 |
|---|---|
| 服务商 | さくらのレンタルサーバ ビジネス |
| SSH 用户 | `abc-materia` |
| SSH 主机 | `abc-materia.sakura.ne.jp` |
| 备用主机 | `www414b.sakura.ne.jp` |
| SSH 端口 | `22` |
| SSH 认证 | 公开密钥认证 |
| Home | `/home/abc-materia/` |
| 项目目录 | `/home/abc-materia/www/businesshub` |
| 公开目录 | `/home/abc-materia/www/businesshub/public` |
| 入口 URL | `https://abc-materia.sakura.ne.jp/businesshub/` |

重要：继续开发时必须优先确认当前目录是：

```text
/home/abc-materia/www/businesshub
```

不要修改旧目录、备份目录或名称相近的其他项目。

## 2. SSH 连接

Windows PowerShell：

```powershell
ssh -p 22 abc-materia@abc-materia.sakura.ne.jp
```

进入项目：

```bash
cd /home/abc-materia/www/businesshub
pwd
```

预期输出：

```text
/home/abc-materia/www/businesshub
```

当前电脑可能使用的 SSH key：

```text
C:\Users\user\.ssh\id_ed25519
C:\Users\user\.ssh\id_ed25519.pub
```

私钥文件 `id_ed25519` 不得发送到聊天、邮件、工单或源码仓库。

推荐每位开发者生成自己的密钥：

```powershell
ssh-keygen -t ed25519
```

仅把新开发者的 `.pub` 公钥追加到服务器：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
printf '%s\n' '开发者的公钥内容' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

不要把多个公钥拼错到同一行。

## 3. 应用技术栈

线上已核验版本：

```text
PHP 8.2.31
Laravel Framework 12.62.0
MySQL 8.0
Apache 2.4
```

主要 PHP 包：

- `laravel/framework`
- `dompdf/dompdf`
- `phpoffice/phpspreadsheet`
- `smalot/pdfparser`

运行约束：

- 不使用 Docker
- 不使用 Redis
- 不依赖常驻后台进程
- 定时任务使用 Sakura CRON

## 4. 数据库

```text
DB_HOST=mysql3103.db.sakura.ne.jp
DB_DATABASE=abc-materia_businesshub
DB_USERNAME=abc-materia_businesshub
DB_CHARSET=utf8mb4
```

`DB_PASSWORD` 只保存在服务器：

```text
/home/abc-materia/www/businesshub/.env
```

禁止：

- 把 `.env` 内容贴到聊天
- 把 `.env` 下载到公共目录
- 把密码写入交接文档
- 把密钥写死在 PHP、Blade 或 JavaScript

需要确认配置项是否存在时，只检查变量名，不输出变量值。例如：

```bash
cd /home/abc-materia/www/businesshub
grep -E '^(DB_|OPENAI_|GEMINI_|GOOGLE_|MLIT_)' .env | sed 's/=.*/=[REDACTED]/'
```

## 5. 外部 API

系统可能使用：

- 国土交通省 不動産情報ライブラリ API
- OpenAI API
- Gemini API
- Google OAuth / Gmail
- Google Drive

所有密钥、Client Secret 和 Token 都必须在服务器端保存和使用。

国交省 API 的请求应由 Laravel 服务端发送，并使用：

```text
Ocp-Apim-Subscription-Key
```

浏览器前端不得直接携带 API Key。

## 6. 登录账号

本文档不记录生产账号密码。

账号管理要求：

- 使用内部正式账号
- 每位管理员使用独立密码
- 不共享通用管理员密码
- 已在聊天或旧文档中出现过的密码必须立即修改
- 离职或不再维护时撤销对应账号和 SSH 公钥

## 7. 主要线上入口

| 模块 | URL |
|---|---|
| 主页面 | `https://abc-materia.sakura.ne.jp/businesshub/` |
| 业务工具入口 | `https://abc-materia.sakura.ne.jp/businesshub/tools` |
| 帐票制作 | `https://abc-materia.sakura.ne.jp/businesshub/legacy-tools/invoice.html` |
| 运费计算 | `https://abc-materia.sakura.ne.jp/businesshub/legacy-tools/freight.html` |
| 重量票制作 | `https://abc-materia.sakura.ne.jp/businesshub/legacy-tools/weight-ticket.html` |
| 检查清单 | `https://abc-materia.sakura.ne.jp/businesshub/checklists` |
| 出勤时间汇总 | `https://abc-materia.sakura.ne.jp/businesshub/attendance` |
| 出退勤打卡 | `https://abc-materia.sakura.ne.jp/businesshub/work-clock` |
| 名片邮件营业 | `https://abc-materia.sakura.ne.jp/businesshub/card-sales` |
| 自动邮件发送 | `https://abc-materia.sakura.ne.jp/businesshub/card-sales/campaigns` |
| 不动产调查 | `https://abc-materia.sakura.ne.jp/businesshub/real-estate-researches` |
| 不动产文件管理 | `https://abc-materia.sakura.ne.jp/businesshub/realestate-files` |

## 8. 服务器主要目录

```text
app/                    Laravel 应用代码
app/Models/             Eloquent 模型
app/Services/           外部 API 与业务服务
database/migrations/    数据库迁移
resources/views/        Blade 页面
routes/web.php          Web 路由
public/                 Web 公开目录
legacy-tools/           旧版单页工具源文件
public/legacy-tools/    旧版工具公开副本
storage/                日志、缓存、生成文件和业务资料
docs/                   部署与现状资料
DEVELOPMENT_LOG.md      服务器侧开发记录
```

不动产文件管理的案件资料主要位于：

```text
/home/abc-materia/www/businesshub/storage/realestate_cases
```

## 9. 本地开发与备份资料

主要本地资料库：

```text
C:\Users\user\Documents\Codex\2026-06-17\laosi-sakura-ne-jp-www3018-sakura\outputs\ABC-BusinessHub
```

服务器早期备份镜像：

```text
C:\Users\user\Documents\Codex\2026-06-17\laosi-sakura-ne-jp-www3018-sakura\outputs\ABC-BusinessHub\BusinessHub\HTML\01_server_businesshub_backup_20260617
```

帐票本地工作文件：

```text
C:\Users\user\Documents\Codex\2026-06-15\vba-kg-5-3-1500-l\tmp\hub_ui\invoice.html
```

注意：

- 这些是历史资料或工作副本，不一定等于当前生产版本。
- 开始修改前，先从服务器下载当前文件做比较。
- 不要直接用 2026-06-17 的服务器镜像覆盖当前生产项目。

## 10. 开发前检查

连接后先执行：

```bash
cd /home/abc-materia/www/businesshub
pwd
php -v
php artisan --version
php artisan route:list
```

检查待修改文件：

```bash
ls -la
find resources/views -maxdepth 2 -type f | sort
find app -maxdepth 2 -type f | sort
```

不要先执行迁移、删除、覆盖或清缓存；应先确认当前任务和目标文件。

## 11. 修改前备份

为每次任务创建独立备份目录。Sakura 账户的登录 Shell 可能不是 Bash，因此建议直接使用明确目录名，不依赖临时变量：

```bash
mkdir -p /home/abc-materia/backups/businesshub-20260725-任务名称
```

只备份本次要修改的文件。例如：

```bash
cp /home/abc-materia/www/businesshub/routes/web.php \
   /home/abc-materia/backups/businesshub-20260725-任务名称/
cp /home/abc-materia/www/businesshub/resources/views/modules/tools.blade.php \
   /home/abc-materia/backups/businesshub-20260725-任务名称/
```

数据库变更前应另外创建数据库备份。数据库密码不要出现在命令历史或文档中。

## 12. 上传与发布

示例：上传帐票 HTML 到项目根目录的旧工具目录：

```powershell
scp -P 22 `
  "C:\Users\user\Documents\Codex\2026-06-15\vba-kg-5-3-1500-l\tmp\hub_ui\invoice.html" `
  abc-materia@abc-materia.sakura.ne.jp:/home/abc-materia/www/businesshub/legacy-tools/invoice.html
```

同步至公开目录：

```bash
cp /home/abc-materia/www/businesshub/legacy-tools/invoice.html \
   /home/abc-materia/www/businesshub/public/legacy-tools/invoice.html
```

Laravel 更新后的常用命令：

```bash
cd /home/abc-materia/www/businesshub
php artisan optimize:clear
php artisan migrate --force
php artisan route:list
```

只有存在并确认了新的 migration 时才执行：

```bash
php artisan migrate --force
```

## 13. 发布后验证

至少检查：

1. 登录是否正常。
2. 主页面和工具入口是否正常。
3. 修改模块是否正常打开。
4. 上传、保存、生成、下载是否成功。
5. 手机和桌面布局是否可用。
6. `php artisan route:list` 是否正常。
7. Laravel 日志是否出现新错误。
8. 旧工具根目录文件与 `public/legacy-tools/` 是否一致。

日志检查：

```bash
cd /home/abc-materia/www/businesshub
tail -n 200 storage/logs/laravel.log
```

不要把日志中可能包含的客户资料、Token 或请求正文直接贴进聊天。

## 14. 开发记录维护

每次上线后更新：

```text
/home/abc-materia/www/businesshub/DEVELOPMENT_LOG.md
```

建议格式：

```markdown
## YYYY-MM-DD 模块名：修改标题

- 修改原因
- 修改内容
- 涉及文件
- 数据库迁移
- 备份位置
- 验证结果
- 已知问题
```

随后同步到本地总记录：

```text
C:\Users\user\Documents\Codex\2026-06-17\laosi-sakura-ne-jp-www3018-sakura\outputs\ABC-BusinessHub\開発記録.md
```

## 15. 当前待开发功能

下一项计划是新增：

```text
画像PDF作成
```

目标功能：

- 多图片拖拽或文件选择
- 一次加入多个文件
- 多次追加文件
- 缩略图与顺序调整
- 删除、旋转等基础编辑
- 每页一张图片
- 每页多张图片
- 调整纸张、方向、边距、间距和适配方式
- PDF 页面预览
- 定稿下载

该功能截至 2026-07-25 尚未开发或上线。

## 16. 安全整改事项

由于旧交接内容曾包含密码与 API Key，应立即执行：

1. 修改旧后台密码。
2. 轮换曾公开过的国交省 API Key。
3. 检查并按需轮换其他第三方密钥。
4. 检查服务器 `authorized_keys`，移除不再使用的公钥。
5. 把生产目录中的 `.env` 备份移到 Web 根目录之外，并限制权限。
6. 搜索源码、日志和文档中是否残留明文密钥。

可进行不显示具体值的源码扫描：

```bash
cd /home/abc-materia/www/businesshub
grep -RIn --exclude='.env*' --exclude-dir=vendor \
  -E '(API_KEY|SECRET|PASSWORD|PRIVATE KEY)' \
  app config routes resources docs DEVELOPMENT_LOG.md
```

发现疑似密钥时不要复制到聊天，应在服务器上直接清理并轮换。

## 17. 给新 Codex／开发人员的开场说明

可直接使用下面这段：

> 请维护 ABC Business Hub。生产项目唯一正确目录是 `/home/abc-materia/www/businesshub`。先进行只读检查，不要读取或输出 `.env` 的值，不要修改旧目录。修改前备份具体目标文件；数据库变更必须使用 migration。发布后执行路由、页面、日志和下载验证，并更新服务器 `DEVELOPMENT_LOG.md`。旧版单页工具同时存在于 `legacy-tools/` 和 `public/legacy-tools/`，修改后必须确认公开副本已同步。
