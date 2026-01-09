# 状態管理設計

## 概要

テトリスゲームの状態管理には、**Finite State Machine (FSM)** と **Reactive State** を組み合わせたハイブリッドアプローチを採用します。

## 状態遷移図

```
        ┌──────┐
        │ MENU │
        └───┬──┘
            │ start()
            ▼
        ┌─────────┐
    ┌───┤ PLAYING │◄──┐
    │   └─────────┘   │
    │ pause()    resume()
    │       │          │
    │       ▼          │
    │   ┌────────┐    │
    └───►│ PAUSED │────┘
        └────────┘
            │
            │ gameOver()
            ▼
        ┌───────────┐
        │ GAME_OVER │
        └─────┬─────┘
              │ restart()
              ▼
          ┌──────┐
          │ MENU │
          └──────┘
```

## 状態定義

### GameStatus Enum

```typescript
enum GameStatus {
  MENU = 'MENU',           // 初期画面
  PLAYING = 'PLAYING',     // ゲーム進行中
  PAUSED = 'PAUSED',       // 一時停止
  GAME_OVER = 'GAME_OVER'  // ゲーム終了
}
```

### State Interface

```typescript
interface GameState {
  // 状態
  status: GameStatus;

  // ゲーム盤面
  board: Board;

  // ピース
  currentPiece: Piece | null;
  currentX: number;
  currentY: number;
  nextPieces: Piece[];      // 次の3ピース
  holdPiece: Piece | null;  // ホールドピース
  canHold: boolean;         // ホールド可能フラグ

  // ゲーム進行
  score: number;
  level: number;
  lines: number;

  // タイミング
  dropCounter: number;      // 重力カウンター
  dropInterval: number;     // 落下間隔

  // 統計
  statistics: Statistics;
}

interface Statistics {
  pieceCount: Record<PieceType, number>;
  tetrisCount: number;      // 4ライン消しの回数
  maxCombo: number;
  playTime: number;
}
```

## Reactive State System

2026年のベストプラクティスに従い、ES Proxy を使用したリアクティブシステムを実装します。

### Store の実装

```typescript
class Store<T extends object> {
  private state: T;
  private listeners: Set<(state: T) => void> = new Set();

  constructor(initialState: T) {
    this.state = new Proxy(initialState, {
      set: (target, property, value) => {
        const oldValue = target[property];
        target[property] = value;

        if (oldValue !== value) {
          this.notify();
        }

        return true;
      }
    });
  }

  getState(): T {
    return this.state;
  }

  setState(updater: Partial<T> | ((state: T) => Partial<T>)): void {
    const updates = typeof updater === 'function'
      ? updater(this.state)
      : updater;

    Object.assign(this.state, updates);
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);

    // Unsubscribe function
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

### 使用例

```typescript
const gameStore = new Store<GameState>({
  status: GameStatus.MENU,
  board: new Board(12, 20),
  currentPiece: null,
  currentX: 0,
  currentY: 0,
  nextPieces: [],
  holdPiece: null,
  canHold: true,
  score: 0,
  level: 1,
  lines: 0,
  dropCounter: 0,
  dropInterval: 1000,
  statistics: {
    pieceCount: {},
    tetrisCount: 0,
    maxCombo: 0,
    playTime: 0
  }
});

// Subscribe to state changes
gameStore.subscribe((state) => {
  if (state.status === GameStatus.PLAYING) {
    renderer.render(state);
  }
});
```

## アクション (Actions)

状態変更は明示的なアクションを通じて行います。

```typescript
class GameActions {
  constructor(private store: Store<GameState>) {}

  start(): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.MENU) return;

    this.store.setState({
      status: GameStatus.PLAYING,
      currentPiece: pieceGenerator.next(),
      currentX: 5,
      currentY: 0,
      nextPieces: pieceGenerator.preview(3)
    });
  }

  pause(): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.PLAYING) return;

    this.store.setState({ status: GameStatus.PAUSED });
  }

  resume(): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.PAUSED) return;

    this.store.setState({ status: GameStatus.PLAYING });
  }

  moveLeft(): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.PLAYING || !state.currentPiece) return;

    const newX = state.currentX - 1;
    if (state.board.isValidPosition(state.currentPiece, newX, state.currentY)) {
      this.store.setState({ currentX: newX });
    }
  }

  moveRight(): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.PLAYING || !state.currentPiece) return;

    const newX = state.currentX + 1;
    if (state.board.isValidPosition(state.currentPiece, newX, state.currentY)) {
      this.store.setState({ currentX: newX });
    }
  }

  rotate(direction: 'clockwise' | 'counterclockwise'): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.PLAYING || !state.currentPiece) return;

    const rotated = state.currentPiece.clone();
    rotated.rotate(direction);

    // SRS wall kick
    const kicks = this.getWallKicks(state.currentPiece, direction);
    for (const [dx, dy] of kicks) {
      if (state.board.isValidPosition(rotated, state.currentX + dx, state.currentY + dy)) {
        this.store.setState({
          currentPiece: rotated,
          currentX: state.currentX + dx,
          currentY: state.currentY + dy
        });
        return;
      }
    }
  }

  softDrop(): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.PLAYING || !state.currentPiece) return;

    const newY = state.currentY + 1;
    if (state.board.isValidPosition(state.currentPiece, state.currentX, newY)) {
      this.store.setState({
        currentY: newY,
        score: state.score + 1
      });
    }
  }

  hardDrop(): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.PLAYING || !state.currentPiece) return;

    let dropDistance = 0;
    let newY = state.currentY;

    while (state.board.isValidPosition(state.currentPiece, state.currentX, newY + 1)) {
      newY++;
      dropDistance++;
    }

    state.board.placePiece(state.currentPiece, state.currentX, newY);
    const linesCleared = state.board.clearLines();

    this.store.setState({
      currentY: newY,
      score: state.score + (dropDistance * 2) + this.calculateLineScore(linesCleared, state.level),
      lines: state.lines + linesCleared,
      level: Math.floor((state.lines + linesCleared) / 10) + 1
    });

    this.spawnNextPiece();
  }

  hold(): void {
    const state = this.store.getState();
    if (state.status !== GameStatus.PLAYING || !state.canHold || !state.currentPiece) return;

    const current = state.currentPiece;
    const held = state.holdPiece;

    this.store.setState({
      holdPiece: current,
      currentPiece: held || pieceGenerator.next(),
      currentX: 5,
      currentY: 0,
      canHold: false
    });
  }

  gameOver(): void {
    this.store.setState({ status: GameStatus.GAME_OVER });
  }

  restart(): void {
    const board = new Board(12, 20);
    this.store.setState({
      status: GameStatus.MENU,
      board,
      currentPiece: null,
      currentX: 0,
      currentY: 0,
      nextPieces: [],
      holdPiece: null,
      canHold: true,
      score: 0,
      level: 1,
      lines: 0,
      dropCounter: 0,
      dropInterval: 1000,
      statistics: {
        pieceCount: {},
        tetrisCount: 0,
        maxCombo: 0,
        playTime: 0
      }
    });
  }

  private spawnNextPiece(): void {
    const state = this.store.getState();
    const nextPiece = state.nextPieces[0];

    if (!state.board.isValidPosition(nextPiece, 5, 0)) {
      this.gameOver();
      return;
    }

    this.store.setState({
      currentPiece: nextPiece,
      currentX: 5,
      currentY: 0,
      nextPieces: [...state.nextPieces.slice(1), pieceGenerator.next()],
      canHold: true
    });
  }

  private calculateLineScore(lines: number, level: number): number {
    const scores = [0, 100, 300, 500, 800];
    return scores[lines] * level;
  }

  private getWallKicks(piece: Piece, direction: string): [number, number][] {
    // SRS wall kick data
    // Implementation details...
    return [[0, 0], [-1, 0], [1, 0], [0, -1]];
  }
}
```

## イベントシステム (Pub/Sub)

コンポーネント間の疎結合を実現するため、イベントシステムを実装します。

```typescript
class EventBus {
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, handler: Function): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)!.add(handler);

    // Unsubscribe function
    return () => this.events.get(event)?.delete(handler);
  }

  emit(event: string, data?: any): void {
    this.events.get(event)?.forEach(handler => handler(data));
  }

  off(event: string, handler?: Function): void {
    if (!handler) {
      this.events.delete(event);
    } else {
      this.events.get(event)?.delete(handler);
    }
  }
}
```

### イベント定義

```typescript
enum GameEvent {
  PIECE_MOVED = 'piece:moved',
  PIECE_ROTATED = 'piece:rotated',
  PIECE_DROPPED = 'piece:dropped',
  PIECE_LOCKED = 'piece:locked',
  LINE_CLEARED = 'line:cleared',
  LEVEL_UP = 'level:up',
  GAME_STARTED = 'game:started',
  GAME_PAUSED = 'game:paused',
  GAME_RESUMED = 'game:resumed',
  GAME_OVER = 'game:over'
}
```

### 使用例

```typescript
const eventBus = new EventBus();

// サウンドマネージャーがライン消去イベントをリッスン
eventBus.on(GameEvent.LINE_CLEARED, (lines: number) => {
  if (lines === 4) {
    soundManager.play('tetris');
  } else {
    soundManager.play('line-clear');
  }
});

// パーティクルエフェクトマネージャーがライン消去イベントをリッスン
eventBus.on(GameEvent.LINE_CLEARED, (lines: number) => {
  particleManager.createLineExplosion(lines);
});

// アクションからイベントを発行
eventBus.emit(GameEvent.LINE_CLEARED, linesCleared);
```

## 永続化 (Local Storage)

ハイスコアや設定を保存するための永続化機能。

```typescript
class PersistenceManager {
  private readonly STORAGE_KEY = 'tetris_save_data';

  save(data: Partial<GameState>): void {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(this.STORAGE_KEY, json);
    } catch (error) {
      console.error('Failed to save game data:', error);
    }
  }

  load(): Partial<GameState> | null {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Failed to load game data:', error);
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

## パフォーマンス考慮事項

1. **不要な再レンダリングの防止**
   - 状態変更時は差分のみを通知
   - メモ化による計算の最適化

2. **メモリリーク防止**
   - Unsubscribe 関数の確実な実行
   - WeakMap の活用

3. **状態の不変性**
   - イミュータブルな状態更新
   - 構造的共有による効率化

## 参考資料

- [Modern State Management in Vanilla JavaScript: 2026 Patterns and Beyond](https://medium.com/@orami98/modern-state-management-in-vanilla-javascript-2026-patterns-and-beyond-ce00425f7ac5)
- [State Management in Vanilla JS: 2026 Trends](https://medium.com/@chirag.dave/state-management-in-vanilla-js-2026-trends-f9baed7599de)
- [JavaScript Game Foundations - State Management](https://codeincomplete.com/articles/javascript-game-foundations-state-management/)
- [Game Programming Patterns - State](https://gameprogrammingpatterns.com/state.html)
