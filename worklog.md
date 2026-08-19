# worklog

## 2026-08-19 代表复归：修正版部署上线＋合并main（步骤1、2完成）
- 代表（朱文彬）8/16复归后指示逐步接手，批准执行
- 部署: os04-review修正版（2077cb8）替换服务器上8/3违规旧版；线上检收全绿＝「開発実績」标题、8件卡片、3件否决案例404、关键页/OGP/代表照全200、表单接口无token正确403、api/config.php完好（rsync保护规则生效）
- 合并: os04-review-20260803 → main（fast-forward至2077cb8）并push；GitHub Pages预览随之更新
- 待代表提供/决策（网站即可再进一步）: ①保守/伴走范围与费用感 ②IoT・オンプレ价格下限 ③ieYou数据担保表述 ④zenkai-os.jp域名/品牌 ⑤正式域名取得→挂载→noindex解除（上线开关清单在.htaccess注释）

## 2026-08-08 遗留项收尾（TikTok母数/OGP图/提醒机制）＋代表回归待办固化
- [決策] 用户（同事侧）指示：①保守费用感②IoT・オンプレ价格下限③ieYou数据担保→**等老板8/16后回来亲自定，Claude届时主动提醒**（已存memory＋本地定时任务2026-08-17 09:30双保险）；TikTok案例母数=日均约80件（用户提供）；代表照处理版定稿
- TikTok案例页補記「1日あたり約80件の出荷に対して」（80件→2〜3h→10分，成果数字有了分母）
- assets/ogp.png替换：原为onprem案例封面复制品（2.2MB无关图）→PIL新制品牌OGP（1200×630、51KB、深紺渐变+シアン装饰+ヒラギノ字体、目视验收通过）
- 确认同事已完成：LP5处CTA和download页接入contact表单（form-placeholder清零）、TimeRex引用清零（自建表单方案取代）
- PROJECT_PLAN.md变更履历补记（7/26起）＋PHP表单架构追认待定＋代表回归5项遗留决策固化
- 状态：审核分支os04-review-20260803已含全部修复，**仍未合并main、未部署**——等代表批准

## 2026-08-07 OS04审核版：定性修正＋信任改进两轮实装（审核分支上，未合并main未部署）
- [決策] 用户4项拍板：①案例统一「開発実績」定性（不再自称導入事例）②下架3件被否决前公司案例（virtual-try-on/multilingual-agent/sales-trade-marketing）③ZENKAI OS品牌暂不采用、页面可见文字回退ZENKAI AIパートナーズ（zenkai-os.jp域名URL暂留、挂域名前再定）④电话054-266-6808确认真实、写入CLAUDE.md事实基准
- 第一轮实装（sonnet子代理）：3案例下架（11→8件）；全站「導入事例→開発実績」（title/badge/breadcrumb/导航/footer）；案例页trust-note统一「当社開発チームが手がけた開発実績」口径；api邮件模板品牌回退；CONTACT_TO_EMAIL默认改info@zenkai-fudosan.com；sitemap死链修复（/cases/、/contact/→实际html，30条全核对）；contact的✓改SVG mask；.htaccess加「本番公開時必ず削除」noindex注释；deploy脚本白名单补cases/api/robots/sitemap＋rsync加--filter='P api/config.php'保护服务器配置；代表照AI感处理（选v1、960px+胶片颗粒σ5+暖调+JPEG q82、2.1MB→270KB）；assets/cases未引用PNG全清（仓库瘦身约40MB）
- 5人格信任审查（金属加工社长/食品工厂长/物流部长/不动产同行社长/塑料二代专务，并行子代理）：高频不信任点＝假客户合照占位（「差し替え予定」标签当实绩公开）、首页「実績少」vs案例页11件的自相矛盾、ieYou中国拠点藏太深与机密主张矛盾、要相談无价格下限、电话必填吓退谨慎派、FDE/RAG黑话；高频加分点＝数据出典标注、90日削除承诺、不做申请代行、宅建免许可查
- 第二轮实装（sonnet子代理，仅做不需新事实的项）：假合照figure×3＋placeholder图删除；index自社実践口径改写（区分「导入支援待积累」与「開発実績已公开」，消除矛盾）；marquee术语通俗化（生成AI/業務自動化/社内データ活用AI/伴走支援）；PoC/LIMS首现加日文括注；contact页新增「お電話でのご相談」块（054-266-6808前置）；表单降门槛（电话任意化、相談内容10字下限撤销＋示例placeholder，HTML/JS/PHP三层校验同步）；onpremise/automation两页FAQ新增开发体制说明（既有口径前置+链会社概要）；LP footer加「運営会社について」退路
- 検収（主会話独立验证）：emoji=0、「差し替え予定」=0、導入事例自称=0、ZENKAI OS残留=0、案例8/8、sitemap全对应、sh -n通过、表单phone.required=false/msg minlength=1实测、contact电话块/開発実績页/index口径截图目视OK、代表照前后对比目视OK
- 遗留（需用户提供事实才能补的信任要素）：保守标准范围与费用、IoT/オンプレ价格下限、ieYou数据保管场所/权限的技术担保表述、工程师体制人数、TikTok案例处理件数母数、补助金不採択时费用模式、真实客户合照/证言
- [注意] 仍未合并main、未部署服务器——等用户批准

## 2026-08-03 OS04审核版同步
- [分支] `os04-review-20260803`：保留 `main` 原版不变，将当前OS04完成版作为同事审核用新版同步。
- 新版包含：11件真实导入事例及详情页、案例图片、代表者照片、Google Maps嵌入、安全附件表单、多标签页CSRF修复、Sakura PHP邮件发送。
- 安全处理：服务器专用 `api/config.php` 与密钥未进入仓库，只保留 `api/config.example.php`；正式覆盖须在同事确认后另行合并。

## 2026-07-21
- 项目启动。3项市场调研完成（日本B2B AI需求／中国AI变现赛道／静冈本地+ZENKAI品牌），要点存 research/市場調査メモ.md
- [決策] 用户4项确认：①品牌＝ZENKAI旗下子品牌（工作名 ZENKAI AI パートナーズ仮） ②目标客户＝全业种基底＋制造业/不动产/地场产业重点页 ③LP钩子＝無料AI診断＋補助金提案 ④技术＝纯静态站＋Googleフォーム＋TimeRex嵌入，无后端无CRM
- [決策] FDE用语对客户改称「AIエンジニア常駐・伴走支援」；事例严禁捏造，仅自社実践＋明记想定シナリオ
- git init 完成（main）
- PROJECT_PLAN.md / CLAUDE.md 作成 → **待用户实装审批**

## Phase A 基盤（実装）
- 作成: css/design-system.css（デザイントークン・header/footer/ボタン/カード/FAQ/フォーム/CTA/パンくず/バッジ等の共通コンポーネント）、js/main.js（モバイルメニュー・スクロール淡入・平滑スクロール、無依存）
- 作成: assets/logo.svg（白背景用）、assets/logo-white.svg（紺背景用、footer/dark section用に追加作成）、assets/fuji-line.svg、assets/favicon.svg、assets/icons/配下10種類（consulting/engineer/tool/dx/sfa/iot/training/inspection/realestate/subsidy）
- 作成: templates/page-template-root.html、templates/page-template-sub.html、templates/style-guide.html
- [重要] 自己検証で3件の実バグを発見・修正（design-system.css内）:
  1. `.hamburger`/`.header-cta` の表示切替がCSSソース順の影響で効かず、デスクトップ幅でもハンバーガーが残る／モバイル幅でも無料相談ボタンが残る問題 → 該当ルールを `.header-actions` 配下のより高詳細度セレクタに変更して解消
  2. モバイルメニュー（.nav-mobile, position:fixed）が `.site-header` の `backdrop-filter` によって contain block を書き換えられ、フルスクリーンパネルではなく高さ64px程度に潰れる重大バグ → `.site-header` から backdrop-filter を削除（背景を不透明寄りのrgba(255,255,255,0.97)に変更）して解消。CLAUDE.mdに準じてheader系に今後backdrop-filterを使わない旨をCSSコメントで明記。
  3. footerロゴ（logo.svg、ZENKAIテキストが#0B1E3A固定）が紺色footer背景（--color-navy #0B1E3A）上で実質不可視だった問題 → assets/logo-white.svg を新規作成し、footerおよび紺背景コンテキストではこちらを使用するようテンプレートを修正
- 検証方法の注意: `chrome --headless --screenshot --window-size=<500px未満>` はビューポート幅に500px床(floor)バグがあり、モバイル幅を正しく検証できないことが判明。CDP (Emulation.setDeviceMetricsOverride) を直接操作するNode.jsスクリプトで回避し、真の390px幅で検証した。
- 検証結果: 桌面(1280)・モバイル(390)ともにフルページ截图で確認、emoji=0（perl正規表現スキャン）、全SVGはXML妥当性確認済み、HTMLタグ対応も確認済み、console error/warning=0、モバイルメニューの実際のクリック動作もCDP経由で確認済み。リンクパスはPROJECT_PLAN 4章のファイル名一覧と一致確認済み。
- 未了事項: 実ページ（index/services/industries/cases/pricing/company/download/contact/privacy、LP）は未作成（Phase B以降）。OGP画像(assets/ogp.png)は未作成のためテンプレートのog:imageはプレースホルダーURL。Googleフォーム/TimeRex埋め込みURLは未確定。

## Phase E 検収（主会話が自ら実施）
- [修正] サービス頁ファイル名不一致（テンプレfooter等の engineer/tool/dx/realestate.html → 実体ファイル名 engineer-support/automation-tools/dx-google/real-estate-ai.html、全站103箇所を一括置換）
- [修正] LPのCTAアンカー #form-placeholder が未定義だった問題（最終CTA直前にアンカー追加）
- [決策] 数字出典の是正：62%の出典は帝国データバンクではなく中小企業基盤整備機構2026年3月調査（LP/トップ/製造業頁/白皮书を修正）。「静岡県製造業DX着手率13.3%」は一次出典を確認できず廃棄し、帝国データバンク静岡支店2023年調査の「県内企業DX取組率17.1%」に差し替え。トップの「検討中含めても18.6%」の誤記も39.0%に是正。
- [修正] 公開頁に内部文書名「市場調査メモ」が出典として7箇所露出 → 「静岡県公表資料」「各社公表情報」に置換
- [修正] トップの FDE 英語表記 Field Deployed Engineer → Forward Deployed Engineer
- 検収：全站リンク・アンカー検査 問題0（1208参照）、emoji=0、代表8頁+モバイル2頁のスクリーンショットを主会話が目視確認

## V2 全站视觉重做（2026-07-21 用户反馈「太难看」后）
- [決策] 用户确认：深色科技风／全站20页一次性重做／静态HTML+GSAP・ScrollTrigger・Lenis・three.js（CDN固定版本）
- 基盘重写：design-system.css（深色tokens/玻璃卡/发光/marquee/stat）、js/effects.js（reveal/counter/tilt/magnetic/光标光晕）、js/hero-bg.js（three.js粒子，仅首页+LP）、logo/富士山SVG霓虹重绘
- 20页全部重做，内容层（文案/数字/出典/占位符/链接）与V1逐字一致
- 检收：1109引用0死链、emoji=0、占位符14处全数保留、10页截图主会话目视通过
- 已知未确认项：three.js粒子背景在headless环境无法实际渲染，需真实浏览器最终确认（有静默降级，不影响内容）
- V2.1: 色調を一段明るく（--color-bg #05070F→#0D1424等）、.cardの全体クリック化（js/main.js initClickableCards）

## 2026-07-25 图片强化＋富士山修复
- [修正] hero富士山图形残缺（用户报告「缺了山峰」）：原因＝SVG preserveAspectRatio slice + CSS max-height:40% 导致按宽放大后从顶部裁切，山顶正好被裁掉；且原画法为锯齿山脉不似富士山。重画为标志性富士山轮廓（宽缓裾野曲线+雪冠八の字+宝永山），SVG改meet、CSS去掉max-height（附注释防复发）
- 图片三方案落地（上次会话确认）：①assets/illustrations/ 10张服务场景SVG插画（服务页头左文右图集成）②assets/photos/ 5张Pexels商用照片（行业3页/事例/資料DL的hero背景+深色遮罩，许可与出处记录 docs/写真クレジット.md，均标注建议换自社实拍）③真实照片位3处（首页自社実践/会社概要两卡片，【要差し替え】占位）
- 检收：10插画SVG全部valid、emoji=0、代表页截图目视通过（插画/照片/富士山）
- [修正] 富士山V3：用户反馈V2修复版太圆润（酒瓶感）→ 恢复原锯齿山脊轮廓（山顶补齐不再被裁），升级为数码宝贝进化风低多边形线框：三角网格+微光切面+顶点明灭节点+山顶上升数据粒子（CSS动画、respect prefers-reduced-motion）；hero-fuji透明度0.55→0.72
- [修正] 富士山V4：按实照重画轮廓（宽裾野+凹型斜面贝塞尔曲线+近水平火口缘+雪形锯齿线），线框网格/发光节点/上升粒子保留
- [修正] 富士山V5：山体加厚（火口缘宽度600→840、中腹加宽、坡度放缓），裾野铺满全幅
- [修正] 富士山V6（定稿方向）：轮廓回退到最初版锯齿山脊（V3坐标不变），特效大幅强化＝山脊双色流光扫描（stroke-dash动画）+山顶三重进化光环扩散+网格切面顺序闪烁（数字拼装感）+山体内数据流上升+粒子增量；prefers-reduced-motion时全部静止且流光/光环隐藏
- [修正] 卡片纵向错位bug：tilt动画的overwrite:true会中途杀死入场stagger动画导致卡片冻结在位移中间态。修复＝①reveal完成时clearProps清除内联transform/opacity（终点必回归CSS布局）②入场未完成的卡片挂data-reveal-pending，tilt的move/leave一律跳过
- [決策] 数据更新（用户指出2023年数据太旧）：静冈县限定DX调查最新仅到2023年（TDB静岡未再做），站内第三张统计卡改用中小機構「中小企業のDX推進に関する調査(2025年)」（2026-02-06公表、2025年12月調査、n=1000）：既に取組18.9%・取組む予定なし31.5%。index/manufacturing/白皮书/调研备忘同步更新

## 2026-07-26 技術パートナーieYou Tech実績の掲載
- [決策] 内容取舍：①采用＝ieYou本体4案例（ドローン証跡/研究機関データ基盤/オンプレミスAI/AI制作システム、匿名维持・地名省略）＋ZENKAI自身受训自建AI助手的故事（写入自社実践）②不采用＝创始人前公司项目（乳业/客服/奢侈品）、「北京」等地名、「ZENKAI OS」品牌名、区块链术语
- [決策] ieYou是提携先非集团成员：company.html在グループ構成之外独立设「テクノロジーパートナー」区块；正式社名（Ma'anshan/亦友科技）小字如实注记；数据处理表述为「案件ごとに契約で明確に取り決め」（不做未授权承诺）
- cases.html：新增③「開発パートナーの実績」区（badge-partner青色、4卡、注记明示为ieYou実績非当社導入実績）；自社実践区新增AI助手自建panel
- 检收：截图目视OK、emoji=0、cases.html#partner锚点通（company.html引用）

## 2026-07-26 第11服务「オンプレミスAI構築」追加
- 新規: services/onpremise-ai.html、assets/icons/onpremise.svg、assets/illustrations/onpremise.svg
- 接入: 全站23文件footer链接、首页服务卡（11件目）、pricing.html表行+件数表述、PROJECT_PLAN 3.4表
- 内容要点: 数据不出社内的プライベートAI、HW选定调达代行、引き継ぎ前提、ieYou共同体制注记、补助金可能性（附公募要领注意）、FAQ含「クラウド比性能」诚实回答
- 检收: 1202引用0死链、emoji=0、SVG valid、桌面+移动截图目视OK

## 2026-07-26 補助金サービス定位調整（自社不做申请代行→専門家連携）
- [決策] 用户指示：补助金不直接提供，与外部合作。合规背景：申请支援需認定経営革新等支援機関资质、书类代作涉行政書士法
- [決策] 提携候补＝株式会社ライツコンサルティング（袋井市、代表取締役 辻拓真、認定経営革新等支援機関第74号、支援500社+/約30億円）——**未正式协议前不在公开页上名**，站内用「提携専門家（認定経営革新等支援機関等）」通用表述，subsidy.html留HTML注释占位
- 全站改名：補助金申請サポート→補助金活用サポート（25文件）
- subsidy.html重写：当社担当＝制度整理+技术要件整理+橋渡し（无料相談から）／提携専門家担当＝书类作成支援・申请手续（费用另计、契约前明示）；明记「当社は申請書類の作成代行・申請代行は行いません」；役割分担notice、FAQ、進め方、料金表两行制同步更新
- index卡片/pricing表行/PROJECT_PLAN 3.4同步更新

## 2026-07-31 GitHub Pages临时公开链接加密码门
- 新規: gate.html（密码输入页、单体自包含不依赖design-system.css、noindex）、js/gate.js（会话级门禁）
- 机制: 仅在 *.github.io 域名生效（本地预览/本番域名不受影响）；密码以SHA-256哈希存码内不存明文；sessionStorage记住会话；gate.html带open redirect防护（仅允许站内绝对路径）
- 接入: 全22公开页<head>最前部插入gate.js（templates 3文件不接入）
- 新規: .gitignore（handover/ 不push到公开仓库——内含提携先未公开信息；.DS_Store）
- [注意] 静态托管的前端门禁可被读源码绕过，仅作临时预览的简易防窥，非正式安全措施
- 检收（真实浏览器实测GitHub Pages线上）: 直访子页被拦截跳gate、错误密码显示「パスワードが違います。」、正确密码跳回原请求页、同会话再访问首页不再要密码。附带确认：three.js粒子背景在真实浏览器正常渲染（此前headless未确认项就此关闭）

## 2026-07-31 二人协作体制搭建（同事另一台电脑加入开发）
- [決策] 用户确认：同事电脑共用 syu-source GitHub账号（gh auth login同号）；公开仓库内部文档（含ライツ社名的worklog等）**不清理维持现状**（用户知悉公开状态并接受）；现有公开仓库直接作为协作主仓库
- 新規: .claude/skills/handover/、.claude/skills/start/（个人技能复制进项目随仓库同步，两台电脑都能用/handover /start）
- 变更: .gitignore解除handover/忽略（交接书是跨电脑传上下文的桥梁，随仓库共享；敏感度与用户决定保留的worklog同级）
- 新規: docs/协作开发指南.md（同事上手步骤：gh登录/克隆/git config真名/Claude Code登录/日常pull-start-handover-push流程/注意事项）
- CLAUDE.md新增「共同開発規則」节（开工pull收工push、/handover→/start交接流、共号下git config user.name区分提交人、秘密不入仓）
- 本机git身份设定: repo-local user.name朱文彬 / info@zenkai-fudosan.com（此前为主机名自动生成值）
- [注意] 预览密码故意不写入任何仓库文件（口头传达）；同一Claude账号两人共享用量限额

## 2026-07-31 さくらサーバ部署准备（挂正式域名前的服务器落地）
- 用户提供ABC BusinessHub服务器交接文档＋Windows侧公钥；本机无对应私钥→按交接文档「每位开发者自己的密钥」原则，生成本机专用部署密钥 ~/.ssh/zenkai_sakura（ed25519）、~/.ssh/config 加 Host zenkai-sakura 别名
- 部署目标: /home/abc-materia/www/zenkai-ai/（仮URL https://abc-materia.sakura.ne.jp/zenkai-ai/；businesshub项目目录不碰）
- gate.js/gate.html 多host化: sakura.ne.jp 上也启用密码门（站点ROOT按hostname解析）；将来挂正式域名→两个规则都不匹配→密码门自动失效（即正式公开）
- 新規: .htaccess（Options -Indexes；GitHub Pages侧被忽略无害）、scripts/deploy-sakura.sh（白名单staging＋rsync --delete镜像＋内部文档混入自检，CLAUDE.md/worklog/handover/research/docs/templates/.git绝不上服务器）
- .gitignore追加: ABC_BusinessHub_*.md / id_ed25519*.pub（服务器基础设施文档不入公开仓库）
- staging本地验证: 60文件、0内部文档混入
- 公钥授权: 用户在Windows侧（已有可用密钥）执行一条ssh命令把Mac新公钥追加到服务器authorized_keys，Mac即获免密访问
- 部署完成并检收（2026-07-31 14:35）: 60文件rsync到位；curl全200、css/目录列表403（.htaccess生效无500）；真实浏览器实测＝sakura域名密码门生效→正确密码放行跳回原页→首页three.js粒子正常→services子页CSS/插画/相对路径全部正常
- 上线URL: https://abc-materia.sakura.ne.jp/zenkai-ai/（正式域名后续在さくら控制面板指向 www/zenkai-ai 文件夹）
- [決策] 文件夹改名 zenkai-ai→**zenkai-os04**（用户命名体系: 既有zenkai-os=os01、本站=os04；拼法用户选定zenkai-os04）。服务器mv＋gate.js/gate.html的sakura ROOT改/zenkai-os04/＋deploy脚本REMOTE_DIR同步→重部署
- 改名后检收: 新URL全200、旧URL 404、未授权访问正确跳/zenkai-os04/gate.html、密码放行跳回原请求页
- **最终URL: https://abc-materia.sakura.ne.jp/zenkai-os04/**（挂正式域名时指向 www/zenkai-os04）
