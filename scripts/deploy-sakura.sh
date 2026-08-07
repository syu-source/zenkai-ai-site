#!/bin/sh
# ZENKAI AIサイトをさくらサーバへデプロイする（静的ファイルのみ）。
# 前提: ~/.ssh/config に Host zenkai-sakura が定義済みで、公開鍵がサーバに登録済み。
# 使い方: sh scripts/deploy-sakura.sh
# 仕組み: サイト公開に必要なファイルだけをステージングに集め、rsync --delete でミラーする。
#         内部文書（CLAUDE.md / PROJECT_PLAN.md / worklog.md / handover/ / research/ / docs/ /
#         templates/ / .git / .claude / スクリプト類）は絶対にサーバへ上げない。

set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STAGING="${TMPDIR:-/tmp}/zenkai-deploy-staging"
REMOTE="zenkai-sakura"
REMOTE_DIR="/home/abc-materia/www/zenkai-os04"

rm -rf "$STAGING"
mkdir -p "$STAGING"

cd "$PROJECT_DIR"

# 公開対象（ホワイトリスト方式）
cp index.html cases.html company.html contact.html download.html pricing.html privacy.html gate.html .htaccess robots.txt sitemap.xml "$STAGING/"
cp -R css js assets lp services industries cases api "$STAGING/"

# 万一の混入チェック: ステージングに内部文書が無いことを確認
for bad in CLAUDE.md PROJECT_PLAN.md worklog.md handover research docs templates .git .claude; do
  if [ -e "$STAGING/$bad" ]; then
    echo "ERROR: internal file leaked into staging: $bad" >&2
    exit 1
  fi
done

echo "--- staging contents ---"
find "$STAGING" -maxdepth 1 | sort

ssh "$REMOTE" "mkdir -p $REMOTE_DIR"
# api/config.php はサーバ側の秘密情報。--delete で消えないよう保護する。
rsync -az --delete --filter='P api/config.php' "$STAGING/" "$REMOTE:$REMOTE_DIR/"

echo "--- deployed. verify: ---"
echo "https://abc-materia.sakura.ne.jp/zenkai-os04/"
