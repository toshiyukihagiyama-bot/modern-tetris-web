# テトリスWebゲーム - 設計ドキュメント

このディレクトリには、モダンなWebテクノロジーを使用したテトリスゲームの設計ドキュメントとArchitecture Decision Records（ADR）が含まれています。

## ドキュメント構成

### アーキテクチャドキュメント (`architecture/`)

テトリスゲームの技術アーキテクチャを詳細に説明したドキュメント群です。

#### [overview.md](./architecture/overview.md)
全体アーキテクチャの概要を説明します。

- システム構成図
- 4層のレイヤー設計（UI、コントローラー、状態管理、ドメインモデル）
- データフロー
- 技術スタック
- パフォーマンス考慮事項
- 開発原則

#### [components.md](./architecture/components.md)
主要コンポーネントの詳細設計を説明します。

- Board（ゲーム盤面）
- Piece（テトロミノ）
- GameState（ゲーム状態）
- Renderer（描画エンジン）
- InputHandler（入力処理）
- GameLoop（ゲームループ）
- PieceGenerator（ピース生成）
- コンポーネント間の依存関係
- オブジェクトプーリング

#### [state-management.md](./architecture/state-management.md)
状態管理の設計を説明します。

- Finite State Machine（FSM）による状態遷移
- ES Proxy を使用したリアクティブシステム
- Store の実装
- アクション（Actions）
- イベントシステム（Pub/Sub）
- 永続化（Local Storage）
- パフォーマンス考慮事項

#### [rendering.md](./architecture/rendering.md)
レンダリングシステムの設計を説明します。

- Canvas 2D API の使用
- レイヤー構造（背景、ゲーム、エフェクト、UI）
- Renderer クラスの実装
- アニメーション
- パフォーマンス最適化
  - オフスクリーンキャンバス
  - ダーティフラグ
  - レイヤー分割
- レスポンシブ対応
- デバッグモード

### Architecture Decision Records (`adr/`)

重要な技術的意思決定を記録したドキュメント群です。各 ADR は以下の構造を持ちます：

- **ステータス**: 採用/却下/非推奨
- **コンテキスト**: 意思決定の背景と理由
- **決定**: 何を採用したか
- **理由**: なぜその決定をしたか
- **結果**: ポジティブ/ネガティブな影響
- **代替案**: 検討した他の選択肢

#### [0001-use-typescript.md](./adr/0001-use-typescript.md)
**TypeScript の採用**

なぜ JavaScript ではなく TypeScript を使用するのか？

- 型安全性によるバグの削減
- IDE サポートの向上
- コードの自己文書化
- リファクタリングの安全性
- 業界標準

#### [0002-use-canvas-2d.md](./adr/0002-use-canvas-2d.md)
**Canvas 2D API の採用**

なぜ WebGL ではなく Canvas 2D を使用するのか？

- 2D ゲームに最適なパフォーマンス
- 開発の容易さ
- ブラウザ互換性
- デバッグとプロファイリング
- 小さなバンドルサイズ

#### [0003-state-management-pattern.md](./adr/0003-state-management-pattern.md)
**状態管理パターン（Proxy + FSM）**

なぜ Redux/MobX ではなく独自実装を使用するのか？

- ES Proxy によるリアクティブシステム
- Finite State Machine による状態遷移管理
- Pub/Sub パターンによる疎結合
- 小さなバンドルサイズ（~2KB vs ~50KB）
- 2026年のベストプラクティス

#### [0004-architecture-pattern.md](./adr/0004-architecture-pattern.md)
**レイヤードアーキテクチャの採用**

なぜこのアーキテクチャパターンを選択したのか？

- 関心の分離（Separation of Concerns）
- 4層設計：Presentation → Application → Domain → Infrastructure
- テスタビリティの向上
- 並行開発の容易さ
- 拡張性と保守性

#### [0005-use-vite.md](./adr/0005-use-vite.md)
**Vite をビルドツールとして採用**

なぜ Webpack ではなく Vite を使用するのか？

- 圧倒的な開発速度（起動: 100ms、HMR: 50ms）
- シンプルな設定
- TypeScript ファーストクラスサポート
- ESBuild による高速ビルド
- 2026年のスタンダード

## 設計思想

このプロジェクトは、2026年1月時点での Web 開発のベストプラクティスに基づいて設計されています。

### 主要な原則

1. **シンプルさ優先**
   - 過度な抽象化を避ける
   - 必要最小限の設計
   - YAGNI（You Aren't Gonna Need It）

2. **型安全性**
   - TypeScript による静的型チェック
   - Strict モードの有効化
   - 実行時エラーの最小化

3. **パフォーマンス**
   - 60 FPS の維持
   - メモリ管理の最適化
   - オブジェクトプーリング

4. **保守性**
   - 明確な責務分離
   - 疎結合な設計
   - テスタビリティ

5. **モダン技術スタック**
   - ES2022+ 機能の活用
   - ネイティブ ESM
   - ライブラリ依存の最小化

## 技術スタック概要

| カテゴリ | 技術 | 理由 |
|---------|------|------|
| 言語 | TypeScript 5.x | 型安全性、業界標準 |
| ビルドツール | Vite | 高速、シンプル |
| レンダリング | Canvas 2D API | 2D ゲームに最適 |
| 状態管理 | Proxy + FSM | 軽量、リアクティブ |
| テスト | Vitest | Vite 統合 |
| アーキテクチャ | レイヤード | 関心の分離 |

## 開発開始前に読むべきドキュメント

1. **全体像を理解する**: [architecture/overview.md](./architecture/overview.md)
2. **技術選択の理由を知る**: [adr/](./adr/) 配下のすべての ADR
3. **コンポーネント設計を確認する**: [architecture/components.md](./architecture/components.md)

## 参考資料

すべてのドキュメントは、以下のソースから収集した2026年1月時点の最新情報に基づいています：

### ゲーム開発
- [JavaScript/TypeScript Game Engines in 2025](https://gamefromscratch.com/javascript-typescript-game-engines-in-2025/)
- [JavaScript Game Development: Master Core Techniques for 2025](https://playgama.com/blog/general/javascript-game-development-core-techniques-for-browser-based-games/)
- [Writing a Game in TypeScript](https://iamschulz.com/writing-a-game-in-typescript/)

### テトリス固有
- [Tetris Architecture Overview - Stanford](http://cslibrary.stanford.edu/112/Tetris-Architecture.html)
- [Designing and creating the Tetris game in Typescript](https://medium.com/@paulosales_17259/designing-and-creating-the-tetris-game-in-typescript-9ab6ee7e5cf1)

### TypeScript
- [Why TypeScript Development Powers Scalable Web Apps in 2026](https://eleorex.com/why-typescript-development-is-the-game-changer-for-scalable-web-apps-in-2026/)
- [TypeScript Best Practices for Large-Scale Web Applications in 2026](https://johal.in/typescript-best-practices-for-large-scale-web-applications-in-2026/)

### Canvas vs WebGL
- [WebGL vs Canvas: Best Choice for Browser-Based CAD Tools](https://altersquare.medium.com/webgl-vs-canvas-best-choice-for-browser-based-cad-tools-231097daf063)
- [A look at 2D vs WebGL canvas performance](https://semisignal.com/a-look-at-2d-vs-webgl-canvas-performance/)

### 状態管理
- [Modern State Management in Vanilla JavaScript: 2026 Patterns and Beyond](https://medium.com/@orami98/modern-state-management-in-vanilla-javascript-2026-patterns-and-beyond-ce00425f7ac5)
- [State Management in Vanilla JS: 2026 Trends](https://medium.com/@chirag.dave/state-management-in-vanilla-js-2026-trends-f9baed7599de)
- [JavaScript Game Foundations - State Management](https://codeincomplete.com/articles/javascript-game-foundations-state-management/)
- [Game Programming Patterns - State](https://gameprogrammingpatterns.com/state.html)

### ビルドツール
- [The 8 trends that will define web development in 2026](https://blog.logrocket.com/8-trends-web-dev-2026/)

## ドキュメントのメンテナンス

このドキュメントは「生きたドキュメント」として管理します：

- 重要な技術的決定があった場合は新しい ADR を追加
- 既存の決定を覆す場合は ADR のステータスを更新
- アーキテクチャの変更があった場合は該当ドキュメントを更新

## フィードバック

設計に関する質問や提案がある場合は、チーム内で議論してください。重要な決定事項は ADR として記録することを推奨します。

---

**作成日**: 2026-01-09
**最終更新**: 2026-01-09
