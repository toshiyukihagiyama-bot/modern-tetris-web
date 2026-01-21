# Firebase Hosting デプロイメントガイド

## プロジェクト情報

- **プロジェクトID**: `modern-tetris-2026`
- **プロジェクト名**: Tetris Game 2026
- **ホスティング**: Firebase Hosting
- **アカウント**: toshiyuki.hagiyama@aozora-cg.com

## 前提条件

- Node.js がインストールされていること
- Firebase CLI がインストールされていること（`npm install -g firebase-tools`）
- Firebase にログイン済みであること

## デプロイ手順

### 1. 初回セットアップ（既に完了）

プロジェクトには以下のFirebase設定ファイルが既に含まれています：

- `.firebaserc` - プロジェクトエイリアス設定
- `firebase.json` - Hosting設定

### 2. ビルド

```bash
# 依存関係のインストール（初回のみ）
npm install

# プロダクションビルド
npm run build
```

ビルドが成功すると、`dist/` ディレクトリに最適化されたファイルが生成されます。

### 3. デプロイ

```bash
# Firebase にログイン（未ログインの場合）
firebase login

# プレビュー（オプション）
firebase serve

# 本番環境にデプロイ
firebase deploy --only hosting
```

### 4. デプロイ後の確認

デプロイが成功すると、以下のようなURLでアクセスできます：

- **Hosting URL**: https://modern-tetris-2026.web.app
- **カスタムドメイン**: https://modern-tetris-2026.firebaseapp.com

Firebase Console: https://console.firebase.google.com/project/modern-tetris-2026

## クイックデプロイコマンド

```bash
# ビルド + デプロイを一度に実行
npm run build && firebase deploy --only hosting
```

## トラブルシューティング

### 認証エラーが出る場合

```bash
firebase login --reauth
```

### ビルドエラーが出る場合

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### デプロイ先を確認する場合

```bash
firebase projects:list
firebase use
```

## Firebase Hosting の設定内容

### 公開ディレクトリ

`dist/` - Vite のビルド出力先

### キャッシュ設定

- 画像ファイル（jpg, png, svg等）: 1年間キャッシュ
- JS/CSSファイル: 1年間キャッシュ
- HTML: キャッシュなし（常に最新版を取得）

### リライトルール

すべてのルートを `index.html` にリダイレクト（SPA対応）

## CI/CD セットアップ（オプション）

GitHub Actions を使用した自動デプロイを設定する場合：

```bash
firebase init hosting:github
```

これにより、プッシュ時に自動的にビルド＋デプロイが実行されます。

## セキュリティ

- Firebase設定ファイルはGitにコミットされています（公開情報のみ）
- `.firebase/` ディレクトリと `firebase-debug.log` は `.gitignore` で除外されています
- 認証トークンは環境変数として管理してください

## コスト

Firebase Hosting の無料枠：

- 10 GB ストレージ
- 360 MB/日 転送量
- カスタムドメイン対応

通常、小規模なゲームプロジェクトなら無料枠内で運用可能です。

## 関連リンク

- [Firebase Hosting ドキュメント](https://firebase.google.com/docs/hosting)
- [Firebase Console](https://console.firebase.google.com/)
- [使用状況の確認](https://console.firebase.google.com/project/modern-tetris-2026/usage)
