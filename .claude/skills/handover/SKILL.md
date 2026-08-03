---
name: handover
description: Create a handover document that captures everything done in the current session so another session or another model can seamlessly continue the work. Use this whenever the user says "handover", "引き継ぎ", "hand this off", "make a handover", when a session is getting long, when context is running low, before switching to a different model, or before ending work that will be resumed later. Make sure to use this skill whenever the user wants to record or pass on the state of ongoing work, even if they don't say the exact word "handover".
---

# Handover — 作業の引き継ぎ書を作る

セッションが長くなったとき、別のモデルで作業を再開するとき、あるいは一区切りついて後で続きをやるときのために、「これまで何をやってきたか」の要点と現状を **引き継ぎ書（Markdownファイル）** として残す。次のセッション／モデルが、この1枚を読むだけで迷わず続きを始められる状態にすることが目的。

## 絶対に守る2つのルール（最重要）

この2つは、この引き継ぎ書が後から確実に見つかり・信頼できるために不可欠。省略しないこと。

1. **必ず最初に専用フォルダを作る。** 引き継ぎ書は、現在の作業フォルダ（プロジェクト直下）の `handover/` フォルダに保存する。無ければ作成する。散逸を防ぎ、`/start` が確実に見つけられるようにするため。
2. **ファイル名そのものに日付と時刻を入れる。** 例: `handover_2026-07-09_15-42-33.md`。本文だけでなく **ファイル名** に時刻を入れることで、複数の引き継ぎ書を時系列に並べられ、`/start` が「最新」を機械的に特定できる。これが最も重要。

## さらに重要: 時刻は必ず実時刻を取得する（記憶で書かない）

日付・時刻は**絶対に記憶や推測で書かない**。必ず下記のように実際のコマンドを実行して得た値を、ファイル名にも本文にも使う。モデルは時刻を誤認しがちなので、ここは機械的に取得することが信頼性の要。

## 手順

### 1. フォルダを作り、実時刻でファイルパスを決める

まず実時刻を取得し、`handover/` フォルダを作成し、タイムスタンプ入りのファイルパスを組み立てる（値を確認するため、このコマンドの出力を必ず見ること）:

```bash
python3 - "$PWD" << 'PY'
import sys, os, datetime
base = sys.argv[1]
now = datetime.datetime.now()
days = ['月','火','水','木','金','土','日']
wd = days[now.weekday()]
ts = now.strftime('%Y-%m-%d_%H-%M-%S')
human = f"{now.year}年{now.month}月{now.day}日（{wd}）{now.hour:02d}:{now.minute:02d}:{now.second:02d}"
d = os.path.join(base, 'handover')
os.makedirs(d, exist_ok=True)
file = os.path.join(d, f'handover_{ts}.md')
print(f'保存先: {file}')
print(f'作成日時: {human}')
PY
```

- 出力された `保存先:` の行がこの引き継ぎ書の保存先（ファイル名に時刻が入っている）。
- `作成日時:` は本文の先頭に書く人間可読の作成日時。

### 2. 引き継ぎ書を書く

手順1で出力された保存先パスに、下記テンプレートで書き出す。会話の履歴を丁寧に振り返り、**次の担当（別モデルでも）がこれ一枚で続きを始められる**ことを最優先に、具体的に書く。埋められない項目は「（なし）」と明記する。

```markdown
# 引き継ぎ書

- **作成日時**: 2026年7月9日（木）15:42:33   ← 手順1で得た作成日時の値をそのまま入れる
- **作成モデル / セッション**: （例: Opus 4.8。分かる範囲で）
- **対象事業 / プロジェクト**: （ZENKAI不動産 / ABCマテリアル / どのプロジェクトか）

## 1. 目的（何をやろうとしているか）
このセッションで達成しようとしているゴールを1〜3行で。

## 2. これまでにやったこと（理由つき）
- 何をしたか。なぜそうしたか（重要な判断・選択の理由も残す）。
- 箇条書きで、時系列または論点ごとに。

## 3. 現在の状態
- 完成/動作確認済みのこと（「検証済み」か「未検証」かを明記）。
- 途中まで／未着手のこと。

## 4. 触ったファイル・場所
- 変更・作成したファイルのパスと、その役割を一言で。

## 5. 次の一手（具体的な順序で）
1. 次にやるべきことを、実行可能な粒度で順番に。
2.

## 6. 未解決の点・注意・落とし穴
- 詰まっている点、確認待ち、環境依存の注意（macOS/zsh等）、リスク。

## 7. 補足（次の担当が知っておくべきこと）
- コマンドの叩き方、前提、参考リンクなど。
```

### 3. 保存を確認して報告する

書き込み後、ファイルが実在するか確認し、ユーザーに**保存先の絶対パス**と**作成日時**を伝える。

```bash
test -f "$file" && echo "OK: exists"
```

最後に、日本語で「引き継ぎ書を作成しました」と、保存先パス・作成日時・中身の要点（3〜5行）を簡潔に報告する。

## メモ

- 保存場所は現在の作業フォルダの `handover/`。別の場所に保存したい要望があればそれに従う。
- 既存の引き継ぎ書は**上書きしない**（ファイル名に秒まで入れるので通常は衝突しない）。時系列の記録として積み重ねる。
- 続きを始めるときは `/start` を使うと、この `handover/` の最新ファイルを自動で読み込める。
