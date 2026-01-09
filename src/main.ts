// Main entry point - bootstrap the application

import { GameController } from '@application/GameController';
import { Renderer } from '@presentation/Renderer';
import { UIController } from '@presentation/UIController';

/**
 * Initialize and start the Tetris game
 */
function main(): void {
  try {
    // Get canvas elements
    const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    const nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
    const holdCanvas = document.getElementById('hold-canvas') as HTMLCanvasElement;

    if (!gameCanvas || !nextCanvas || !holdCanvas) {
      throw new Error('Canvas elements not found');
    }

    // Create game controller
    const gameController = new GameController();

    // Create renderer
    const renderer = new Renderer(gameCanvas, nextCanvas, holdCanvas);

    // Create UI controller (sets up button event listeners)
    new UIController(gameController);

    // Set render callback
    gameController.setRenderCallback(() => {
      const state = gameController.store.getState();
      renderer.render(state);
    });

    // Initial render
    const initialState = gameController.store.getState();
    renderer.render(initialState);

    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('Game error:', event.error);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      gameController.destroy();
    });

    // Log successful initialization
    console.log('Tetris Game 2026 initialized successfully');
    console.log('Controls:');
    console.log('  ← → : Move');
    console.log('  ↑ / Z : Rotate');
    console.log('  ↓ : Soft Drop');
    console.log('  Space : Hard Drop');
    console.log('  C : Hold');
    console.log('  P : Pause');
  } catch (error) {
    console.error('Failed to initialize game:', error);
    alert('Failed to initialize game. Please refresh the page.');
  }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
