# worklog

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
