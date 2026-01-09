// Main game loop using requestAnimationFrame

import { Store } from '@domain/Store';
import { GameState, GameStatus } from '@domain/types';
import { GameActions } from '@domain/GameActions';
import { InputHandler } from './InputHandler';

export class GameLoop {
  private animationId: number | null = null;
  private lastFrameTime: number = 0;
  private dropAccumulator: number = 0;

  constructor(
    private store: Store<GameState>,
    private gameActions: GameActions,
    private inputHandler: InputHandler,
    private renderCallback: () => void
  ) {}

  /**
   * Start the game loop
   */
  public start(): void {
    if (this.animationId !== null) {
      return; // Already running
    }

    this.lastFrameTime = performance.now();
    this.dropAccumulator = 0;
    this.loop(this.lastFrameTime);
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Main game loop
   */
  private loop(currentTime: number): void {
    this.animationId = requestAnimationFrame((time) => this.loop(time));

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Cap delta time to prevent spiral of death
    const cappedDeltaTime = Math.min(deltaTime, 100);

    this.update(cappedDeltaTime);
    this.render();
  }

  /**
   * Update game state
   */
  private update(deltaTime: number): void {
    const state = this.store.getState();

    // Only update if playing
    if (state.status !== GameStatus.PLAYING) {
      return;
    }

    // Update input (for DAS/ARR)
    this.inputHandler.update();

    // Handle automatic piece dropping (gravity)
    this.dropAccumulator += deltaTime;

    if (this.dropAccumulator >= state.dropInterval) {
      this.gameActions.moveDown();
      this.dropAccumulator -= state.dropInterval;

      // Prevent accumulator from getting too large
      if (this.dropAccumulator > state.dropInterval) {
        this.dropAccumulator = 0;
      }
    }
  }

  /**
   * Render the game
   */
  private render(): void {
    const state = this.store.getState();

    // Only render if dirty (state has changed)
    if (state.isDirty) {
      this.renderCallback();
      // Reset dirty flag
      this.store.setState({ isDirty: false });
    }
  }

  /**
   * Reset the loop state
   */
  public reset(): void {
    this.lastFrameTime = performance.now();
    this.dropAccumulator = 0;
  }
}
