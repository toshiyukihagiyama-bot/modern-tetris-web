# Modern Tetris Web Game 🎮

A modern Tetris implementation built with TypeScript, Canvas 2D, and 2026 web development best practices.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Project Status

**Design Phase**: This project currently contains comprehensive architectural documentation and design specifications. Implementation is ready to begin.

## ✨ Features (Planned)

- 🎨 Modern Canvas 2D rendering with smooth 60 FPS gameplay
- 🎹 Responsive keyboard and touch controls
- 🔄 SRS (Super Rotation System) with wall kicks
- 🎲 Fair 7-bag piece generation algorithm
- 💾 Local storage for high scores and settings
- 📱 Responsive design for mobile and desktop
- 🎵 Sound effects and visual feedback
- ⏸️ Pause, hold piece, and ghost piece features

## 🏗️ Architecture

This project follows a **4-layer architecture** with strict separation of concerns:

```
┌─────────────────────────────────┐
│   Presentation Layer            │  Canvas Rendering, UI
├─────────────────────────────────┤
│   Application Layer             │  Game Loop, Input Handling
├─────────────────────────────────┤
│   Domain Layer                  │  Game State, Business Logic
├─────────────────────────────────┤
│   Infrastructure Layer          │  Board, Pieces, Core Components
└─────────────────────────────────┘
```

### Key Technical Decisions

- **TypeScript 5.x**: Type-safe development with strict mode
- **Canvas 2D API**: Optimal for 2D games (not WebGL)
- **Custom State Management**: ES Proxy + FSM (~2KB vs Redux ~50KB)
- **Vite**: Lightning-fast dev server (100ms startup, 50ms HMR)
- **Zero Dependencies**: Minimal bundle size, native browser APIs

See [docs/adr/](docs/adr/) for detailed Architecture Decision Records.

## 📚 Documentation

Comprehensive design documentation is available in the `docs/` folder:

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

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation (When Implementation Begins)

```bash
# Clone the repository
git clone https://github.com/yourusername/modern-tetris-web.git
cd modern-tetris-web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## 🎮 Game Controls (Planned)

| Action | Keys |
|--------|------|
| Move Left | ← or A |
| Move Right | → or D |
| Soft Drop | ↓ or S |
| Hard Drop | Space |
| Rotate Clockwise | ↑ or W or X |
| Rotate Counter-clockwise | Z or Ctrl |
| Hold Piece | C or Shift |
| Pause | P or Esc |

## 🎯 Core Game Logic

### Tetrominos

7 standard pieces with classic colors:
- **I** (Cyan) - 4×1 line
- **O** (Yellow) - 2×2 square
- **T** (Purple) - T-shape
- **S** (Green) - S-shape
- **Z** (Red) - Z-shape
- **J** (Blue) - J-shape
- **L** (Orange) - L-shape

### Scoring System

```
1 line:  100 × level
2 lines: 300 × level
3 lines: 500 × level
4 lines: 800 × level (Tetris!)

Hard drop: distance × 2 points
Soft drop: distance × 1 point
```

### 7-Bag Algorithm

Ensures fair piece distribution by shuffling all 7 pieces and dealing them in order, preventing long droughts or floods of any piece type.

## 🛠️ Technology Stack

| Category | Technology | Why? |
|----------|-----------|------|
| Language | TypeScript 5.x | Type safety, modern features |
| Build Tool | Vite | 10-50× faster than Webpack |
| Rendering | Canvas 2D API | Optimal for 2D games |
| State Management | Custom (Proxy + FSM) | Lightweight, 80% smaller |
| Testing | Vitest + Playwright | Fast, Vite-integrated |
| Architecture | Layered | Separation of concerns |

## 🎨 Design Philosophy

1. **Simplicity First**: Avoid over-engineering, YAGNI principle
2. **Type Safety**: Strict TypeScript, catch errors at compile time
3. **Performance**: 60 FPS target with memory optimization
4. **Maintainability**: Clear layer boundaries, testable components
5. **Modern Stack**: ES2022+, native ESM, minimal dependencies

## 📊 Performance Targets

- **Startup Time**: < 100ms (dev server)
- **HMR**: < 50ms (hot module replacement)
- **Frame Rate**: 60 FPS constant
- **Bundle Size**: < 20KB (minified + gzipped)
- **First Paint**: < 1s

## 🧪 Testing Strategy

- **Unit Tests**: Test each layer independently (Vitest)
- **Integration Tests**: Test full game flow (Playwright)
- **Performance Tests**: Monitor frame rate and memory usage

## 🤝 Contributing

This project is in the design phase. Once implementation begins:

1. Read the [architecture documentation](docs/README.md)
2. Review [CLAUDE.md](CLAUDE.md) for development guidelines
3. Follow the layer architecture strictly
4. Add tests for new features
5. Document significant decisions as ADRs

## 📝 License

MIT License - feel free to use this project for learning or building your own games!

## 🙏 Acknowledgments

This project's architecture is based on 2026 best practices gathered from:

- [JavaScript/TypeScript Game Engines in 2025](https://gamefromscratch.com/javascript-typescript-game-engines-in-2025/)
- [Stanford CS - Tetris Architecture](http://cslibrary.stanford.edu/112/Tetris-Architecture.html)
- [Modern State Management in Vanilla JavaScript: 2026 Patterns](https://medium.com/@orami98/modern-state-management-in-vanilla-javascript-2026-patterns-and-beyond-ce00425f7ac5)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

## 📬 Contact

Questions? Open an issue or start a discussion!

---

**Built with 🎮 and TypeScript**
