// Game controller - orchestrates all layers

import { Store } from '@domain/Store';
import { GameState, GameStatus } from '@domain/types';
import { EventBus } from '@domain/EventBus';
import { GameActions } from '@domain/GameActions';
import { Board } from '@infrastructure/Board';
import { PieceGenerator } from '@infrastructure/PieceGenerator';
import { InputHandler } from './InputHandler';
import { GameLoop } from './GameLoop';
import { BOARD_WIDTH, BOARD_HEIGHT, INITIAL_DROP_INTERVAL } from '@infrastructure/constants';

export class GameController {
  public readonly store: Store<GameState>;
  public readonly eventBus: EventBus;
  public readonly gameActions: GameActions;
  private readonly inputHandler: InputHandler;
  private readonly gameLoop: GameLoop;
  private readonly pieceGenerator: PieceGenerator;
  private renderCallback: (() => void) | null = null;

  constructor() {
    // Initialize core components
    this.eventBus = new EventBus();
    this.pieceGenerator = new PieceGenerator(1); // 1 piece preview

    // Create initial state
    const initialState: GameState = {
      status: GameStatus.MENU,
      board: new Board(BOARD_WIDTH, BOARD_HEIGHT),
      currentPiece: null,
      currentX: 0,
      currentY: 0,
      holdPiece: null,
      canHold: true,
      nextPieces: [],
      score: 0,
      lines: 0,
      level: 1,
      dropInterval: INITIAL_DROP_INTERVAL,
      lastDropTime: Date.now(),
      isDirty: true,
    };

    // Initialize store
    this.store = new Store(initialState);

    // Initialize game actions
    this.gameActions = new GameActions(this.store, this.eventBus, this.pieceGenerator);

    // Initialize input handler
    this.inputHandler = new InputHandler(this.gameActions);

    // Initialize game loop (renderCallback will be set later)
    this.gameLoop = new GameLoop(this.store, this.gameActions, this.inputHandler, () => {
      if (this.renderCallback) {
        this.renderCallback();
      }
    });
  }

  /**
   * Set the render callback
   */
  public setRenderCallback(callback: () => void): void {
    this.renderCallback = callback;
  }

  /**
   * Start a new game
   */
  public start(): void {
    this.gameActions.startGame();
    this.inputHandler.start();
    this.gameLoop.start();
  }

  /**
   * Pause the game
   */
  public pause(): void {
    const state = this.store.getState();
    if (state.status === GameStatus.PLAYING) {
      this.gameActions.pause();
    }
  }

  /**
   * Resume the game
   */
  public resume(): void {
    const state = this.store.getState();
    if (state.status === GameStatus.PAUSED) {
      this.gameActions.resume();
      this.gameLoop.reset();
    }
  }

  /**
   * Restart the game
   */
  public restart(): void {
    this.stop();
    this.start();
  }

  /**
   * Stop the game
   */
  public stop(): void {
    this.gameLoop.stop();
    this.inputHandler.stop();
  }

  /**
   * Toggle pause/resume
   */
  public togglePause(): void {
    const state = this.store.getState();
    if (state.status === GameStatus.PLAYING) {
      this.pause();
    } else if (state.status === GameStatus.PAUSED) {
      this.resume();
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stop();
    this.eventBus.clear();
    this.store.clearSubscribers();
  }
}
