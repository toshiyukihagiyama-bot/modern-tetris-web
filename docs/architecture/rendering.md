# レンダリング設計

## 概要

Canvas 2D API を使用した効率的なレンダリングシステムの設計です。

## レンダリングアーキテクチャ

### レイヤー構造

```
┌────────────────────────────────┐
│     UI Layer (DOM)             │  スコア、ボタンなど
├────────────────────────────────┤
│     Effects Layer (Canvas)     │  パーティクル、アニメーション
├────────────────────────────────┤
│     Game Layer (Canvas)        │  ゲーム盤面、ピース
├────────────────────────────────┤
│     Background Layer (Canvas)  │  背景、グリッド
└────────────────────────────────┘
```

## Canvas 設定

### メインキャンバス

```typescript
interface CanvasConfig {
  width: number;      // 論理幅: 480px
  height: number;     // 論理高: 640px
  pixelRatio: number; // デバイスピクセル比対応
}

class CanvasManager {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private pixelRatio: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', {
      alpha: false,           // 透明度不要（パフォーマンス向上）
      desynchronized: true    // 低レイテンシー描画
    })!;

    this.pixelRatio = window.devicePixelRatio || 1;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    const logicalWidth = 480;
    const logicalHeight = 640;

    // 物理ピクセルサイズを設定
    this.canvas.width = logicalWidth * this.pixelRatio;
    this.canvas.height = logicalHeight * this.pixelRatio;

    // CSS表示サイズを設定
    this.canvas.style.width = `${logicalWidth}px`;
    this.canvas.style.height = `${logicalHeight}px`;

    // スケール調整
    this.context.scale(this.pixelRatio, this.pixelRatio);

    // アンチエイリアス設定
    this.context.imageSmoothingEnabled = false;
  }

  getContext(): CanvasRenderingContext2D {
    return this.context;
  }
}
```

## Renderer クラス

```typescript
class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 30;
  private colors: Record<PieceType, string>;

  // ダーティフラグ
  private isDirty: boolean = true;

  // オフスクリーンキャンバス
  private backgroundCanvas: OffscreenCanvas;
  private backgroundCtx: OffscreenCanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const manager = new CanvasManager(canvas);
    this.ctx = manager.getContext();

    this.colors = {
      I: '#00f0f0', // Cyan
      O: '#f0f000', // Yellow
      T: '#a000f0', // Purple
      S: '#00f000', // Green
      Z: '#f00000', // Red
      J: '#0000f0', // Blue
      L: '#f0a000'  // Orange
    };

    this.setupBackground();
  }

  private setupBackground(): void {
    this.backgroundCanvas = new OffscreenCanvas(
      12 * this.cellSize,
      20 * this.cellSize
    );
    this.backgroundCtx = this.backgroundCanvas.getContext('2d')!;
    this.renderBackgroundGrid();
  }

  private renderBackgroundGrid(): void {
    const ctx = this.backgroundCtx;
    const width = 12 * this.cellSize;
    const height = 20 * this.cellSize;

    // 背景色
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // グリッド線
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;

    // 垂直線
    for (let x = 0; x <= 12; x++) {
      ctx.beginPath();
      ctx.moveTo(x * this.cellSize, 0);
      ctx.lineTo(x * this.cellSize, height);
      ctx.stroke();
    }

    // 水平線
    for (let y = 0; y <= 20; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.cellSize);
      ctx.lineTo(width, y * this.cellSize);
      ctx.stroke();
    }
  }

  render(state: GameState): void {
    if (!this.isDirty) return;

    // 画面クリア
    this.clear();

    // 背景描画
    this.ctx.drawImage(this.backgroundCanvas, 40, 40);

    // ボード描画
    this.renderBoard(state.board, 40, 40);

    // ゴーストピース描画
    if (state.currentPiece) {
      const ghostY = this.calculateGhostPosition(state);
      this.renderGhost(state.currentPiece, state.currentX, ghostY, 40, 40);
    }

    // 現在のピース描画
    if (state.currentPiece) {
      this.renderPiece(state.currentPiece, state.currentX, state.currentY, 40, 40);
    }

    // NEXT ピース描画
    this.renderNextPieces(state.nextPieces);

    // HOLD ピース描画
    this.renderHoldPiece(state.holdPiece);

    this.isDirty = false;
  }

  private renderBoard(board: Board, offsetX: number, offsetY: number): void {
    const grid = board.grid;

    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const cell = grid[y][x];
        if (cell !== 0) {
          this.renderCell(
            x * this.cellSize + offsetX,
            y * this.cellSize + offsetY,
            this.colors[cell as PieceType]
          );
        }
      }
    }
  }

  private renderPiece(
    piece: Piece,
    px: number,
    py: number,
    offsetX: number,
    offsetY: number
  ): void {
    const matrix = piece.getMatrix();
    const color = this.colors[piece.type];

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          this.renderCell(
            (px + x) * this.cellSize + offsetX,
            (py + y) * this.cellSize + offsetY,
            color
          );
        }
      }
    }
  }

  private renderGhost(
    piece: Piece,
    px: number,
    py: number,
    offsetX: number,
    offsetY: number
  ): void {
    const matrix = piece.getMatrix();
    const color = this.colors[piece.type];

    this.ctx.save();
    this.ctx.globalAlpha = 0.3;

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          this.renderCell(
            (px + x) * this.cellSize + offsetX,
            (py + y) * this.cellSize + offsetY,
            color,
            false  // 影のみ描画
          );
        }
      }
    }

    this.ctx.restore();
  }

  private renderCell(
    x: number,
    y: number,
    color: string,
    withShading: boolean = true
  ): void {
    const size = this.cellSize;
    const ctx = this.ctx;

    // メインカラー
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);

    if (withShading) {
      // ハイライト（左上）
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x, y, size, 2);
      ctx.fillRect(x, y, 2, size);

      // シャドウ（右下）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x, y + size - 2, size, 2);
      ctx.fillRect(x + size - 2, y, 2, size);
    }

    // 枠線
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);
  }

  private renderNextPieces(pieces: Piece[]): void {
    const startX = 420;
    const startY = 100;
    const spacing = 100;

    // NEXT ラベル
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('NEXT', startX, startY - 20);

    pieces.forEach((piece, index) => {
      const y = startY + index * spacing;
      this.renderPiecePreview(piece, startX, y);
    });
  }

  private renderHoldPiece(piece: Piece | null): void {
    const x = 20;
    const y = 100;

    // HOLD ラベル
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillText('HOLD', x, y - 20);

    if (piece) {
      this.renderPiecePreview(piece, x, y);
    }
  }

  private renderPiecePreview(piece: Piece, x: number, y: number): void {
    const matrix = piece.getMatrix();
    const color = this.colors[piece.type];
    const previewSize = 20;

    // 背景
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(x, y, previewSize * 4, previewSize * 4);

    // ピース（中央揃え）
    const offsetX = (4 - matrix[0].length) * previewSize / 2;
    const offsetY = (4 - matrix.length) * previewSize / 2;

    for (let py = 0; py < matrix.length; py++) {
      for (let px = 0; px < matrix[py].length; px++) {
        if (matrix[py][px]) {
          this.renderCell(
            x + offsetX + px * previewSize,
            y + offsetY + py * previewSize,
            color
          );
        }
      }
    }
  }

  private calculateGhostPosition(state: GameState): number {
    if (!state.currentPiece) return state.currentY;

    let ghostY = state.currentY;
    while (state.board.isValidPosition(state.currentPiece, state.currentX, ghostY + 1)) {
      ghostY++;
    }

    return ghostY;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.isDirty = true;
  }

  markDirty(): void {
    this.isDirty = true;
  }
}
```

## アニメーション

### ライン消去アニメーション

```typescript
class LineAnimator {
  private animations: Animation[] = [];

  animateLineClear(lines: number[], duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();

      const animation: Animation = {
        lines,
        startTime,
        duration,
        onComplete: resolve
      };

      this.animations.push(animation);
    });
  }

  update(currentTime: number, ctx: CanvasRenderingContext2D): void {
    this.animations = this.animations.filter(anim => {
      const elapsed = currentTime - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);

      // フラッシュエフェクト
      const alpha = 1 - progress;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';

      anim.lines.forEach(lineY => {
        ctx.fillRect(0, lineY * 30, 360, 30);
      });

      ctx.restore();

      if (progress >= 1) {
        anim.onComplete();
        return false;
      }

      return true;
    });
  }
}

interface Animation {
  lines: number[];
  startTime: number;
  duration: number;
  onComplete: () => void;
}
```

## パフォーマンス最適化

### 1. オフスクリーンキャンバス

静的な要素（背景、グリッド）はオフスクリーンキャンバスに事前描画。

### 2. ダーティフラグ

状態変更時のみ再描画を行う。

```typescript
gameStore.subscribe((state) => {
  renderer.markDirty();
});
```

### 3. リクエストアニメーションフレーム

```typescript
class RenderLoop {
  private animationId: number | null = null;

  start(renderer: Renderer, gameState: Store<GameState>): void {
    const loop = (timestamp: number) => {
      renderer.render(gameState.getState());
      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
```

### 4. レイヤー分割

頻繁に更新される要素と静的な要素を別レイヤーに分離。

### 5. Canvas のコンテキスト設定

```typescript
const ctx = canvas.getContext('2d', {
  alpha: false,           // 透明度を無効化
  desynchronized: true    // 低レイテンシーモード
});
```

## レスポンシブ対応

```typescript
class ResponsiveCanvas {
  private canvas: HTMLCanvasElement;
  private baseWidth: number = 480;
  private baseHeight: number = 640;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.resize();

    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const container = this.canvas.parentElement!;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaleX = containerWidth / this.baseWidth;
    const scaleY = containerHeight / this.baseHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    this.canvas.style.transform = `scale(${scale})`;
    this.canvas.style.transformOrigin = 'top left';
  }
}
```

## デバッグモード

```typescript
class DebugRenderer {
  private enabled: boolean = false;

  toggle(): void {
    this.enabled = !this.enabled;
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    if (!this.enabled) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 200, 150);

    ctx.fillStyle = '#00ff00';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${this.calculateFPS()}`, 20, 30);
    ctx.fillText(`Score: ${state.score}`, 20, 50);
    ctx.fillText(`Level: ${state.level}`, 20, 70);
    ctx.fillText(`Lines: ${state.lines}`, 20, 90);
    ctx.fillText(`Pieces: ${this.getTotalPieces(state)}`, 20, 110);

    ctx.restore();
  }

  private calculateFPS(): number {
    // FPS calculation logic
    return 60;
  }

  private getTotalPieces(state: GameState): number {
    return Object.values(state.statistics.pieceCount)
      .reduce((sum, count) => sum + count, 0);
  }
}
```

## 参考資料

- [WebGL vs Canvas: Best Choice for Browser-Based CAD Tools](https://altersquare.medium.com/webgl-vs-canvas-best-choice-for-browser-based-cad-tools-231097daf063)
- [A look at 2D vs WebGL canvas performance](https://semisignal.com/a-look-at-2d-vs-webgl-canvas-performance/)
- [JavaScript Game Development: Master Core Techniques for 2025](https://playgama.com/blog/general/javascript-game-development-core-techniques-for-browser-based-games/)
