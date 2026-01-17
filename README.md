# Summary Editor

PDFと授業ノートを並べて編集できる、Tauriベースのデスクトップアプリケーションです。

## 特徴

- 📄 **PDF表示**: PDFファイルを読み込んで表示
- 📝 **Markdown編集**: リアルタイムMarkdownエディタ
- 🗂️ **ワークスペース**: ローカルフォルダーでPDF・MDファイルを管理
- ↔️ **リサイズ可能なレイアウト**: PDF表示とノート編集の領域を自由に調整
- 🔄 **自動更新**: 新しいバージョンが利用可能になると自動通知

## インストール

### リリースからダウンロード

[Releases](https://github.com/あなたのユーザー名/summary-editor/releases)から最新版をダウンロードしてインストールしてください。

- **Windows**: `summary-editor_x.x.x_x64-setup.exe`  または `summary-editor_x.x.x_x64_en-US.msi`
- **macOS**: `summary-editor_x.x.x_aarch64.dmg` (Apple Silicon) または `summary-editor_x.x.x_x64.dmg` (Intel)
- **Linux**: `summary-editor_x.x.x_amd64.AppImage` または `summary-editor_x.x.x_amd64.deb`

## 開発

### 必要な環境

- [Node.js](https://nodejs.org/) (v18以上)
- [Rust](https://www.rust-lang.org/) (最新安定版)
- **Windows**: [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) (C++によるデスクトップ開発)

### セットアップ

```bash
# 依存関係をインストール
npm install

# 開発モードで起動
npm run tauri dev

# ビルド
npm run tauri build
```

### ビルド成果物

ビルド後、以下の場所に出力されます：
- `src-tauri/target/release/summary-editor.exe` (実行ファイル)
- `src-tauri/target/release/bundle/` (インストーラー)

## 使い方

1. **ワークスペースを開く**: サイドバーの「開く」ボタンでフォルダーを選択
2. **ファイルを選択**: サイドバーからPDFまたはMarkdownファイルをクリック
3. **ノートを作成**: 「新規ノート」ボタンで新しいMarkdownファイルを作成
4. **編集**: PDFを見ながらリアルタイムでノートを編集

## 自動更新

アプリは起動時に自動的に更新をチェックします。新しいバージョンが利用可能な場合：
- 右上のバージョンバッジに赤い通知が表示されます
- バージョン履歴を開くと、「今すぐ更新」ボタンが表示されます
- ボタンをクリックすると、自動的にダウンロード・インストールされます

## リリース方法

```bash
# バージョンタグを作成してプッシュ
git tag v0.2.0
git push origin v0.2.0
```

GitHub Actionsが自動的に以下を実行します：
1. Windows/macOS/Linux用のビルド
2. インストーラーの生成
3. GitHub Releasesへのアップロード
4. アップデーター用の`latest.json`の生成

## 技術スタック

- **フレームワーク**: [Tauri](https://tauri.app/) v2
- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: TailwindCSS
- **エディタ**: [Milkdown](https://milkdown.dev/) (Markdown)
- **PDFビューアー**: [react-pdf](https://github.com/wojtekmaj/react-pdf)

## ライセンス

MIT
