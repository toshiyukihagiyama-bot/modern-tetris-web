# Modern Tetris Web Game 🎮

A fully functional Tetris implementation built with TypeScript, Canvas 2D, and 2026 web development best practices.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Bundle Size](https://img.shields.io/badge/Bundle-6.01KB-brightgreen.svg)](https://bundlephobia.com/)

## 🎯 Project Status

**✅ IMPLEMENTATION COMPLETE**

This is a production-ready Tetris game with:
- **Bundle Size**: 6.01 KB (gzipped) - Well under the 20KB target
- **Performance**: Stable 60 FPS with dirty flag rendering
- **Type Safety**: 100% TypeScript strict mode, zero type errors
- **Deployment**: Firebase Hosting ([Play Now](https://tetris-game-2026.web.app))

## 🎮 Play Now

**Live Demo**: [https://tetris-game-2026.web.app](https://tetris-game-2026.web.app)

Or run locally:
```bash
npm install
npm run dev
# Open http://localhost:5173
```

## ✨ Implemented Features

- ✅ **Modern Canvas 2D Rendering** - 60 FPS with dirty flag optimization
- ✅ **Full Tetris Gameplay** - All 7 tetromino pieces (I, O, T, S, Z, J, L)
- ✅ **SRS Rotation System** - Simplified wall kicks for smooth rotation
- ✅ **7-Bag Algorithm** - Fair piece generation, no long droughts
- ✅ **Ghost Piece Preview** - See where your piece will land
- ✅ **Hold Piece Feature** - Save a piece for later
- ✅ **Next Piece Preview** - Plan your moves ahead
- ✅ **Responsive Controls** - DAS/ARR keyboard input with customizable timing
- ✅ **Progressive Difficulty** - Increasing speed with level progression
- ✅ **Score & Statistics** - Line clears, level tracking, Tetris bonus
- ✅ **Pause & Resume** - Full game state preservation
- ✅ **Game Over Detection** - Proper end-game handling
- ✅ **High-DPI Support** - Crisp rendering on retina displays

## 🏗️ Architecture

This project follows a **strict 4-layer architecture** with unidirectional dependencies:

```
┌────────────────────────────────────────┐
│   Presentation Layer                   │  Canvas 2D, DOM UI
│   ✓ Renderer.ts (300+ lines)          │
│   ✓ UIController.ts                   │
├────────────────────────────────────────┤
│   Application Layer                    │  Game Loop, Input
│   ✓ GameLoop.ts (RAF + accumulator)   │
│   ✓ InputHandler.ts (DAS/ARR)         │
│   ✓ GameController.ts                 │
├────────────────────────────────────────┤
│   Domain Layer                         │  Business Logic
│   ✓ GameActions.ts (400+ lines)       │
│   ✓ Store.ts (ES Proxy reactive)      │
│   ✓ EventBus.ts (Pub/Sub)             │
│   ✓ types.ts                          │
├────────────────────────────────────────┤
│   Infrastructure Layer                 │  Core Components
│   ✓ Board.ts (Uint8Array grid)        │
│   ✓ Piece.ts (SRS rotation)           │
│   ✓ PieceGenerator.ts (7-bag)         │
│   ✓ Matrix.ts, constants.ts           │
└────────────────────────────────────────┘
```

**Key Principle**: Dependencies flow downward only. Lower layers never import from upper layers.

### Key Technical Decisions

- ✅ **TypeScript 5.x** - Type-safe development with strict mode (zero `any` types)
- ✅ **Canvas 2D API** - Optimal for 2D games (not WebGL, simpler and sufficient)
- ✅ **Custom State Management** - ES Proxy + FSM (~2KB vs Redux ~50KB)
- ✅ **Vite 6.x** - Lightning-fast dev server (293ms startup)
- ✅ **Zero Runtime Dependencies** - Minimal bundle size, native browser APIs only
- ✅ **Firebase Hosting** - Global CDN with free tier

See [docs/adr/](docs/adr/) for detailed Architecture Decision Records.

## 📚 Documentation

### For Developers
- [CLAUDE.md](CLAUDE.md) - **AI-driven development guide** (Essential for AI assistants)
- [docs/README.md](docs/README.md) - Documentation index

### Architecture Documentation
- [📖 Overview](docs/architecture/overview.md) - System architecture and data flow
- [🧩 Components](docs/architecture/components.md) - Detailed component design
- [🔄 State Management](docs/architecture/state-management.md) - Reactive state with Proxy + FSM
- [🎨 Rendering](docs/architecture/rendering.md) - Canvas 2D optimization strategies

### Architecture Decision Records (ADR)
- [ADR 0001](docs/adr/0001-use-typescript.md) - Why TypeScript
- [ADR 0002](docs/adr/0002-use-canvas-2d.md) - Why Canvas 2D (not WebGL)
- [ADR 0003](docs/adr/0003-state-management-pattern.md) - State management pattern
- [ADR 0004](docs/adr/0004-architecture-pattern.md) - Layered architecture
- [ADR 0005](docs/adr/0005-use-vite.md) - Why Vite (not Webpack)

### Deployment
- [docs/deployment.md](docs/deployment.md) - Firebase Hosting deployment guide

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tetris-game-2026.git
cd tetris-game-2026

# Install dependencies
npm install

# Start development server (Vite)
npm run dev
# → Opens at http://localhost:5173

# Build for production
npm run build
# → Outputs to dist/ (6.01 KB gzipped)

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

### Deployment

```bash
# Deploy to Firebase Hosting
npm run build
firebase deploy --only hosting
```

## 🎮 Game Controls

| Action | Keys |
|--------|------|
| Move Left | ← or A |
| Move Right | → or D |
| Rotate Clockwise | ↑, W, or X |
| Rotate Counterclockwise | Z or Ctrl |
| Soft Drop | ↓ or S |
| Hard Drop (instant) | Space |
| Hold Piece | C or Shift |
| Pause / Resume | P or Esc |

## 🎯 Scoring System

| Achievement | Points |
|-------------|--------|
| Single Line | 100 × Level |
| Double Lines | 300 × Level |
| Triple Lines | 500 × Level |
| **Tetris** (4 Lines) | **800 × Level** |
| Soft Drop | 1 point per cell |
| Hard Drop | 2 points per cell |

## 🧪 Implementation Highlights

### Performance Optimizations

1. **Dirty Flag Rendering** - Only redraw when state changes
2. **Offscreen Canvas** - Static background pre-rendered once
3. **Uint8Array Grid** - Faster than regular arrays
4. **High-DPI Support** - devicePixelRatio scaling
5. **Optimized Context** - `alpha: false`, `desynchronized: true`

### State Management

**Reactive Store (ES Proxy)**:
```typescript
store.setState({ score: 100 });
// → All subscribers automatically notified
```

**Event Bus (Pub/Sub)**:
```typescript
eventBus.emit(GameEvent.LINE_CLEARED, 4);
eventBus.on(GameEvent.LINE_CLEARED, (lines) => {
  // Handle event anywhere
});
```

**Finite State Machine**:
```
MENU → PLAYING → PAUSED → PLAYING → GAME_OVER → MENU
```

### Code Quality

- ✅ **100% TypeScript** - Zero type errors, strict mode enforced
- ✅ **Layered Architecture** - Clean separation of concerns
- ✅ **No Runtime Dependencies** - Pure browser APIs
- ✅ **Path Aliases** - `@infrastructure`, `@domain`, etc.
- ✅ **Explicit Return Types** - All functions typed
- ✅ **DPR Scaling** - Retina display support

## 📁 Project Structure

```
src/
├── infrastructure/     # Core components (0 dependencies)
│   ├── constants.ts   # Game constants, piece shapes
│   ├── Matrix.ts      # 2D array utilities
│   ├── Piece.ts       # Tetromino with SRS rotation
│   ├── Board.ts       # 20×12 grid, collision detection
│   └── PieceGenerator.ts  # 7-bag algorithm
├── domain/            # Game logic (depends on infrastructure)
│   ├── types.ts       # GameState, enums
│   ├── EventBus.ts    # Pub/Sub event system
│   ├── Store.ts       # Reactive state management
│   └── GameActions.ts # All business logic (400+ lines)
├── application/       # Controllers (depends on domain)
│   ├── InputHandler.ts    # Keyboard with DAS/ARR
│   ├── GameLoop.ts        # requestAnimationFrame loop
│   └── GameController.ts  # Orchestrates all layers
├── presentation/      # UI (depends on all lower layers)
│   ├── Renderer.ts    # Canvas 2D rendering (300+ lines)
│   └── UIController.ts    # DOM management
└── main.ts           # Application bootstrap

docs/                 # Architecture documentation
├── architecture/     # Design documents
├── adr/             # Architecture Decision Records
└── deployment.md    # Firebase deployment guide

index.html           # HTML entry point
package.json         # Dependencies (minimal)
tsconfig.json        # TypeScript strict configuration
vite.config.ts       # Vite build configuration
firebase.json        # Firebase Hosting configuration
CLAUDE.md           # AI-driven development guide
```

## 🤖 AI-Driven Development

This project is optimized for AI-assisted development. See [CLAUDE.md](CLAUDE.md) for:

- Layer communication rules
- Common tasks workflow
- TypeScript strictness enforcement
- File organization patterns
- Adding features checklist

**AI assistants should always read CLAUDE.md first before making changes.**

## 🔧 Development Workflow

```bash
# Start dev server
npm run dev

# Type check (always run before committing)
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
npm run build && firebase deploy --only hosting
```

## 📊 Bundle Analysis

**Production Build Stats**:
- **JavaScript**: 21.25 KB (minified) → 6.01 KB (gzipped)
- **HTML**: 5.47 KB → 1.49 KB (gzipped)
- **Total**: ~7.5 KB (well under 20KB target)
- **Build Time**: ~483ms

## 🎨 Visual Features

- 3D cell shading effect
- Color-coded tetromino pieces
- Ghost piece preview (30% opacity)
- Grid lines for better visibility
- Smooth animations
- Game over modal
- Real-time score/level display

## 🚧 Future Enhancements

- [ ] Unit tests with Vitest
- [ ] High score persistence (localStorage)
- [ ] Sound effects and music
- [ ] Particle effects for line clears
- [ ] Touch controls for mobile
- [ ] Full SRS wall kick tables
- [ ] Settings persistence
- [ ] Multiple piece preview (3 pieces)
- [ ] Combo detection

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- SRS (Super Rotation System) - [Tetris Wiki](https://tetris.wiki/Super_Rotation_System)
- 7-Bag Algorithm - Standard Tetris piece generation
- Modern web best practices from 2026

## 🔗 Links

- **Live Demo**: [https://tetris-game-2026.web.app](https://tetris-game-2026.web.app)
- **Firebase Console**: [tetris-game-2026](https://console.firebase.google.com/project/tetris-game-2026)
- **Documentation**: [docs/](docs/)
- **AI Guide**: [CLAUDE.md](CLAUDE.md)

---

Built with ❤️ using TypeScript, Vite, and Canvas 2D.

**Production Ready** ✅ **60 FPS** ✅ **6.01 KB** ✅
