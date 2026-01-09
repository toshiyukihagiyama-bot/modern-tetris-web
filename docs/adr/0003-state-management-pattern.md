# ADR 0003: 状態管理パターン（Proxy + FSM）

## ステータス

採用

## コンテキスト

テトリスゲームの状態管理には以下の要件があります：

1. **複雑な状態**: ゲーム状態、ピース、スコアなど多数の状態
2. **状態遷移**: MENU → PLAYING → PAUSED → GAME_OVER
3. **リアクティブ更新**: 状態変更時に UI を自動更新
4. **パフォーマンス**: 60 FPS を維持
5. **テスタビリティ**: 状態変更を追跡・テスト可能

従来のアプローチ：
- **手動更新**: setState() を呼び出して明示的に更新
- **Redux/MobX**: 重量級のライブラリ
- **Observable パターン**: カスタム実装

## 決定

**ES Proxy ベースのリアクティブシステム + Finite State Machine（有限状態機械）のハイブリッドアプローチを採用します。**

## 理由

### 1. 2026年のベストプラクティス

調査結果から、2026年時点では Vanilla JavaScript の Proxy を使用したリアクティブシステムが標準的なアプローチとなっています：

> "With the capabilities available in 2026, Vanilla JavaScript offers a robust set of tools for handling state without frameworks, from reactive Proxies to centralized stores and persistent storage."

> "With Proxies, WeakMaps, and other ES2022+ features, you can create reactive, performant state solutions that are 80% smaller than traditional libraries."

### 2. Proxy によるリアクティブシステム

```typescript
class Store<T extends object> {
  private state: T;
  private listeners: Set<(state: T) => void> = new Set();

  constructor(initialState: T) {
    this.state = new Proxy(initialState, {
      set: (target, property, value) => {
        const oldValue = target[property];
        target[property] = value;

        // 値が変更された場合のみ通知
        if (oldValue !== value) {
          this.notify();
        }

        return true;
      }
    });
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

**メリット**:
- 自動的な変更検知
- ボイラープレートコード不要
- ネイティブ JavaScript（ライブラリ不要）
- 高パフォーマンス

### 3. Finite State Machine（FSM）

ゲームモードの管理には FSM が最適です：

```typescript
enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

class GameStateMachine {
  private transitions: Map<GameStatus, Set<GameStatus>>;

  constructor() {
    this.transitions = new Map([
      [GameStatus.MENU, new Set([GameStatus.PLAYING])],
      [GameStatus.PLAYING, new Set([GameStatus.PAUSED, GameStatus.GAME_OVER])],
      [GameStatus.PAUSED, new Set([GameStatus.PLAYING, GameStatus.MENU])],
      [GameStatus.GAME_OVER, new Set([GameStatus.MENU])]
    ]);
  }

  canTransition(from: GameStatus, to: GameStatus): boolean {
    return this.transitions.get(from)?.has(to) ?? false;
  }
}
```

調査結果から：「For game development specifically, the combination of a finite-state-machine to manage game states, and a simple publish-subscribe custom event mechanism allow much of the game logic to be declarative.」

**メリット**:
- 不正な状態遷移を防止
- 状態遷移が明確
- デバッグが容易
- テストしやすい

### 4. Pub/Sub パターン

コンポーネント間の疎結合を実現：

```typescript
class EventBus {
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, handler: Function): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
    return () => this.events.get(event)?.delete(handler);
  }

  emit(event: string, data?: any): void {
    this.events.get(event)?.forEach(handler => handler(data));
  }
}
```

**メリット**:
- コンポーネント間の依存性を最小化
- 新機能の追加が容易
- テストが簡単（モック可能）

### 5. ライブラリ不要

Redux や MobX を使わない理由：

**Redux**:
- バンドルサイズ: ~50KB（minified）
- ボイラープレート: Actions, Reducers, Store
- 学習コスト: 高

**MobX**:
- バンドルサイズ: ~65KB（minified）
- デコレーターの理解が必要
- マジックが多い（デバッグ困難）

**Proxy ベースのカスタム実装**:
- バンドルサイズ: ~2KB
- シンプルな API
- 完全なコントロール

調査結果から：「You can create reactive, performant state solutions that are 80% smaller than traditional libraries」

## 結果

### ポジティブ

1. **小さなバンドルサイズ**: ライブラリ不要で ~2KB
2. **高パフォーマンス**: ネイティブ Proxy の使用
3. **開発速度**: ボイラープレートコード不要
4. **保守性**: シンプルで理解しやすい
5. **テスタビリティ**: 明確な状態遷移とイベント
6. **型安全性**: TypeScript と完全統合

### ネガティブ

1. **Proxy のサポート**: IE11 非対応
   - 対策: 2026年時点で IE11 は EOL、対応不要
2. **カスタム実装の保守**: ライブラリより手動メンテナンス
   - 対策: シンプルな実装のため保守コスト低
3. **タイムトラベルデバッグ**: Redux DevTools のような機能がない
   - 対策: 必要に応じて簡易的な履歴機能を追加

## 代替案

### Redux

```typescript
// Action
const MOVE_PIECE = 'MOVE_PIECE';

// Action Creator
function movePiece(dx: number, dy: number) {
  return { type: MOVE_PIECE, payload: { dx, dy } };
}

// Reducer
function gameReducer(state = initialState, action: Action) {
  switch (action.type) {
    case MOVE_PIECE:
      return { ...state, x: state.x + action.payload.dx };
    default:
      return state;
  }
}

// Store
const store = createStore(gameReducer);
```

**メリット**:
- 業界標準
- 豊富なエコシステム
- Redux DevTools

**デメリット**:
- 大きなバンドルサイズ
- ボイラープレート多
- 小規模プロジェクトには過剰

**評価**: テトリスのような小〜中規模ゲームには過剰。大規模なチーム開発や複雑なアプリケーションには有効。

### MobX

```typescript
import { makeObservable, observable, action } from 'mobx';

class GameStore {
  @observable score = 0;
  @observable level = 1;

  @action
  increaseScore(points: number) {
    this.score += points;
  }
}
```

**メリット**:
- 自動的なリアクティビティ
- 簡潔なコード

**デメリット**:
- バンドルサイズ大
- デコレーターの理解が必要
- "マジック"が多い（予測困難）

**評価**: Proxy の直接使用でほぼ同等の機能を実現可能。

### 手動 Observer パターン

```typescript
class Observable<T> {
  private value: T;
  private observers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    this.value = newValue;
    this.observers.forEach(observer => observer(newValue));
  }

  subscribe(observer: (value: T) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }
}
```

**メリット**:
- シンプル
- 依存なし

**デメリット**:
- 各プロパティに Observable を定義する必要
- 冗長
- ネストしたオブジェクトの扱いが複雑

**評価**: Proxy の方がエレガントで自動的。

## 実装例

### Store の使用

```typescript
// Store の作成
const gameStore = new Store<GameState>({
  status: GameStatus.MENU,
  score: 0,
  level: 1,
  // ...
});

// サブスクライブ
gameStore.subscribe((state) => {
  renderer.render(state);
  updateUI(state);
});

// 状態更新
gameStore.setState({ score: 100 });  // 自動的に再レンダリング
```

### イベントバスの使用

```typescript
// イベント発行
eventBus.emit(GameEvent.LINE_CLEARED, 4);

// イベント購読
eventBus.on(GameEvent.LINE_CLEARED, (lines: number) => {
  if (lines === 4) {
    soundManager.play('tetris');
    particleManager.createExplosion();
  }
});
```

### FSM の使用

```typescript
class GameActions {
  pause(): void {
    const state = this.store.getState();

    // FSM で遷移可能かチェック
    if (!this.fsm.canTransition(state.status, GameStatus.PAUSED)) {
      console.warn('Cannot pause from current state');
      return;
    }

    this.store.setState({ status: GameStatus.PAUSED });
    eventBus.emit(GameEvent.GAME_PAUSED);
  }
}
```

## パフォーマンス考慮事項

### 1. バッチ更新

```typescript
class Store<T extends object> {
  private updateScheduled = false;

  setState(updates: Partial<T>): void {
    Object.assign(this.state, updates);

    if (!this.updateScheduled) {
      this.updateScheduled = true;
      queueMicrotask(() => {
        this.notify();
        this.updateScheduled = false;
      });
    }
  }
}
```

### 2. メモ化

```typescript
class MemoizedSelector<T, R> {
  private cache: WeakMap<T, R> = new WeakMap();

  select(state: T, selector: (state: T) => R): R {
    if (this.cache.has(state)) {
      return this.cache.get(state)!;
    }

    const result = selector(state);
    this.cache.set(state, result);
    return result;
  }
}
```

### 3. 選択的サブスクライブ

```typescript
// 特定のプロパティの変更のみ監視
gameStore.subscribe((state) => {
  updateScore(state.score);
}, (state) => state.score);  // score のみ監視
```

## テスト戦略

```typescript
describe('GameStore', () => {
  it('should notify subscribers on state change', () => {
    const store = new Store({ score: 0 });
    const listener = jest.fn();

    store.subscribe(listener);
    store.setState({ score: 100 });

    expect(listener).toHaveBeenCalledWith({ score: 100 });
  });

  it('should prevent invalid state transitions', () => {
    const fsm = new GameStateMachine();

    expect(fsm.canTransition(GameStatus.MENU, GameStatus.PAUSED)).toBe(false);
    expect(fsm.canTransition(GameStatus.PLAYING, GameStatus.PAUSED)).toBe(true);
  });
});
```

## 参考資料

- [Modern State Management in Vanilla JavaScript: 2026 Patterns and Beyond](https://medium.com/@orami98/modern-state-management-in-vanilla-javascript-2026-patterns-and-beyond-ce00425f7ac5)
- [State Management in Vanilla JS: 2026 Trends](https://medium.com/@chirag.dave/state-management-in-vanilla-js-2026-trends-f9baed7599de)
- [Advanced JavaScript State Management: 12 Native Patterns](https://medium.com/@orami98/advanced-javascript-state-management-12-native-patterns-that-will-replace-your-heavy-libraries-in-623d8e449990)
- [JavaScript Game Foundations - State Management](https://codeincomplete.com/articles/javascript-game-foundations-state-management/)
- [Game Programming Patterns - State](https://gameprogrammingpatterns.com/state.html)

## 更新履歴

- 2026-01-09: 初版作成
