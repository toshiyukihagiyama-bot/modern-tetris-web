# テトリスWebゲーム - アーキテクチャ概要

## 目的

このドキュメントは、モダンなWebテクノロジーを使用したテトリスゲームの全体アーキテクチャを定義します。

## システム構成

```
┌─────────────────────────────────────────┐
│           User Interface Layer          │
│  (Canvas Rendering + DOM Controls)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Game Controller Layer            │
│  (Input Handling + Game Loop)           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Game State Layer                │
│  (State Management + Game Logic)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Domain Model Layer             │
│  (Board, Piece, Matrix)                 │
└─────────────────────────────────────────┘
```

## レイヤー説明

### 1. User Interface Layer（UI層）
- **責務**: ゲームの視覚的表現とユーザー入力の受付
- **技術**: HTML5 Canvas 2D API, DOM
- **主要コンポーネント**:
  - `Renderer`: ゲーム盤面の描画
  - `UIControls`: ボタンやスコア表示などのDOM要素

### 2. Game Controller Layer（コントローラー層）
- **責務**: ゲームループの管理と入力の処理
- **主要コンポーネント**:
  - `GameLoop`: requestAnimationFrame を使用したメインループ
  - `InputHandler`: キーボード/タッチ入力の処理

### 3. Game State Layer（状態管理層）
- **責務**: ゲーム状態の管理と状態遷移
- **パターン**: Finite State Machine + Pub/Sub
- **状態**:
  - `MENU`: 初期画面
  - `PLAYING`: ゲーム進行中
  - `PAUSED`: 一時停止
  - `GAME_OVER`: ゲーム終了

### 4. Domain Model Layer（ドメインモデル層）
- **責務**: ゲームのコアロジックとビジネスルール
- **主要エンティティ**:
  - `Board`: ゲーム盤面（20行 × 12列）
  - `Piece`: テトロミノ（7種類の形状）
  - `Matrix`: 2次元配列による状態表現

## データフロー

1. ユーザー入力 → InputHandler
2. InputHandler → Game State (状態更新)
3. Game State → Domain Model (ロジック実行)
4. Domain Model → Game State (結果を返す)
5. Game State → Renderer (描画指示)
6. Renderer → Canvas (画面更新)

## 技術スタック

- **言語**: TypeScript 5.x
- **ビルドツール**: Vite (ESBuild ベース)
- **レンダリング**: Canvas 2D API
- **状態管理**: Proxy ベースのリアクティブシステム
- **テスト**: Vitest, Playwright

## パフォーマンス考慮事項

1. **メモリ管理**
   - ゲームループ内でのオブジェクト生成を避ける
   - オブジェクトプールパターンの使用
   - イベントリスナーの適切なクリーンアップ

2. **レンダリング最適化**
   - ダーティフラグによる差分描画
   - requestAnimationFrame による適切なフレーム制御
   - オフスクリーンキャンバスの活用

3. **型付き配列**
   - パフォーマンス重視のデータには Typed Arrays を使用

## 開発原則

1. **関心の分離**: 各層は明確な責務を持つ
2. **疎結合**: Pub/Sub パターンによる依存性の最小化
3. **テスタビリティ**: ピュアな関数とDI可能な設計
4. **型安全性**: TypeScript による静的型チェック
5. **シンプルさ**: 過度な抽象化を避け、必要最小限の設計

## 参考資料

- [JavaScript/TypeScript Game Engines in 2025](https://gamefromscratch.com/javascript-typescript-game-engines-in-2025/)
- [Why TypeScript Development Powers Scalable Web Apps in 2026](https://eleorex.com/why-typescript-development-is-the-game-changer-for-scalable-web-apps-in-2026/)
- [JavaScript Game Foundations - State Management](https://codeincomplete.com/articles/javascript-game-foundations-state-management/)
- [Designing and creating the Tetris game in Typescript](https://medium.com/@paulosales_17259/designing-and-creating-the-tetris-game-in-typescript-9ab6ee7e5cf1)
