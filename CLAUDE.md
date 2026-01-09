# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tetris web game project designed using 2026 best practices for modern web development. The project currently contains comprehensive architectural documentation but no implementation yet.

## Architecture

### 4-Layer Architecture

The codebase follows a strict layered architecture pattern with unidirectional dependencies (upper layers depend on lower layers only):

```
Presentation Layer (UI)
    ↓
Application Layer (Controllers)
    ↓
Domain Layer (Game Logic)
    ↓
Infrastructure Layer (Core Components)
```

**Presentation Layer** (`src/presentation/`):
- Renderer.ts: Canvas 2D rendering (stateless)
- UIController.ts: DOM element management
- AnimationManager.ts: Visual effects
- No game logic, purely visual representation

**Application Layer** (`src/application/`):
- GameLoop.ts: Main loop using requestAnimationFrame
- InputHandler.ts: Keyboard/touch input processing with DAS/ARR
- GameController.ts: Overall game flow orchestration

**Domain Layer** (`src/domain/`):
- GameState.ts: Game state definition
- GameActions.ts: State mutations (moveLeft, rotate, hardDrop, etc.)
- Store.ts: ES Proxy-based reactive state management
- EventBus.ts: Pub/Sub event system for loose coupling
- types.ts: Core type definitions

**Infrastructure Layer** (`src/infrastructure/`):
- Board.ts: 20×12 game grid with collision detection
- Piece.ts: Tetromino pieces with SRS rotation system
- PieceGenerator.ts: 7-bag random piece generation
- Matrix.ts: 2D array utilities
- constants.ts: Game constants

### Key Architectural Decisions

All major technical decisions are documented in `docs/adr/`:

1. **TypeScript**: Strict mode enabled, targeting ES2022
2. **Canvas 2D API**: Not WebGL (simpler, sufficient for 2D)
3. **Custom State Management**: ES Proxy + FSM (not Redux/MobX, ~2KB vs ~50KB)
4. **Vite**: Build tool (not Webpack, 10-50x faster dev server)
5. **Layered Architecture**: Strict separation of concerns

### State Management Pattern

Uses a **hybrid approach combining Finite State Machine + ES Proxy reactivity**:

**Game States** (FSM):
- MENU → PLAYING → {PAUSED, GAME_OVER}
- PAUSED → {PLAYING, MENU}
- GAME_OVER → MENU

**Reactive Store** (ES Proxy):
```typescript
// Store auto-notifies subscribers on state changes
gameStore.setState({ score: 100 });
// Subscribers automatically triggered
```

**Event System** (Pub/Sub):
```typescript
eventBus.emit(GameEvent.LINE_CLEARED, 4);
// Decouples components (e.g., sound, particles, UI)
```

### Data Flow

```
User Input → InputHandler → GameActions → Board/Piece → GameState → Renderer → Canvas
```

State changes flow unidirectionally. The Renderer never modifies state, only reads it.

## Core Game Logic

### Board
- Dimensions: 20 rows × 12 columns
- Uses Uint8Array for efficient grid storage
- Collision detection via `isValidPosition(piece, x, y)`
- Line clearing returns count for scoring

### Pieces (Tetrominos)
- 7 types: I (cyan), O (yellow), T (purple), S (green), Z (red), J (blue), L (orange)
- SRS (Super Rotation System) with wall kicks
- 4 rotation states (0-3)

### Piece Generation
- 7-bag algorithm: shuffle all 7 types, emit in order, repeat
- Ensures fair distribution, no long droughts

### Scoring
```
1 line: 100 × level
2 lines: 300 × level
3 lines: 500 × level
4 lines (Tetris): 800 × level
Hard drop: distance × 2
Soft drop: distance × 1
```

### Input Controls (Default)
- Arrow keys / WASD: movement
- Space: hard drop
- ↑/W/X: rotate clockwise
- Z/Ctrl: rotate counterclockwise
- C/Shift: hold piece
- P/Esc: pause

### Performance Optimizations
1. **Object Pooling**: Reuse Piece objects, particle effects
2. **Dirty Flag**: Only re-render when state changes
3. **Offscreen Canvas**: Pre-render static elements (background, grid)
4. **Layer Separation**: Background, game, effects on separate canvases
5. **Typed Arrays**: Use Uint8Array for grid storage

## Development Guidelines

### Layer Communication Rules

**✅ Allowed**:
- Upper layer → Lower layer (direct calls)
- Any layer → EventBus (emit/subscribe)

**❌ Forbidden**:
- Lower layer → Upper layer (would create circular dependency)
- Presentation → Domain (Renderer must never call GameActions)

**Example**:
```typescript
// ✅ Good: Domain emits event
eventBus.emit(GameEvent.LINE_CLEARED, lines);
// ✅ Good: Presentation subscribes
eventBus.on(GameEvent.LINE_CLEARED, (lines) => playSound());

// ❌ Bad: Presentation calling Domain
renderer.onLineCleared(lines);  // Wrong direction!
```

### Business Logic Placement

All game rules belong in the **Domain Layer**, never in Presentation:

```typescript
// ✅ Good: Domain Layer
class GameActions {
  calculateScore(lines: number, level: number): number {
    const scores = [0, 100, 300, 500, 800];
    return scores[lines] * level;
  }
}

// ❌ Bad: Presentation Layer
class Renderer {
  render(state: GameState): void {
    const score = this.calculateScore(state.lines, state.level);  // NO!
  }
}
```

### Rendering Guidelines

1. **Stateless Rendering**: Renderer never stores game state
2. **Dirty Flag**: Mark dirty on state change, skip unchanged frames
3. **Canvas Context Settings**:
   ```typescript
   canvas.getContext('2d', {
     alpha: false,        // Opaque background (faster)
     desynchronized: true // Low-latency mode
   });
   ```
4. **Ghost Piece**: Show drop preview at 30% opacity
5. **Cell Size**: 30px per cell
6. **Layered Rendering**:
   - Background (static, offscreen canvas)
   - Board cells (changed cells only)
   - Current piece + ghost
   - UI elements (Next, Hold, Score)

### State Management Guidelines

1. **Immutable Updates**: Use `setState()`, never mutate directly
2. **Single In-Progress Task**: GameLoop should only update one piece of state per frame
3. **FSM Validation**: Check `canTransition()` before state changes
4. **Event Emission**: Emit events after successful state changes for side effects

### TypeScript Strictness

- `strict: true` in tsconfig.json
- No implicit `any`
- Strict null checks enabled
- All functions must have explicit return types

## Testing Strategy

### Unit Tests (Vitest)

Test each layer independently:

```typescript
// Infrastructure Layer (no dependencies)
describe('Board', () => {
  it('should detect collision', () => {
    const board = new Board(12, 20);
    const piece = new Piece('I');
    expect(board.isValidPosition(piece, -1, 0)).toBe(false);
  });
});

// Domain Layer (mock lower layers)
describe('GameActions', () => {
  it('should move piece left', () => {
    const mockStore = createMockStore();
    const actions = new GameActions(mockStore);
    actions.moveLeft();
    expect(mockStore.getState().currentX).toBe(4);
  });
});
```

### Integration Tests (Playwright)

Test full game flow through the UI.

## Project Setup Commands

**Note**: The project has not been initialized yet. When implementation begins, use:

```bash
# Initialize Vite project
npm create vite@latest . -- --template vanilla-ts

# Install dependencies
npm install

# Development server (starts in ~100ms)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

### Expected package.json scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

## File Organization

```
src/
├── presentation/      # UI layer (Canvas, DOM)
├── application/       # Controllers (GameLoop, Input)
├── domain/           # Game logic (State, Actions)
├── infrastructure/   # Core components (Board, Piece)
└── main.ts          # Entry point

docs/
├── architecture/     # Design documents
│   ├── overview.md
│   ├── components.md
│   ├── state-management.md
│   └── rendering.md
└── adr/             # Architecture Decision Records
    ├── 0001-use-typescript.md
    ├── 0002-use-canvas-2d.md
    ├── 0003-state-management-pattern.md
    ├── 0004-architecture-pattern.md
    └── 0005-use-vite.md
```

## Design Philosophy

1. **YAGNI**: Build only what's needed now
2. **Simplicity over Cleverness**: Avoid premature abstractions
3. **Dependency Minimization**: Use native browser APIs and ES2022+ features
4. **Type Safety**: Leverage TypeScript's strict mode
5. **Performance**: Target 60 FPS, measure before optimizing
6. **Testability**: Each layer testable in isolation

## Important Implementation Notes

### SRS Rotation System

Implement Super Rotation System with wall kicks. The piece should try multiple offsets when rotating near walls:
- Basic rotation
- Wall kick offsets (depends on piece type and rotation direction)

### 7-Bag Algorithm

```typescript
// Ensures no piece drought > 12 pieces
class PieceGenerator {
  private bag: PieceType[] = [];

  next(): Piece {
    if (this.bag.length === 0) {
      this.bag = shuffle([I, O, T, S, Z, J, L]);
    }
    return new Piece(this.bag.pop()!);
  }
}
```

### Memory Management

Avoid allocations in game loop (60 times/second):
- Reuse objects via pooling
- Pre-allocate arrays
- Clean up event listeners

### Canvas Optimization

1. Pre-render static elements to offscreen canvas
2. Only clear/redraw changed regions
3. Use `requestAnimationFrame` for smooth 60 FPS
4. Disable image smoothing: `ctx.imageSmoothingEnabled = false`

## Documentation

All architecture and decisions are documented in `docs/`:
- Read `docs/README.md` first for overview
- Check `docs/adr/` for rationale behind technical choices
- Refer to `docs/architecture/` for implementation details

When making significant architectural changes, document them as new ADRs following the existing format.
