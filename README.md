# 縦型チラシ自動生成システム

横型チラシから商品情報を抽出し、スマホ最適化された縦型デジタルチラシを自動生成するシステムです。

## 機能

### 必須機能
- **商品抽出機能**: AI画像認識で横型チラシから商品領域を検出
- **商品管理機能**: 抽出された商品の選択・除外・並び順変更
- **縦型レイアウト生成機能**: スマホ最適化された1カラム縦一列配置
- **プレビュー機能**: リアルタイムプレビューとスマホ表示シミュレーション
- **出力機能**: 画像（JPG/PNG）、PDF、HTML形式での出力

### 出力仕様
- 縦型サイズ: 375px × 可変高さ（スマホ基準）
- 商品画像: 横幅350px統一、縦横比維持
- 対応形式: PNG、PDF、HTML

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **ドラッグ&ドロップ**: react-beautiful-dnd
- **画像処理**: html2canvas
- **PDF生成**: jsPDF
- **アイコン**: Lucide React

## セットアップ

### 前提条件
- Node.js 18.0.0以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd vertical-flyer-generator
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで http://localhost:3000 を開く

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## 使用方法

### 1. 画像アップロード
- 横型チラシ画像（PDF/JPG/PNG）をドラッグ&ドロップまたはファイル選択
- AIが商品領域を自動検出（最大3分）

### 2. 商品管理
- 抽出された商品の選択・除外
- 商品名・価格の編集
- ドラッグ&ドロップで並び順変更

### 3. レイアウト生成
- スマホ最適化設定（横幅、余白、色など）
- リアルタイムプレビュー
- レイアウト生成実行

### 4. プレビュー
- 最終確認
- スマホ表示シミュレーション
- 仕様確認

### 5. 出力
- 画像（PNG）: 高解像度画像ファイル
- PDF: 印刷用PDFファイル
- HTML: Web表示用HTML

## 非機能要件

- **処理時間**: 1チラシあたり3分以内
- **対応ブラウザ**: Chrome, Safari, Edge最新版
- **同時処理**: 3ユーザーまで

## 制約・前提条件

- 商品の切り抜き精度は90%程度（手動調整前提）
- リンク設定は手動で後から追加
- 初期版では日本語チラシのみ対応

## 将来対応予定機能

- 価格情報の自動抽出
- 商品カテゴリの自動分類
- A/Bテスト機能
- 在庫連携
- 多言語対応

## 開発

### ディレクトリ構造
```
src/
├── components/          # Reactコンポーネント
│   ├── ImageUploader.tsx
│   ├── ProductManager.tsx
│   ├── VerticalLayoutGenerator.tsx
│   ├── Preview.tsx
│   └── OutputGenerator.tsx
├── types.ts            # TypeScript型定義
├── App.tsx             # メインアプリケーション
├── main.tsx            # エントリーポイント
└── index.css           # グローバルスタイル
```

### スクリプト

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run preview`: ビルド結果のプレビュー
- `npm run lint`: ESLint実行

## ライセンス

MIT License

## サポート

問題や質問がある場合は、GitHubのIssuesページでお知らせください。 