# GitHubリポジトリセットアップ手順

## 手動でGitHubリポジトリを作成する方法

### 1. GitHubでリポジトリを作成

1. https://github.com/new にアクセス
2. 以下の情報を入力：

   **Repository name**: `modern-tetris-web`

   **Description**:
   ```
   A modern Tetris implementation with TypeScript, Canvas 2D, and 2026 best practices
   ```

   **Visibility**: Public ✓

   **Initialize this repository with**:
   - [ ] Add a README file (チェックを外す)
   - [ ] Add .gitignore (チェックを外す)
   - [ ] Choose a license (空欄のまま)

3. 「Create repository」ボタンをクリック

### 2. ローカルリポジトリとリンク

リポジトリ作成後、以下のコマンドを実行：

```bash
cd /home/toshiyukihagiyama/2025-12-24.AI

# リモートリポジトリを追加（GitHubのユーザー名に置き換えてください）
git remote add origin https://github.com/YOUR_USERNAME/modern-tetris-web.git

# プッシュ
git push -u origin main
```

### 3. リポジトリのAbout設定（推奨）

GitHubのリポジトリページで：

1. 右上の⚙️アイコンをクリック
2. 以下を設定：
   - **Description**: A modern Tetris implementation with TypeScript, Canvas 2D, and 2026 best practices
   - **Website**: (空欄でOK、後でGitHub Pagesを設定する場合に追加)
   - **Topics**:
     - `tetris`
     - `typescript`
     - `canvas`
     - `game`
     - `vite`
     - `web-game`
     - `2d-game`

---

## または、GitHub CLIを使う方法（自動化）

GitHub CLIがインストール済みの場合：

```bash
cd /home/toshiyukihagiyama/2025-12-24.AI

# GitHubにログイン
gh auth login

# リポジトリ作成＆プッシュ
gh repo create modern-tetris-web --public --source=. --remote=origin --description="A modern Tetris implementation with TypeScript, Canvas 2D, and 2026 best practices" --push
```

---

## 完了後の確認

リポジトリのURLを確認：
```bash
git remote -v
```

リポジトリにアクセス：
```
https://github.com/YOUR_USERNAME/modern-tetris-web
```
