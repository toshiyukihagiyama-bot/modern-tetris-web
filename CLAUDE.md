# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other AI assistants when working with this repository.

## Project Status

**IMPLEMENTATION COMPLETE** ✅

This is a fully implemented Tetris web game built with TypeScript, Vite, and Canvas 2D. The project follows a strict 4-layer architecture with complete separation of concerns.

**Production Build**: 6.01 KB (gzipped) - Well under the 20KB target
**Performance**: 60 FPS stable
**Deployment**: Firebase Hosting (modern-tetris-2026)

## Quick Start for AI Assistants

When working with this codebase, you should:

1. **Understand the Architecture First**: Review the 4-layer structure below
2. **Follow Layer Rules**: Never violate unidirectional dependency flow
3. **Read Existing Code**: Always read files before suggesting changes
4. **Maintain Type Safety**: All TypeScript strict mode rules must be followed
5. **Test Changes**: Run `npm run dev` to verify changes work

## AI-Driven Development Best Practices

### When Asked to Add Features

1. **Plan First**: Use plan mode for non-trivial changes
2. **Identify Layer**: Determine which layer the feature belongs to
3. **Check Dependencies**: Ensure you don't violate layer rules
4. **Read Similar Code**: Look for existing patterns to follow
5. **TypeScript Check**: Run `npx tsc --noEmit` before completion

### When Asked to Fix Bugs

1. **Reproduce First**: Understand the bug by reading relevant code
2. **Identify Root Cause**: Don't just treat symptoms
3. **Minimal Changes**: Fix only what's broken
4. **Test the Fix**: Verify the bug is resolved

### When Asked to Refactor

1. **Understand Why**: Get clear rationale for the refactor
2. **Scope Assessment**: Identify all files that need changes
3. **Maintain Tests**: Ensure existing tests still pass
4. **No Behavior Change**: Refactoring should not change functionality

## Architecture

### 4-Layer Architecture (IMPLEMENTED)

The codebase follows a strict layered architecture pattern with unidirectional dependencies:

```
Presentation Layer (UI)
    ↓ (reads from)
Application Layer (Controllers)
    ↓ (orchestrates)
Domain Layer (Game Logic)
    ↓ (uses)
Infrastructure Layer (Core Components)
```

**Critical Rule**: Dependencies flow DOWNWARD only. Lower layers never import from upper layers.

### Implemented Files

**Presentation Layer** (`src/presentation/`):
- ✅ `Renderer.ts` (300+ lines) - Canvas 2D rendering with dirty flag optimization
- ✅ `UIController.ts` - DOM element management, button handlers

**Application Layer** (`src/application/`):
- ✅ `GameLoop.ts` - requestAnimationFrame loop with accumulator pattern
- ✅ `InputHandler.ts` - Keyboard input with DAS/ARR timing
- ✅ `GameController.ts` - Orchestrates all layers, lifecycle management

**Domain Layer** (`src/domain/`):
- ✅ `types.ts` - GameState, GameStatus, GameEvent enums
- ✅ `GameActions.ts` (400+ lines) - All business logic
- ✅ `Store.ts` - Reactive state management with subscribers
- ✅ `EventBus.ts` - Pub/Sub event system

**Infrastructure Layer** (`src/infrastructure/`):
- ✅ `constants.ts` - All game constants, piece shapes, colors
- ✅ `Matrix.ts` - 2D array utilities
- ✅ `Piece.ts` - Tetromino pieces with SRS rotation
- ✅ `Board.ts` - 20×12 grid with Uint8Array, collision detection
- ✅ `PieceGenerator.ts` - 7-bag algorithm

**Entry Point**:
- ✅ `src/main.ts` - Application bootstrap

## Key Architectural Decisions

All documented in `docs/adr/`:

1. **TypeScript**: Strict mode, ES2022 target
2. **Canvas 2D API**: Not WebGL (simpler, sufficient for 2D)
3. **Custom State Management**: ES Proxy + FSM (~2KB vs Redux ~50KB)
4. **Vite**: 10-50x faster than Webpack
5. **Layered Architecture**: Strict separation of concerns

## State Management Pattern

**Finite State Machine**:
```
MENU → PLAYING → PAUSED → PLAYING → GAME_OVER → MENU
```

**Reactive Store** (ES Proxy pattern):
```typescript
store.setState({ score: 100 });  // Auto-notifies subscribers
```

**Event Bus** (Pub/Sub for loose coupling):
```typescript
eventBus.emit(GameEvent.LINE_CLEARED, 4);
eventBus.on(GameEvent.LINE_CLEARED, (lines) => {
  // Handle event in any layer
});
```

## Core Game Logic

### Board (Infrastructure)
- 20 rows × 12 columns
- Uint8Array for performance
- `isValidPosition(piece, x, y)` - collision detection
- `clearLines()` - line clearing algorithm
- `getHardDropDistance()` - ghost piece calculation

### Pieces (Infrastructure)
- 7 types: I, O, T, S, Z, J, L
- SRS rotation with simplified wall kicks
- 4 rotation states per piece
- Shape data in `constants.ts`

### Piece Generation (Infrastructure)
- 7-bag algorithm (Fisher-Yates shuffle)
- Ensures fair distribution
- No piece drought > 12 pieces

### Scoring (Domain)
```
1 line:  100 × level
2 lines: 300 × level
3 lines: 500 × level
4 lines: 800 × level (Tetris!)
Hard drop: distance × 2
Soft drop: distance × 1
```

### Input Controls
- Arrow keys / WASD: movement
- Space: hard drop
- ↑/W/X: rotate clockwise
- Z/Ctrl: rotate counterclockwise
- C/Shift: hold piece
- P/Esc: pause

### Performance Optimizations (Implemented)
1. ✅ **Dirty Flag**: Only re-render when `isDirty` is true
2. ✅ **Offscreen Canvas**: Static background pre-rendered
3. ✅ **Typed Arrays**: Uint8Array for board grid
4. ✅ **DPR Scaling**: High-DPI display support
5. ✅ **Context Settings**: `alpha: false`, `desynchronized: true`

## Development Guidelines for AI

### Layer Communication Rules

**✅ ALLOWED**:
```typescript
// Upper → Lower (direct imports)
import { Board } from '@infrastructure/Board';

// Any layer → EventBus
eventBus.emit(GameEvent.LINE_CLEARED, lines);
eventBus.on(GameEvent.LINE_CLEARED, handler);

// Any layer → Store (subscribe)
store.subscribe(state => {});
```

**❌ FORBIDDEN**:
```typescript
// Lower → Upper (NEVER)
// Infrastructure importing from Domain
import { GameActions } from '@domain/GameActions'; // ❌ NO!

// Renderer calling GameActions directly
renderer.onLineCleared(lines); // ❌ NO! Use EventBus instead
```

### Business Logic Placement

**Domain Layer ONLY**:
- All game rules
- Scoring calculations
- Piece spawning logic
- Win/lose conditions
- State transitions

**Presentation Layer NEVER**:
- No game logic
- Only rendering
- Only visual state (not game state)

### Adding New Features (AI Workflow)

1. **Identify Layer**: Where does this feature belong?
   - New piece type → Infrastructure (Piece, constants)
   - New scoring rule → Domain (GameActions)
   - New visual effect → Presentation (Renderer)
   - New input → Application (InputHandler)

2. **Check Dependencies**:
   - Can this layer access what it needs?
   - Am I violating layer rules?

3. **Read Existing Code**:
   - Find similar features
   - Follow the same pattern
   - Maintain consistency

4. **Update Types**:
   - Add to `types.ts` if needed
   - Update interfaces
   - Ensure type safety

5. **Test Locally**:
   ```bash
   npm run dev
   npx tsc --noEmit
   ```

### Common Tasks for AI

#### Adding a New Piece Type
1. Add to `PieceType` enum in `constants.ts`
2. Add color to `PIECE_COLORS`
3. Add 4 rotation states to `PIECE_SHAPES`
4. No other changes needed (system is data-driven)

#### Adding a New Input Binding
1. Add key code to `KeyCode` enum in `constants.ts`
2. Add case in `InputHandler.handleKeyAction()`
3. Add to UI hints in `index.html`

#### Adding a New Game Event
1. Add to `GameEvent` enum in `types.ts`
2. Emit from Domain layer at appropriate time
3. Subscribe in Presentation/Application as needed

#### Changing Scoring
1. Modify `SCORE_VALUES` in `constants.ts` for line scores
2. Modify `GameActions.calculateLineScore()` if logic changes
3. Update documentation in this file

## TypeScript Strictness (ENFORCED)

**tsconfig.json rules**:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- All functions must have explicit return types
- No `any` types allowed

**AI must follow**:
```typescript
// ✅ Good
public moveLeft(): void {
  // ...
}

// ❌ Bad
public moveLeft() {  // Missing return type
  // ...
}
```

## File Path Aliases

Use TypeScript path aliases for imports:

```typescript
// ✅ Good
import { Board } from '@infrastructure/Board';
import { GameActions } from '@domain/GameActions';
import { Renderer } from '@presentation/Renderer';
import { GameController } from '@application/GameController';

// ❌ Bad (relative paths across layers)
import { Board } from '../../infrastructure/Board';
```

## Testing Strategy

### Unit Tests (Vitest) - Not Yet Implemented

When adding tests:

```typescript
// Infrastructure Layer (no mocks needed)
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
    const actions = new GameActions(mockStore, eventBus, generator);
    actions.moveLeft();
    expect(mockStore.getState().currentX).toBe(4);
  });
});
```

## Commands for AI to Use

### Development
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npx tsc --noEmit     # Check TypeScript errors
```

### Deployment
```bash
firebase deploy --only hosting   # Deploy to Firebase
```

## Project Structure

```
src/
├── infrastructure/  # Core components (no dependencies on upper layers)
│   ├── constants.ts
│   ├── Matrix.ts
│   ├── Piece.ts
│   ├── Board.ts
│   └── PieceGenerator.ts
├── domain/         # Game logic (depends on infrastructure only)
│   ├── types.ts
│   ├── EventBus.ts
│   ├── Store.ts
│   └── GameActions.ts
├── application/    # Controllers (depends on domain + infrastructure)
│   ├── InputHandler.ts
│   ├── GameLoop.ts
│   └── GameController.ts
├── presentation/   # UI (depends on all lower layers)
│   ├── Renderer.ts
│   └── UIController.ts
└── main.ts        # Entry point (depends on all layers)

docs/
├── architecture/   # Design documents
│   ├── overview.md
│   ├── components.md
│   ├── state-management.md
│   └── rendering.md
├── adr/           # Architecture Decision Records
│   ├── 0001-use-typescript.md
│   ├── 0002-use-canvas-2d.md
│   ├── 0003-state-management-pattern.md
│   ├── 0004-architecture-pattern.md
│   └── 0005-use-vite.md
└── deployment.md  # Deployment guide

index.html         # HTML entry point with canvas and UI
package.json       # Dependencies and scripts
tsconfig.json      # TypeScript configuration (strict mode)
vite.config.ts     # Vite build configuration
firebase.json      # Firebase Hosting configuration
.firebaserc        # Firebase project reference
```

## Design Philosophy

1. **YAGNI**: Build only what's needed now
2. **Simplicity over Cleverness**: Clear code > clever code
3. **Zero Dependencies**: Use native browser APIs (no jQuery, no Lodash)
4. **Type Safety**: TypeScript strict mode catches bugs early
5. **Performance**: 60 FPS target, measure before optimizing
6. **Testability**: Each layer testable in isolation

## Important Implementation Notes

### SRS Rotation System (Simplified)

Current implementation uses simplified wall kicks:
```typescript
const wallKickOffsets = [
  { x: -1, y: 0 },  // Try left
  { x: 1, y: 0 },   // Try right
  { x: 0, y: -1 },  // Try up
  { x: -2, y: 0 },  // Try far left
  { x: 2, y: 0 },   // Try far right
];
```

For full SRS, see: https://tetris.wiki/Super_Rotation_System

### Memory Management

**Current approach**:
- Pieces are created fresh (no pooling yet)
- EventBus listeners cleaned up on destroy
- Store subscribers cleared on reset

**Future optimization** (if needed):
- Object pooling for Piece instances
- Pre-allocated particle arrays
- Texture atlases for rendering

### Canvas Rendering Optimization

**Implemented**:
- Offscreen canvas for static background
- Dirty flag prevents unnecessary redraws
- High-DPI display support (devicePixelRatio)
- Context options: `alpha: false`, `desynchronized: true`

**Not needed yet**:
- Layer separation (multiple canvases)
- Region-based redrawing
- Web Workers for computation

## AI-Specific Reminders

When Claude Code (or other AI assistants) works on this project:

### Before Making Changes
1. ✅ Read the file you're about to modify
2. ✅ Check which layer the file is in
3. ✅ Verify you can access needed dependencies
4. ✅ Look for similar patterns in existing code

### When Writing Code
1. ✅ Add explicit return types to all functions
2. ✅ Use path aliases (@infrastructure, @domain, etc.)
3. ✅ Follow existing naming conventions
4. ✅ Add comments for complex logic

### After Making Changes
1. ✅ Run `npx tsc --noEmit` to check types
2. ✅ Test with `npm run dev`
3. ✅ Verify no layer rules violated
4. ✅ Update this file if architecture changes

### Never Do
- ❌ Add dependencies without asking (keep it dependency-free)
- ❌ Violate layer boundaries
- ❌ Use `any` type
- ❌ Remove TypeScript strict mode
- ❌ Add runtime dependencies (lodash, moment, etc.)

## Documentation

All architecture and decisions are documented in `docs/`:
- `docs/README.md` - Overview and index
- `docs/adr/` - Architecture Decision Records
- `docs/architecture/` - Implementation details
- `docs/deployment.md` - Firebase deployment guide

When making significant architectural changes, document them as new ADRs following the existing format.

## Contact & Deployment

**Firebase Project**: modern-tetris-2026
**Production URL**: https://modern-tetris-2026.web.app
**Account**: toshiyuki.hagiyama@aozora-cg.com

This file was last updated after full implementation completion.
