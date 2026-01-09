# ADR 0004: レイヤードアーキテクチャの採用

## ステータス

採用

## コンテキスト

テトリスゲームのコード構造を決定する必要があります。適切なアーキテクチャパターンの選択は以下に影響します：

- **保守性**: コードの理解と変更の容易さ
- **テスタビリティ**: ユニットテストの実装
- **拡張性**: 新機能の追加
- **チーム開発**: 複数人での並行開発

一般的なアーキテクチャパターン：
- MVC (Model-View-Controller)
- MVVM (Model-View-ViewModel)
- レイヤードアーキテクチャ
- クリーンアーキテクチャ

## 決定

**4層のレイヤードアーキテクチャを採用します。**

```
┌─────────────────────────────────────────┐
│   Presentation Layer (UI Layer)        │  Canvas, DOM
├─────────────────────────────────────────┤
│   Application Layer (Controller)       │  GameLoop, Input
├─────────────────────────────────────────┤
│   Domain Layer (Game Logic)            │  GameState, Actions
├─────────────────────────────────────────┤
│   Infrastructure Layer (Core)          │  Board, Piece
└─────────────────────────────────────────┘
```

## 理由

### 1. 関心の分離（Separation of Concerns）

各層が明確な責務を持つことで、コードの理解と保守が容易になります。

調査結果から：
- Stanford の Tetris Architecture では、Board（データ）、Piece（ロジック）、JTetris（GUI）を分離
- GameDev.net のディスカッションでは、TetrisDisplay（表示）と TetrisLogic（ロジック）の分離を推奨
- MVC パターンの原則を適用

### 2. 各層の責務

#### Layer 1: Presentation Layer（表示層）

**責務**: ユーザーに情報を表示し、入力を受け付ける

```typescript
// src/presentation/
├── Renderer.ts          // Canvas 描画
├── UIController.ts      // DOM 要素の制御
└── AnimationManager.ts  // アニメーション効果
```

**特徴**:
- ゲームロジックを含まない
- 純粋な描画のみ
- 状態を保持しない（ステートレス）

```typescript
class Renderer {
  render(state: GameState): void {
    // state を元に描画するのみ
    this.renderBoard(state.board);
    this.renderPiece(state.currentPiece, state.currentX, state.currentY);
  }
}
```

#### Layer 2: Application Layer（アプリケーション層）

**責務**: ゲームの進行制御と入力処理

```typescript
// src/application/
├── GameLoop.ts         // メインループ
├── InputHandler.ts     // キーボード/タッチ入力
└── GameController.ts   // ゲーム全体の制御
```

**特徴**:
- ゲームの「進行」を管理
- 入力をアクションに変換
- タイミングの制御

```typescript
class GameLoop {
  update(deltaTime: number): void {
    if (this.gameState.status !== GameStatus.PLAYING) return;

    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.gameActions.softDrop();
      this.dropCounter = 0;
    }
  }
}
```

#### Layer 3: Domain Layer（ドメイン層）

**責務**: ゲームのビジネスロジック

```typescript
// src/domain/
├── GameState.ts        // ゲーム状態
├── GameActions.ts      // 状態操作
├── Store.ts            // 状態管理
├── EventBus.ts         // イベントシステム
└── types.ts            // 型定義
```

**特徴**:
- ゲームのルールを実装
- 状態の整合性を保証
- フレームワーク非依存

```typescript
class GameActions {
  moveLeft(): void {
    const state = this.store.getState();
    const newX = state.currentX - 1;

    // ビジネスルール: 移動可能かチェック
    if (state.board.isValidPosition(state.currentPiece, newX, state.currentY)) {
      this.store.setState({ currentX: newX });
      this.eventBus.emit(GameEvent.PIECE_MOVED);
    }
  }
}
```

#### Layer 4: Infrastructure Layer（基盤層）

**責務**: 基本的なデータ構造とコアロジック

```typescript
// src/infrastructure/
├── Board.ts            // ゲーム盤面
├── Piece.ts            // テトロミノ
├── PieceGenerator.ts   // ピース生成
├── Matrix.ts           // 2次元配列操作
└── constants.ts        // 定数
```

**特徴**:
- 再利用可能なコンポーネント
- ゲーム固有のロジックを含まない
- テストが容易

```typescript
class Board {
  isValidPosition(piece: Piece, x: number, y: number): boolean {
    const matrix = piece.getMatrix();

    for (let py = 0; py < matrix.length; py++) {
      for (let px = 0; px < matrix[py].length; px++) {
        if (matrix[py][px]) {
          const boardX = x + px;
          const boardY = y + py;

          // 境界チェック
          if (boardX < 0 || boardX >= this.width) return false;
          if (boardY < 0 || boardY >= this.height) return false;

          // 衝突チェック
          if (this.grid[boardY][boardX]) return false;
        }
      }
    }

    return true;
  }
}
```

### 3. 依存関係の方向

重要な原則：**依存は常に下層に向かう**

```
Presentation → Application → Domain → Infrastructure
     ↓              ↓           ↓           ↓
    なし          なし         なし        なし
```

**上位層は下位層に依存するが、逆はない。**

これにより：
- テストが容易（下位層は独立してテスト可能）
- 変更の影響範囲が限定的
- 再利用性が高い

### 4. データフロー

```
User Input
    ↓
InputHandler (Application)
    ↓
GameActions (Domain)
    ↓
Board/Piece (Infrastructure)
    ↓
GameState (Domain)
    ↓
Renderer (Presentation)
    ↓
Canvas
```

### 5. 既存の成功例

調査結果から：

**Stanford Tetris Architecture**:
```
Board: データ構造
Piece: ピースのロジック
JTetris: GUI
```

**Medium の TypeScript 実装**:
```
Arena: ゲーム盤面
Piece: テトロミノ
Runtime: ゲーム制御（シングルトン）
```

これらは本 ADR のレイヤードアーキテクチャと概念的に一致しています。

## 結果

### ポジティブ

1. **高い保守性**
   - 各層が独立しており、変更が容易
   - コードの場所が明確

2. **テスタビリティ**
   - 各層を独立してテスト可能
   - モックの作成が容易

3. **並行開発**
   - 異なる層を異なるメンバーが開発可能
   - インターフェースが明確

4. **拡張性**
   - 新機能の追加先が明確
   - 既存コードへの影響が最小

5. **理解しやすさ**
   - 新規メンバーのオンボーディングが容易
   - コードレビューが効率的

### ネガティブ

1. **初期コスト**
   - 層の設計に時間がかかる
   - 対策: 明確なガイドラインを提供

2. **オーバーエンジニアリングのリスク**
   - 小規模ゲームには過剰な可能性
   - 対策: 必要最小限の層にする（4層）

3. **パフォーマンスオーバーヘッド**
   - 層をまたぐ呼び出しのコスト
   - 対策: 適切な粒度で設計、実測して最適化

## 代替案

### MVC パターン

```
Model: GameState, Board, Piece
View: Renderer
Controller: GameController
```

**メリット**:
- 広く知られたパターン
- シンプル

**デメリット**:
- Web アプリケーション向け
- ゲームには不適（Controller が肥大化）

**評価**: Web アプリケーションには有効だが、ゲームには MVC は最適ではない。

### Entity-Component-System (ECS)

```
Entity: ゲームオブジェクト
Component: データ
System: ロジック
```

**メリット**:
- 高いパフォーマンス
- データ指向設計

**デメリット**:
- 学習コスト高
- テトリスには過剰
- 複雑

**評価**: 大規模なゲームエンジンには有効だが、テトリスには過剰。

### モノリシック（層なし）

```
// 全てが1つのファイルまたはクラス
class TetrisGame {
  render() { /* ... */ }
  update() { /* ... */ }
  handleInput() { /* ... */ }
  // すべてのロジック
}
```

**メリット**:
- 最速の開発スタート
- シンプル

**デメリット**:
- スケールしない
- テスト困難
- 保守が困難

**評価**: プロトタイプには有効だが、本番コードには不適。

### クリーンアーキテクチャ

```
Entities → Use Cases → Interface Adapters → Frameworks
```

**メリット**:
- フレームワーク非依存
- 高いテスタビリティ

**デメリット**:
- 複雑
- テトリスには過剰
- 開発コスト高

**評価**: エンタープライズアプリケーションには有効だが、ゲームには過剰。

## フォルダ構造

```
src/
├── presentation/
│   ├── Renderer.ts
│   ├── UIController.ts
│   └── AnimationManager.ts
├── application/
│   ├── GameLoop.ts
│   ├── InputHandler.ts
│   └── GameController.ts
├── domain/
│   ├── GameState.ts
│   ├── GameActions.ts
│   ├── Store.ts
│   ├── EventBus.ts
│   └── types.ts
├── infrastructure/
│   ├── Board.ts
│   ├── Piece.ts
│   ├── PieceGenerator.ts
│   ├── Matrix.ts
│   └── constants.ts
└── main.ts
```

## 実装ガイドライン

### 1. 層をまたぐ通信

イベントバスまたは依存性注入を使用：

```typescript
// ✅ Good: イベント経由
eventBus.emit(GameEvent.LINE_CLEARED, lines);

// ❌ Bad: 直接呼び出し（上位から下位は OK、逆はNG）
renderer.onLineCleared(lines);  // Presentation → Domain は NG
```

### 2. 状態の流れ

状態は Domain Layer で管理し、上位層は購読：

```typescript
// Domain
gameStore.setState({ score: 100 });

// Presentation は自動更新
gameStore.subscribe((state) => {
  renderer.render(state);
});
```

### 3. ビジネスロジックの配置

ゲームのルールは必ず Domain Layer に：

```typescript
// ✅ Good: Domain Layer
class GameActions {
  calculateScore(lines: number, level: number): number {
    const scores = [0, 100, 300, 500, 800];
    return scores[lines] * level;
  }
}

// ❌ Bad: Presentation Layer にロジック
class Renderer {
  render(state: GameState): void {
    const score = this.calculateScore(state.lines, state.level);  // NG!
  }
}
```

### 4. テスト戦略

各層を独立してテスト：

```typescript
// Infrastructure Layer のテスト（他層への依存なし）
describe('Board', () => {
  it('should detect valid position', () => {
    const board = new Board(12, 20);
    const piece = new Piece('I');
    expect(board.isValidPosition(piece, 5, 0)).toBe(true);
  });
});

// Domain Layer のテスト
describe('GameActions', () => {
  it('should move piece left', () => {
    const store = createMockStore();
    const actions = new GameActions(store);
    actions.moveLeft();
    expect(store.getState().currentX).toBe(4);
  });
});
```

## 参考資料

- [Tetris Architecture Overview - Stanford](http://cslibrary.stanford.edu/112/Tetris-Architecture.html)
- [Tetris Architecture - GameDev.net](https://www.gamedev.net/forums/topic/480507-tetris-architecture/)
- [Designing and creating the Tetris game in Typescript](https://medium.com/@paulosales_17259/designing-and-creating-the-tetris-game-in-typescript-9ab6ee7e5cf1)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

## 更新履歴

- 2026-01-09: 初版作成
