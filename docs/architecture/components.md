# コンポーネント設計

## コアコンポーネント

### 1. Board（ゲーム盤面）

```typescript
interface Board {
  readonly width: number;   // 12
  readonly height: number;  // 20
  grid: Matrix;

  isValidPosition(piece: Piece, x: number, y: number): boolean;
  placePiece(piece: Piece, x: number, y: number): void;
  clearLines(): number;
  reset(): void;
}
```

**責務**:
- ゲーム盤面の状態を保持
- ピースの配置の妥当性チェック
- ライン消去処理
- 衝突判定

**実装のポイント**:
- 2次元配列（Uint8Array）で状態を管理
- 行の削除は配列のスプライスではなく、メモリコピーで実装（パフォーマンス）

---

### 2. Piece（テトロミノ）

```typescript
interface Piece {
  readonly type: PieceType;  // I, O, T, S, Z, J, L
  readonly color: string;
  shape: Matrix;
  rotation: number;  // 0-3

  rotate(direction: 'clockwise' | 'counterclockwise'): void;
  getMatrix(): Matrix;
  clone(): Piece;
}
```

**責務**:
- テトロミノの形状定義
- 回転処理（SRS: Super Rotation System）
- 形状データの提供

**7種類のテトロミノ**:
- **I**: 水色 - 4x1の直線
- **O**: 黄色 - 2x2の正方形
- **T**: 紫色 - T字型
- **S**: 緑色 - S字型
- **Z**: 赤色 - Z字型
- **J**: 青色 - J字型
- **L**: オレンジ色 - L字型

**回転システム**:
- Super Rotation System (SRS) を実装
- ウォールキック対応

---

### 3. GameState（ゲーム状態）

```typescript
interface GameState {
  status: GameStatus;
  board: Board;
  currentPiece: Piece | null;
  nextPieces: Piece[];  // 3個先まで表示
  holdPiece: Piece | null;
  score: number;
  level: number;
  lines: number;

  movePiece(dx: number, dy: number): boolean;
  rotatePiece(direction: 'clockwise' | 'counterclockwise'): boolean;
  dropPiece(): void;
  hardDrop(): void;
  holdCurrentPiece(): void;
}

type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
```

**責務**:
- ゲーム全体の状態管理
- スコア計算
- レベル管理
- ピース操作の調整

**スコアリング**:
```
1ライン: 100 × level
2ライン: 300 × level
3ライン: 500 × level
4ライン (テトリス): 800 × level
ハードドロップ: 落下距離 × 2
ソフトドロップ: 落下距離 × 1
```

---

### 4. Renderer（描画エンジン）

```typescript
interface Renderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  render(state: GameState): void;
  renderBoard(board: Board): void;
  renderPiece(piece: Piece, x: number, y: number): void;
  renderGhost(piece: Piece, x: number, y: number): void;
  renderNextPieces(pieces: Piece[]): void;
  renderHoldPiece(piece: Piece | null): void;
  clear(): void;
}
```

**責務**:
- Canvas への描画
- ゴーストピース（落下予測位置）の表示
- アニメーション効果
- UI要素の描画

**描画の最適化**:
- ダーティリージョンのみ再描画
- オフスクリーンキャンバスの使用
- レイヤー分割（背景、盤面、エフェクト）

---

### 5. InputHandler（入力処理）

```typescript
interface InputHandler {
  bindKey(key: string, action: string): void;
  handleInput(event: KeyboardEvent): void;
  handleTouch(event: TouchEvent): void;
  enableInput(): void;
  disableInput(): void;
}
```

**デフォルトキーバインド**:
- ⬅️ `←` / `A`: 左移動
- ➡️ `→` / `D`: 右移動
- ⬇️ `↓` / `S`: ソフトドロップ
- `Space`: ハードドロップ
- `↑` / `W` / `X`: 右回転
- `Z` / `Control`: 左回転
- `C` / `Shift`: ホールド
- `P` / `Escape`: ポーズ

**機能**:
- DAS (Delayed Auto Shift): キー長押し時の連続移動
- ARR (Auto Repeat Rate): 連続移動の速度
- タッチ操作のサポート（スワイプ、タップ）

---

### 6. GameLoop（ゲームループ）

```typescript
interface GameLoop {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  update(deltaTime: number): void;
}
```

**責務**:
- requestAnimationFrame によるメインループ
- 固定タイムステップでのロジック更新
- 重力処理（ピースの自動落下）
- フレームレート管理（60 FPS 目標）

**重力計算**:
```typescript
// レベルに応じた落下速度（フレーム数）
const gravity = Math.pow(0.8 - ((level - 1) * 0.007), level - 1);
```

---

### 7. PieceGenerator（ピース生成）

```typescript
interface PieceGenerator {
  next(): Piece;
  preview(count: number): Piece[];
  reset(): void;
}
```

**責務**:
- ランダムピース生成
- 7-bag システムの実装（全7種類を1セットとしてシャッフル）
- 次のピースのプレビュー

**7-bag アルゴリズム**:
1. 7種類全てのピースを配列に入れる
2. シャッフル（Fisher-Yates）
3. 順番に取り出す
4. 全て取り出したら1に戻る

これにより、偏りのない公平なピース配布を実現

---

## コンポーネント間の依存関係

```
GameLoop
  ↓
GameState → Board
  ↓         ↓
Piece ← PieceGenerator
  ↓
Renderer
```

```
InputHandler → GameState
```

## オブジェクトプーリング

頻繁に生成・破棄されるオブジェクトはプールで管理:

```typescript
class PiecePool {
  private pool: Piece[] = [];

  acquire(type: PieceType): Piece {
    return this.pool.pop() || new Piece(type);
  }

  release(piece: Piece): void {
    piece.reset();
    this.pool.push(piece);
  }
}
```

対象:
- Piece オブジェクト
- パーティクルエフェクト
- サウンドバッファ

## 参考資料

- [Tetris Architecture Overview - Stanford](http://cslibrary.stanford.edu/112/Tetris-Architecture.html)
- [JavaScript Game Development: Master Core Techniques for 2025](https://playgama.com/blog/general/javascript-game-development-core-techniques-for-browser-based-games/)
