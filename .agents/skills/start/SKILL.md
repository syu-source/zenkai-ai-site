---
name: start
description: Resume work by loading the most recent handover document and picking up where the previous session left off. Use this whenever the user says "start", "スタート", "resume", "continue where we left off", "load the handover", "続きから", or begins a session intending to continue earlier work. Make sure to use this skill whenever the user wants to restart or continue prior work based on a handover, even if they don't say the exact word "start".
---

# Start — 引き継ぎ書を読んで作業を再開する

前回の作業を、`/handover` で残した引き継ぎ書をもとに再開するためのスキル。`handover/` フォルダから**最新の引き継ぎ書を自動で見つけて全文を読み**、要点を整理してユーザーに確認したうえで、次の作業に入る。目的は、別セッション・別モデルでもスムーズに続きを始められること。

## 手順

### 1. 最新の引き継ぎ書を見つける

現在の作業フォルダの `handover/` から、ファイル名でソートして最も新しいものを選ぶ。引き継ぎ書のファイル名には時刻が入っている（例: `handover_2026-07-09_15-42-33.md`）ので、**名前順の末尾＝最新**になる。これがファイル名に時刻を入れている理由。

```bash
python3 - "$PWD" << 'PY'
import sys, os, glob
base = sys.argv[1]
d = os.path.join(base, 'handover')
if not os.path.isdir(d):
    print('NO_HANDOVER_DIR')
else:
    files = sorted(glob.glob(os.path.join(d, 'handover_*.md')))
    if not files:
        print('NO_HANDOVER_FILE')
    else:
        latest = files[-1]
        print(f'最新の引き継ぎ書: {latest}')
        print(f'他に {len(files)-1} 件の過去の引き継ぎ書があります')
PY
```

- `NO_HANDOVER_DIR` / `NO_HANDOVER_FILE` が出た場合は、引き継ぎ書が見つからない。その旨を伝え、「新規に作業を始めますか？」と尋ねる（無理に続きを捏造しない）。
- 複数ある場合は最新を採用しつつ、過去のものが何件あるか一言添える。ユーザーが特定の日時のものを指定したら、それを読む。

### 2. 全文を読む

見つけた最新ファイルを**全文**読み込む。要点だけの流し読みにしない。前回の判断理由や未解決点まで把握することが、正しく再開する鍵。

### 3. 要点をユーザーに確認する（着手前）

読み込んだ内容を、日本語で簡潔に要約して提示する。少なくとも次を含める:

- **前回の目的**（何をやろうとしていたか）
- **どこまで進んでいるか**（完了 / 検証済み / 途中）
- **次の一手**（引き継ぎ書の「次の一手」をもとにした具体的な提案）
- **注意点・未解決点**

そのうえで「この続きから進めてよいですか？」と**確認を取ってから**実作業に入る（いきなり実装しない）。優先順位や方針に変更があればここで合わせる。

### 4. 作業を再開する

合意できたら、引き継ぎ書の「次の一手」に沿って作業を進める。作業中も、大きな変更の前には確認を取る・実装後は動作確認する、という普段の進め方を守る。

## メモ

- 参照先は現在の作業フォルダの `handover/`。別の場所やファイルを指定されたらそれに従う。
- 引き継ぎ書の情報が古い可能性もあるため、コマンド名・バージョン・外部情報に依存する部分は、必要に応じて最新を確認してから進める。
- 区切りがついたら、`/handover` で新しい引き継ぎ書を残しておくと次回もスムーズ。
